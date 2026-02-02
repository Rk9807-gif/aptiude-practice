"use server"
import askGemini from "@/gemini/gemini.util";
import { serverClient } from "@/supabase/server";
import { cookies } from "next/headers";
import * as fs from 'fs' ;
import { SupabaseClient } from "@supabase/supabase-js";
import { error } from "console";

export async function synthesizeFile(fileRecord) {


    const cookieStore = await cookies();
    const client = serverClient(cookieStore);

    const { data: blob, error: storageError } = await client.storage
        .from("Material")
        .download(fileRecord.file_path);

    if (storageError) {
        console.error(" Storage Error:", storageError.message);
        throw new Error(storageError.message);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
  

    const extension = fileRecord.file_name.split(".").pop().toLowerCase();
    const mimeType = extension === 'pdf' ? 'application/pdf' : `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    try {
        const response = await askGemini.models.generateContent({
            model: 'gemini-2.5-flash',
            config: { response_mime_type: 'application/json' },
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { data: base64Data, mimeType: mimeType } }
                ]
            }]
        });

        const rawResponse = response.text;

        let synthesizedData;

        try {

            synthesizedData = JSON.parse(rawResponse);

        } catch (parseError) {
            console.error("❌ JSON Parse Failed.");
            console.error("Raw response snippet:", rawResponse.substring(0, 100) + "...");
            const cleanJson = rawResponse
            .replace(/^```json\s*/g, "") // Remove opening ```json
            .replace(/```\s*$/g, "")     // Remove closing ```
            .trim();

            synthesizedData = JSON.parse(cleanJson);

        
            if (!cleanJson.endsWith(']') && !cleanJson.endsWith('}')) {
                console.error("🚨 The AI response was truncated! It didn't finish the JSON.");
            }
            throw new Error("Invalid JSON format from AI");
        }

        const { error: updateError } = await client
            .from('Material')
            .update({
                status: "processed"
            })
            .eq("id", fileRecord.id);

        if (updateError) {
            console.error("❌ Material Update Error:", updateError.message);
            throw new Error(updateError.message);
        }

        const { error: uploadError } = await client.from("Question").insert(synthesizedData);

        if (uploadError) {
            console.error("❌ Question Insert Error:", uploadError.message);
        } else {
            console.log("🎉 All steps completed successfully!");
        }

    } catch (err) {
        console.error("💥 CRITICAL FAILURE in AI or Database step:", err);
        throw err;
    }
}


const prompt = 
`Act as a Quantitative Aptitude Data Synthesizer. Your task is to extract questions from provided documents and map them into a JSON list that strictly adheres to the following PostgreSQL schema and logic constraints:
### 1. Database Schema Alignment
Each object in the JSON list must represent a row for this table:
- category: text (lowercase umbrella term)
- stem: text (the question body)
- type: text (mcq, msq, or single_input)
- options: jsonb (key-value pairs for choices PLUS a "correct" key containing an ARRAY of strings)
- explanation: text (step-by-step solution)
- metadata: jsonb (contains "topic" and "source_id")
### 2. Categorization Logic (Lowercase Only)
- Dynamic Umbrella Categories: Identify a functional umbrella for the 'category' field. Use only: [proportions & ratios, measurement & geometry, algebraic operations, number systems]. Dynamically create others if necessary, but keep them in lowercase.
- Sub-topic Metadata: Use the 'metadata.topic' field for granular details (e.g., "approximation", "kinematics/boat & stream"). All metadata values must be lowercase.
### 3. Options & Answer Logic
- Input with Options: Map to 'mcq' (one correct) or 'msq' (multiple correct). 
- Options Object Format:
  {
    "a": "Value 1",
    "b": "Value 2",
    "correct": ["a"] 
  }
- Constraint: The "correct" key MUST be an array of strings, even for single answers. 
- Input without Options: Set type to 'single_input'. The options object must be: {"correct": ["exact_value"]}.

### 4. Output Format
Return ONLY a raw JSON array. Do not use Markdown backticks or the word 'json'. If you reach your output limit, end the JSON array properly at the last complete object."
Return ONLY a valid JSON list of objects. Do not include prose or markdown commentary.`

