import {createServerClient} from "@supabase/ssr"
import { createBrowserClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const serverClient = (cookieStore) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // This is expected if called from a Server Component.
            // Server Components cannot set cookies directly.
          }
        },
      },
    }
  );
};


export const browserClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );

export const middlewareClient = (request) => {
 
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

 
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
 
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      );

      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      );
    },
      },
    }
  );

  return { supabase, supabaseResponse };
};