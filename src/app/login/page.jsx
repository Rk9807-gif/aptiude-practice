"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "./auth.action";

function LoginComponent(){

    const router = useRouter();
    const searchParams = useSearchParams();
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handelAction = async (action) => {

        if (mail.trim() === "" || password.trim() === ""){
            setMessage("Email or Password is missing");
            return ;
        }
       
        let result = undefined;
        const loginDetails = {email: mail, password: password}
        
        try{
            switch (action){
            case "signIn" :        
                result = await signIn(loginDetails) ;
                break ;
            case "signUp" :
                result = await signUp(loginDetails) ;
                break;
            }

            if(result === "authenticated"){
                router.replace(searchParams.get("redirect") || "/")
            }else{
                const errorMessage = typeof result === "object" ? result.message : result;
                setMessage(errorMessage || "An unknown error occurred");
            }
        }catch(err){
            setMessage(err.message || "Something went wrong");
        }
    }


    return (
    <div className="max-w-sm bg-neutral-900 p-8 rounded-2xl border border-neutral-700/50 text-center shadow-xl">
        <h1 className="text-3xl text-neutral-50 font-semibold mt-4">
            Welcome Back
        </h1>
        <h5 className="text-neutral-400 text-sm mt-2 mb-8">
            Sign in to your account or create a new one
        </h5>
        
        <input 
            placeholder="Email" 
            onChange={(e) => setMail(e.target.value)} 
            className="my-2 w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" 
            type="email" 
            value={mail}
        />
        
        <input 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            className="my-2 w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" 
            type="password" 
            value={password}
        />

        <div className="my-6 flex gap-3">
            <button 
                className="bg-violet-600 text-white font-bold w-full rounded-xl p-4 hover:bg-violet-500 active:scale-[0.98] transition-all"
                onClick={() => handelAction("signIn")}
            >
                Sign In
            </button>
            <button 
                className="bg-neutral-800 text-neutral-200 w-full rounded-xl p-4 border border-neutral-700 hover:bg-neutral-700 active:scale-[0.98] transition-all"
                onClick={() => handelAction("signUp")}
            >
                Sign Up
            </button>
        </div>

        {message && (
            <p className="p-4 w-full bg-black/40 border border-neutral-800 rounded-xl text-xs text-neutral-500 italic">
                {message}
            </p>
        )}
    </div>
)
}

export default function Login() {
    return (
        <Suspense fallback={<div className="text-white">Loading Auth...</div>}>
            <LoginComponent />
        </Suspense>
    )
}