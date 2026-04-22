import { browserClient } from "@/supabase/serverUtility";
import { useRouter } from "next/router";

export async function signIn({email, password}) {
   
    const client = browserClient();

    const { error: signInError } = await client.auth.signInWithPassword({
        email ,
        password
    });

    if (signInError){
        return signInError.message;
    }

    return "authenticated"
}

export async function signUp({email, password}) {

    const client = browserClient();

    const { error: signUpError } = await client.auth.signUp({
        email ,
        password ,
        options: {
            emailRedirectTo: `${window.location.origin}/login`,
        },

    });

    if (signUpError){
        return `Sign Up Failed : ${signUpError.message}`;
    }

    return "Varification Mail has been send successfully"
    
}