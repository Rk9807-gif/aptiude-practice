"use client";

import { browserClient } from "@/supabase/server";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const routes = [
  { name: "Home", path: "/" },
  { name: "Playground", path: "/study-plan" },
  { name: "Repository", path: "https://github.com/Rk9807-gif/aptiude-practice" },
];


export default function Navbar(){

  const currentPath = usePathname();

  const router = useRouter(); // Initialize the router

  const handleSignOut = async () => {
    const client = browserClient();
    const { error } = await client.auth.signOut();
    
    if (!error) {

      router.push('/login');
      
    } else {
      console.error("Error signing out:", error.message);
    }
  };
 

  return(
    <nav className="grid w-full grid-cols-[200_1fr_auto] max-h-20">
    
       <Title/>
  
      <div className="grid">
        <ul className="flex justify-center gap-8 p-2 my-auto font-bold cursor-pointer">
          {
            routes.map(route => 

              <li key={route.path}>
                <Link className={`px-6 py-3  rounded-full transition-all duration-300 ease
                  ${currentPath === route.path ?
                      "text-blue-400 font-extrabold bg-slate-950" :
                      "text-zinc-600 hover:text-white hover:font-extrabold"
                  }`}
                  href={route.path}
                >
                  {route.name}
                </Link>
              </li>
            )
          }    
        </ul>
      </div>
      <div className="grid mx-2 w-30">
        <button className="my-auto bg-blue-900/60 my-auto py-2 px-4 rounded-sm font-bold text-zinc-300 hover:scale-101 active:scale-99"
          onClick={handleSignOut}
        >
          Log Out
        </button> 
      </div>
    </nav>
  );
}

function Title(){
  return(
    <div className="dark:text-zinc-100 text-2xl/5 text-right font-extrabold my-auto p-2">
      Aptitude Test <br />
      <span className="align-super text-lg text-blue-600"> By </span>
      Rugved
    </div>
  )
}