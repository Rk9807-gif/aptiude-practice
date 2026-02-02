"use server"

import { serverClient } from "@/supabase/server"
import { cookies } from 'next/headers';
import { synthesizeFile } from "./synthesize.action";

export async function syncMaterialRecoard({file_path, file_name}) {

    const cookieStore = await cookies();
    const client = serverClient(cookieStore);

    const {data : {user} = {}} = await client.auth.getUser();

    if (!user){
        return {error : error.message};
    }

    const {data , error} = await client.from("Material").insert({
        file_name : file_name ,
        file_path : file_path ,
        status : "processing" ,
        user_id : user.id}).select().single();  

    if (error){
        return {error : error.message};
    }

    return {data : "success"};
}