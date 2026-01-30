import Navbar from "@/components/navbar";
import Image from "next/image";



export default function Home() {
  return (
      <div className="w-full flex place-items-center">
        <div className="w-2/3 m-auto">
          <h1 className="text-4xl font-extrabold my-10">
            Weclome To My Aptitude Testing Platform
          </h1>
          <div className="w-2/3 text-justify leading-relaxed [&>p]:my-2">
            <p>
              I built this platform as a personal Next.js starter project to change how I prepare for aptitude tests.
              While practicing in a notebook is the traditional way, it’s hard to stay organized or see real progress over time. 
              This tool allows me—and you—to move away from paper and into a digital environment that actually mimics the pressure of real company assessments and technical interviews. 
            </p>
            <p>
              The main goal here is to make practice more efficient and data-driven. 
              You can upload your own question lists directly from Excel or PDF files, 
              transforming static documents into an interactive practice session. Instead of just solving problems, 
              the platform uses analytics to keep track of every question you’ve finished, helping you visualize your improvement and focus on the areas where you need the most work. 
              Since it’s hosted on GitHub, you’re free to use my version or clone it to host and customize your own.
            </p>
          </div>
        </div>
      </div>
  
  );
}





function Upload(){
  return(
    <div className="object-cover aspect-3/2 bg-neutral_">
      
    </div>
  )
}

function Card(){
  return(
    <div className="bg-neutral-800 rounded-xl p-6">
      Most Recent Questions
    </div>
  );
}



