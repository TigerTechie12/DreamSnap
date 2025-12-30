import { useState,useEffect } from "react"
import axios from "axios"
import { useAuth } from "@clerk/clerk-react"

const API_BASE_URL = import.meta.env.VITE_API_URL
export function GenerateImages(){
    interface Models{
        name:string,
        id:string
        
    }
    interface GeneratedImage{
      
        imageUrl:string[]
        prompt:string
        createdAt:string
       
    }
     const { getToken,userId } = useAuth()
    const [prompt,setPrompt]=useState("")
    const [models,setModels]=useState<Models[]>([])
    const [modelId,setModelId]=useState("")
    const [selectedModel,setSelectedModel]=useState("")
    const [allModels,setAllModels]=useState<Models[]>([])
const [generatedImages,setGeneratedImages]=useState<GeneratedImage[]>([])
const [imageId,setImageId]=useState("")
    useEffect(()=>{
        const fetchModels:any=async()=>{const response=await axios.get('',{ headers:{'Authorization':`Bearer ${getToken}`}})
    const data=response.data
const reqD=data.filter((d:any)=>(d.status==='COMPLETED'))
        const required=reqD.map((e:any)=>(e.name))
      setAllModels(reqD)
          setModels(required)
      fetchModels()   
    }  },[])
    useEffect(()=>{
const find:any=allModels.find((m)=>(m.name===selectedModel))
setModelId(find?.id)},[])

    return <div className="bg-black h-screen flex  justify-between">
        <div className="w-3/4"> <div className="text-white font-bold text-4xl">Generated Images</div>
        { 
            generatedImages ? generatedImages.map((i:any)=>(<img  src={i.imageUrl} alt={i.prompt} />)) : null
        }
        </div>
      

<div className="w-1/4">
        <h1 className="text-white font-bold text-4xl">Generate Images</h1>
        <h4 className="text-gray-500 text-xl">Create stunning AI photos using your trained models</h4>

   




<div className="border border-white w-fit p-4">
<div className="text-white font-semibold pt-0 pb-4">Generation Settings</div>
<div>
    <input onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setSelectedModel(e.target.value)}} className="border border-gray-500  rounded h-8 text-white" type="text" list='models' id='model-input'    placeholder="Select Models" />
<datalist id='models'>
   { models.map((m:any,index:number)=>(<option key={index} value={m.model}></option>))}
</datalist>
</div>
<div className="border border-white rounded mt-3  w-85 h-20 border-r-2">
<input className="text-white pt-3 "  type="text" value={prompt} placeholder="Prompt" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setPrompt(e.target.value)}} />
</div>

            <button className='bg-blue-400 pl-32 pt-3 pb-3 pr-32 rounded-xl  mt-4' onClick={()=>{
                
                  try{ const dbUpdate=async()=>{
                       const response= await axios.post('',{name:{selectedModel},prompt:{prompt},userId:{userId},modelId:{modelId}},{
      headers:{'Authorization':`Bearer ${getToken}`}
    })
                   console.log(dbUpdate)
                setImageId(response.data.id)    
         if(response.data.id){
                const fetch=async()=>{
                    const response=await axios.get(`/${imageId}`,{headers:{'Authorization':`Bearer ${getToken}`}})
           setGeneratedImages(response.data)      }
           
            }   
            }
        }
                catch(e){console.error('Image generation failed:',e)} 
          
        
            }}
            
            >
<div className="flex">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-500">

  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.394a.75.75 0 010 1.422l-1.183.394c-.447.15-.799.502-.948.948l-.394 1.183a.75.75 0 01-1.422 0l-.394-1.183a1.5 1.5 0 00-.948-.948l-1.183-.394a.75.75 0 010-1.422l1.183-.394c.447-.15.799-.502.948-.948l.394-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
</svg>
    <div>Generate</div>
</div>
            </button>
            
            </div>
    
 </div>
    </div>
}