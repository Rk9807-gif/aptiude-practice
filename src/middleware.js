import { NextResponse } from "next/server";
import { middlewareClient } from "./supabase/server";

export async function middleware(request) {

    const { pathname } = request.nextUrl;

    const publicPages = [
        '/' ,
        '/login'
    ]

    const { supabase, supabaseResponse } = middlewareClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !publicPages.includes(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse
    
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};