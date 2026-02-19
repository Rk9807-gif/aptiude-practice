"use server"

import { serverClient } from "@/supabase/serverUtility"
import { cookies } from 'next/headers';
import { processFileList } from "./synthesize.action";




export async function uploadFileWithSync(fileList) {
    console.log("Files recived", fileList.length)
    const cookieStore = await cookies();
    const client = serverClient(cookieStore);

    const {data : {user} , error : authError } = await client.auth.getUser();
 
    if (authError) {
        return new Error("Authentication Error : ", authError.message);
    }

    const { data : storageResult , error : storageError } = await client
        .from("Material")
        .insert(fileList.map((file) => ({ 
            file_name : file.name ,
            file_path : `${user.id}/${file.name}` ,
            status : "processing" ,
            user_id : user.id
        })
    ))

    const uploadPromises = Array.from(fileList).map(async (file)=> {
        try{
            const { data , error: buketError } = await client
                .storage.from("Material")
                .upload(`${user.id}/${file.name}`, file);

                if (buketError){
                    throw {
                        error : buketError , 
                        path : `${user.id}/${file.name}` , 
                        name : file.name ,
                        success : false
                    } ; 
                }

            return { file : file.name , success : true }

        }catch(buketError){
            await client.from("Material").delete().in("file_path", buketError.path);
            delete buketError.path

            return {buketError} ;
        }
    });

    const uploadedFiles =  await Promise.all(uploadPromises); 

    const cleanFileList = fileList.filter(file => {

        const hasError = uploadPromises.some(err => err.name === file.name);
  
        // Return true if it does NOT have an error
        return !hasError;
    });

    const synthesisResult = await processFileList(cleanFileList);

    return uploadedFiles
    

}

