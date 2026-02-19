"use client"; 

import { createContext, useState, useEffect } from "react";
import { browserClient } from "@/supabase/serverUtility";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [logged, setLogged] = useState(false);

    useEffect(()=>{

        const clinet = browserClient();

        clinet.auth.getSession().then(({ data }) => 
        setLogged(!!data.session?.user)
        );

        const { data : { subscription } } = clinet.auth.onAuthStateChange((e , session) =>
        setLogged(!!session?.user)
        );

        return () => subscription.unsubscribe();

    },[]);
    return (
        <AppContext.Provider value={{ logged }}>
        {children}
        </AppContext.Provider>
    );
}