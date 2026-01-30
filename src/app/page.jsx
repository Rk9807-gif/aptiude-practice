import Image from "next/image";

const routes = [ "Home", " Problems", "Study Plan", " Contact Us"]


export default function Home() {
  return (
    <div className="grid grid-flow-rows min-h-screen bg-zinc-100 font-sans dark:bg-black p-1">
      <Navbar/>
      <div className="my-auto">
        <h1 className="text-4xl font-extrabold">
        Weclome To My Aptitude Testing Platform
        </h1>
      </div>
    
    </div>
  );
}

function Navbar(){

  return(
    <nav className="grid w-full grid-cols-[auto_1fr_auto] max-h-20">
    
       <Title/>
  
      <div className="grid">
        <ul className="flex justify-center gap-8 p-2 my-auto font-bold cursor-pointer">
          {
            routes.map(i => 
              <li key={i} className="px-6 py-1 text-zinc-600 border-2 rounded-full hover:text-white hover:font-extrabold transition-all duration-300 ease">
                {i}
              </li>
            )
          }    
        </ul>
      </div>
      <div className="grid w-40">
          h
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