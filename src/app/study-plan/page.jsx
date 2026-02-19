"use client"
import { useState ,useEffect, act, useContext } from "react";
import { browserClient } from "@/supabase/serverUtility";
import { uploadFileWithSync } from "./handelMaterial.actions"
import { processFileList, synthesizeFile } from "./synthesize.action";
import { AppContext } from "../provider";


function getDate(){
    const data = new Date();
    const formated = new Intl.DateTimeFormat('en-In',{
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(data)

    return formated
}


export default function Page(){

    const [currentTopic, setCurrentTopic] = useState(null);

    return(
        <div className="grid grid-cols-[auto_1fr_auto]">

            <Sidebar set={setCurrentTopic} active={currentTopic}/>

            <QuestionSection active={currentTopic}>
            </QuestionSection>
  
            <div className="m-2 grid grid-rows-[1fr_auto] gap-4">
              <ResourceManager/> 
            </div>
            
        </div>
        
    );
}

function Heatmap(){
    return(
        <div className="bg-slate-950 border-white/15 border-1 w-fit p-3 rounded-lg text-zinc-400">
            <h1 className="font-bold">
                Daily Question HeatMap
            </h1>
            <div className="grid grid-cols-[auto_1fr] my-3 gap-2">
                <div className="grid grid-rows-7 gap-1 text-xs font-bold text-justify leading-none">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                <div className="grid grid-rows-7 grid-flow-col w-fit gap-1">
                  {[...Array(90)].map((i)=> <div key={i} className="bg-white/10 size-3 last:bg-blue-600/20"></div> )}
                </div>
                
            </div>
            <div className="text-sm">
                {getDate()}
            </div>
        </div>
    );
}



function FileUpload({externalUpload}) {
  const [isDragging, setIsDragging] = useState(false);
  const [expand, setExpand] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    externalUpload(prev => [...prev , ...files]);
    setExpand(false);
    e.dataTransfer.clearData();
  };

  return (
    <>

      <button className="block bg-blue-900/60 w-full py-3 rounded-full text-lg hover:scale-101 active:scale-99"
        onClick={()=>setExpand(true)}
      >
        Upload
      </button>

      {expand && 
        <div className="fixed inset-0 grid place-items-center backdrop-blur"
          onClick={()=>setExpand(false)}
        >
          <div className="size-100 bg-neutral-900 rounded-xl p-6"
            onClick={(e)=>e.stopPropagation()}
          >
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative size-full border-2 border-dashed rounded-xl transition-all duration-200
                flex flex-col items-center justify-center cursor-pointer
                ${isDragging 
                  ? "border-blue-500 bg-blue-500/10 scale-[1.02]" 
                  : "border-neutral-700 bg-neutral-800/50 hover:border-neutral-500"}
              `}
            >
              {/* Hidden Input */}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e)=>{
                  const files = Array.from(e.target.files);
                  externalUpload(prev => [...prev , ...files]);
                  setExpand(false);
                  e.target.value = "";
                }}
              />

              {/* Custom UI */}
              <div className="text-center pointer-events-none">
                <p className={`text-sm ${isDragging ? "text-blue-400" : "text-neutral-400"}`}>
                  {isDragging ? "Drop it here!" : "Drag & drop or click to upload"}
                </p>
                <span className="text-xs text-neutral-600 mt-2 block">PNG, JPG up to 10MB</span>
              </div>
            </div>

          </div>

        </div>
      }
    </>
  );
}

function Card({title}){
  return(
    <div className="bg-slate-950 rounded-xl p-3">
      <h1 className="font-bold">
        {title}
      </h1>
    </div>
  );
}

function Sidebar({set, active}){

  useEffect(()=>{
    const fetchCategories = async () => {
      const client = browserClient();

      const { data: { user } } = await client.auth.getUser();

      const { data, error } = await client.from("Question").select('category').eq("user_id" , user.id);

      if (error) {
        console.error(error.message);
        return;
      }

      if (data) {
        const categoryList = [...new Set(data.map(item => item.category))];
        setTopiceList(categoryList);
      }
    };

    fetchCategories();
  }, []);

  const [topicList, setTopiceList] = useState([]);

    return(
        <ul className="flex flex-col min-w-50 gap-2 py-4 text-zinc-400 cursor-pointer">
           {topicList.map(data  => 
                <li  className={`flex justify-center py-2 px-4 rounded-sm border-2 border-transparent transition-color duration-300 ease capitalize
                  ${
                    active === data ? 'border-white/5 text-blue-400 bg-slate-950 ' :
                    'hover:text-blue-400 hover:bg-slate-950'
                  }`} key={data} onClick={()=>set(data)} >{data}</li>
           )} 
        </ul>
    )
}

function QuestionSection({ active }){

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if (active === null) return;

    const fetchQuestions = async () => {
      setLoading(true);
      const client = browserClient();

      const { data: { user } } = await client.auth.getUser();

      const { data, error } = await client.from("Question").select('*').eq('category', active).eq("user_id" , user.id);

      if (error) {
        console.error(error.message);
        return;
      }

      if (data) {
        setQuestions(data);
      }
      setLoading(false)
    };

    fetchQuestions();
  },[active]);

  

  return(

    <div className={"grid place-items-center gap-8 overflow-y-auto max-h-160 [&::-webkit-scrollbar]:hidden snap-y snap-mandatory" + `${loading && ''}`}>
      {
        questions.map( Q => 
          <Question question={Q} key={Q.id}/>
        )
      }
    </div>
  )
}

function Question({ question }) {

  const [active, setActive] = useState(null);
  
  const {correct, ...optionsOnly} = question.options

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 max-w-lg rounded-3xl shadow-xl snap-start">

      <span className="block w-fit px-3 py-1 bg-blue-500 rounded-full text-gray-900 font-bold ">
        {question.metadata.topic.toUpperCase()}
      </span>


      <div className="my-4 text-zinc-100 text-lg leading-relaxed">
        {question.stem}
      </div>

      <div>
        {
          question.type === 'mcq' || question.type === 'msq'  ?
           
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(optionsOnly) 
                .map(([key, value]) => (
                  <button 
                    onClick={()=>setActive(key)}
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-2xl bg-neutral-800 border ${ active === key ? 'border-blue-500 bg-neutral-800/50' : 'hover:border-blue-500 hover:bg-neutral-800/50 border-neutral-700' } transition-all group`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-lg bg-neutral-700 text-xs font-bold ${ active === key ? 'text-blue-400' : 'group-hover:text-blue-400 text-zinc-400'} uppercase`}>
                      {key}
                    </span>
                    <span className="text-zinc-300 text-sm">{value}</span>
                  </button>
                ))}
            </div>
          :

          <div>

          </div>

        } 
      </div>

        {
          active && 
            <div className="m-2">
              <p> { active === correct[0] ?  <b>Correct</b> : <b>{`wrong correct answer is ${correct[0]}`}</b> } </p>
              <p className="text-xs">Explanation :  {question.explanation} </p> 
            </div>
        }

    </div>
  );
}



function ResourceManager(){

  const [localfileList, setLocalFileList] = useState([]);
  const [fetchedfileList, setFetchedfileList] = useState([]);
  const [change, setChange] = useState(false);
  const { logged } = useContext(AppContext);

  useEffect(()=>{
    async function fetchMaterials() {
   

      const client = browserClient();

      const { data: {user} = {}, error: authError} = await client.auth.getUser();

      if (authError){
        console.error("Their is a upload Error" , authError.message);
        return
      }

      const { data , error:StorageError } = await client.from("Material").select('*').eq("user_id" , user.id); 
      
      if (StorageError){
        console.error("Their is a upload Error" , StorageError);
      }


      if (data){
        setFetchedfileList(data);
      };

    }

    fetchMaterials();

  },[change])

  function viewFile(file){
    
    const previewUrl = URL.createObjectURL(file);
    window.open(previewUrl, '_blank');
    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
    }, 10000);

  }

  async function process(e){
    e.preventDefault();
    const form = document.getElementById("uploadForm");
    const rawFormdata = new FormData(form);
    const formData = Object.fromEntries(rawFormdata);
    const SaveList = []
    const SynthesizeList = []
    const skipList = []

    localfileList.map((file)=>{
      const identifier = `${file.name}-${file.size}`;
      const operation = formData[identifier];
      
      switch(operation){
        case "save" : 
          return SaveList.push(file);
        case "process" :
          return SynthesizeList.push(file);
        default :
          return skipList.push(file) 
      }
    })

    setLocalFileList(skipList);
  
    const uploadResult = await uploadFileWithSync(SaveList);
    const sythesize = await processFileList(SynthesizeList);
    
    const errors = uploadResult.filter( result => result.sucess === false );

    if (errors.length > 0) {
      console.log(errors.map( error => error.message ))
    }

    setTimeout(setChange(prev => !prev),5000);
    
  }


  return(
    <div className="grid grid-rows-[1fr_auto] gap-4">
      <div className="bg-neutral-800 flex flex-col rounded-xl text-zinc-400 p-4 w-60">
      
        <ul className="text-sm grow">
          <li>
            <h1 className="text-xl font-bold text-white">
              Manage Resourses
            </h1>
            <p className="text-xs mb-2"><b>Caution :</b> Files will be lost on reload. To maintain history you must login</p>
          </li>
          {
            fetchedfileList.map((file, i)=>{
              const lastDotIndex = file.file_name.lastIndexOf(".");
              
              return(
              <li key={i} index={i} title={file.status} className="flex max-w-full text-blue-400 hover:underline">
                <span className="truncate pe-0" >{file.file_name.substring(0, lastDotIndex)}</span>
                <span>{file.file_name.substring(lastDotIndex)}</span>
              </li>
            )})
          }
        </ul>

        { !!localfileList.length &&
        <form className="grow flex flex-col" id="uploadForm">
          <ul className="grow text-sm max-w-full cursor-pointer flex flex-col gap-1 max-h-80 overflow-y-auto
            [&::-webkit-scrollbar]:w-1 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-neutral-500 
            [&::-webkit-scrollbar-thumb]:rounded-full
          ">
            <li className="text-white">File Queue</li>
            {
              localfileList.map((file, i)=>{
               
                
                return(
                  <li key={i} index={i} title={file.name} className="text-zinc-400 p-1.5 rounded-lg hover:bg-neutral-900 hover:text-white has-[:checked]:bg-neutral-900 has-[:checked]:text-white">
                    <div className="max-w-full group text-lg">
                      <div onClick={()=>viewFile(file)}>
                        {file.name}
                      </div>
                        
                      <div className="flex w-full gap-1 h-0 overflow-hidden group-hover:h-fit transition-size duration-500 linear"> 
                          <div className="w-1/2">
                            <input className="peer hidden" type="radio" name={`${file.name}-${file.size}`} id={`saveAndProcess-${i}`} value="save" disabled={!logged} />
                            <label className="inline-flex items-center justify-center rounded-full 
                              hover:border-1 hover:border-current/15 peer-checked:bg-blue-900/60 h-8 w-full " 
                              title="Upload and Synthesize" 
                              htmlFor={`saveAndProcess-${i}`}>
                              <img src="\saveAndProcess.svg" alt="uploadAndProcess"/>
                            </label>
                          </div>
                          <div className="w-1/2">
                            <input className="peer hidden" type="radio" name={`${file.name}-${file.size}`} id={`process-${i}`} value="process"  />
                            <label className="inline-flex items-center justify-center rounded-full 
                              hover:border-1 hover:border-current/15 peer-checked:bg-blue-900/60 h-8 w-full" 
                              title="Synthesize" 
                              htmlFor={`process-${i}`}>
                              <img src="\synthesize.svg" alt="uploadAndProcess"/>
                            </label>
                          </div>                                            
                      </div>
                    </div> 
                  </li>
              )})
            }
          </ul>
            <button className="bg-neutral-800 text-neutral-200 w-full rounded-xl p-3 border border-neutral-700 hover:bg-neutral-700 active:scale-[0.98] transition-all"
              onClick={process}
              > 
                Process Batch
            </button>
        </form>
        }
      </div>
      <FileUpload externalUpload={setLocalFileList}/>
    </div>
  );
}
