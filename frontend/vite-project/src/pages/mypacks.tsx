import { useEffect, useState } from "react"
import axios from "axios"
import { createPortal } from "react-dom"
import { useAuth } from "@clerk/clerk-react"
export function MyPacks(){
     const { getToken } = useAuth()
    interface Packs{
id:string
modelId:string
packType:string
status:'PENDING' | 'COMPLETED' | 'FAILED'
totalImages:number
createdAt:string
updateAt:string
progress?:number
images?: PackImage[]
}
interface PackImage{
    id:string
    imageUrl:string[]
    prompt:string
}
interface Models{
    name:string
}
const [generatingPacks, setGeneratingPacks] = useState<Packs[]>([])
  const [completedPacks, setCompletedPacks] = useState<Packs[]>([])
  const [loading, setLoading] = useState(true)
    const [prompts, setPrompts] = useState<string[]>([""])
    const [packType,setPackType]=useState("")
    const [images,setImages]=useState(0)
    const [packName,setPackName]=useState("")
    const [trainedModels,setTrainedModels]=useState<Models[]>([])
    const [inputs,setInputs]=useState<string[]>([""])   
   const [showModal,setShowModal]=useState(false)
   const [updateShowModal,setUpdateShowModal]=useState(false)
    useEffect(()=>{
        const fetch=async()=>{
            const trainedModels:any=await axios.get('',{
      headers:{'Authorization':`Bearer ${getToken}`}
    })
            setTrainedModels(trainedModels)
        }
    },[])
useEffect(()=>{
const fetching=async()=>{
    const genpacks:any=await axios.get('',{
      headers:{'Authorization':`Bearer ${getToken}`}
    })
    const packs=genpacks.data.packs
const generating=packs.filter((p:Packs)=>p.status==='PENDING')
const completed=packs.filter((p:Packs)=>p.status==='COMPLETED')
setGeneratingPacks(generating)
setCompletedPacks(completed)
} 
},[])   
 if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading packs...</div>
      </div>
    );
  }

return <div>
   <div className="flex"><h1>Photo Packs</h1> <button onClick={()=>{setShowModal(true)}} className="bg-blue-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-500">

  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.394a.75.75 0 010 1.422l-1.183.394c-.447.15-.799.502-.948.948l-.394 1.183a.75.75 0 01-1.422 0l-.394-1.183a1.5 1.5 0 00-.948-.948l-1.183-.394a.75.75 0 010-1.422l1.183-.394c.447-.15.799-.502.948-.948l.394-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
</svg> Generate Pack</button> </div>
{showModal && createPortal(<div><h2>Create New Pack</h2>
<h3>Define your pack details and add multiple prompts. Each prompt will generate variations based on the total images specified.</h3>
<div className="flex flex-col">
    <h2>Pack Name</h2>
    <input type="text" value={packName} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setPackName(e.target.value)}} className="border-r-2" placeholder="e.g.,Valentine's Collection,Beach Vibes" />
<h2>Pack Type</h2>
 <input type="text" value={packType} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setPackType(e.target.value)}} className="border-r-2" placeholder="e.g.,Valentine's,Beach,Royal,Adventure" />
<h2>Total Images in Pack</h2>
<input type="number" value={images} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImages(+e.target.value)}} className="border-r-2" />
<h2>Select Model</h2>
 <input list="trained-models" id="trained-models" name="trained-models-choice" /> 

<datalist id="trained-models">
{   trainedModels.map((t,index)=>(
<option value={t.name} key={index}></option>
   ))}
</datalist>
<div className="flex justify-between">
    <h2>Prompts</h2>
<button onClick={()=>{
    
   setInputs([...inputs,""])
    
}} className="border-r-2">+ Add Prompt</button>
{
  inputs.map((i:any)=>(<input type="text" placeholder="Type your prompt" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
    setPrompts([...prompts,e.target.value])
  }} />))  
}

</div>

<span className="p-2 ">
    <h3>Pack Summary</h3>
    <div className="flex-col">
        
        <div className="justify-between">
            <div>Pack Name:</div>
            <div>{packName}</div>
        </div>
        <div className="justify-between">
            <div>Pack Type:</div>
            <div>{packType}</div>
        </div>
        <div className="justify-between">
        <div>Total Images:</div>
        <div>{images}</div>
        </div>
        <div className="justify-between">
            <div>Prompts:</div>
            <div>{prompts}</div>
        </div>
    </div>
</span>
<button className="bg-blue-600 pl-5 pr-5 pt-2 pb-2 text-black"
onClick={()=>{
    useEffect(()=>{const post=async()=>{await axios.post('',{
        prompts:{prompts},
        images:{images},
        packType:{packType},
        packName:{packName}
    },{
      headers:{'Authorization':`Bearer ${getToken}`}
    })}},[])
}}
>
    Create Pack
</button>
</div>
</div>,document.body
 
)
}

    <h3>Create and manage themed image collections with custom prompts</h3>
<h2 className="flex">Generating 
<div role="status">
    <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
</div>
 </h2>
<div className="p-8">
    {generatingPacks.length>0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            <h2 className="text-2xl font-bold text-white">Generating</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {generatingPacks.map((pack) => (
              <div key={pack.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{pack.packType}</h3>
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>

                <p className="text-gray-400 mb-2">
                  Generating... {pack.progress || 60}%
                </p>

                
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${pack.progress || 60}%` }}
                  />
                </div>

                <p className="text-gray-500 text-sm">
                  {Math.floor(((pack.progress || 60) / 100) * pack.totalImages)} of{' '}
                  {pack.totalImages} images completed
                </p>

               
                <div className="flex gap-2 mt-4">
                  {pack.images?.slice(0, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img.imageUrl[0]}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                  {pack.totalImages > 5 && (
                    <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center text-gray-400">
                      +{pack.totalImages - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      <div>
        <div className="flex items-center mb-6">
          <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Completed Packs</h2>
        </div>

        {completedPacks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No completed packs yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {completedPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition cursor-pointer"
                onClick={() => (window.location.href = `/pack/${pack.id}`)}
              >
                <div className="grid grid-cols-4 gap-1">
                  {pack.images?.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img.imageUrl[0]}
                      alt=""
                      className="w-full h-48 object-cover"
                    />
                  ))}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white">{pack.packType}</h3>
                  <p className="text-gray-400 text-sm">
                    {pack.totalImages} images • {new Date(pack.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  


<button className="bg-blue-600" onClick={()=>{
    setUpdateShowModal(true)
    useEffect(()=>{
        const update=async()=>{axios.put('',{
            packName:{packName},
            packType:{packType},
            images:{images},
            prompts:{prompts}

        },{
      headers:{'Authorization':`Bearer ${getToken}`}
    })}
    },[])
}}>+ Add Images</button>
{updateShowModal && createPortal(
    <div>
        <div>Add More Images</div>
         <h2>Pack Name</h2>
    <input type="text" value={packName} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setPackName(e.target.value)}} className="border-r-2" placeholder="e.g.,Valentine's Collection,Beach Vibes" />
<h2>Pack Type</h2>
 <input type="text" value={packType} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setPackType(e.target.value)}} className="border-r-2" placeholder="e.g.,Valentine's,Beach,Royal,Adventure" />
<h2>Total Images in Pack</h2>
<input type="number" value={images} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setImages(+e.target.value)}} className="border-r-2" />
<h2>Select Model</h2>
 <input list="trained-models" id="trained-models" name="trained-models-choice" /> 

<datalist id="trained-models">
{   trainedModels.map((t,index)=>(
<option value={t.name} key={index}></option>
   ))}
</datalist>
<div className="flex justify-between">
    <h2>Prompts</h2>
<button onClick={()=>{
    
   setInputs([...inputs,""])
    
}} className="border-r-2">+ Add Prompt</button>
{
  inputs.map((i:any)=>(<input type="text" placeholder="Type your prompt" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
    setPrompts([...prompts,e.target.value])
  }} />))  
}</div>
        
    </div>
    ,document.body
)

}
<button className="bg-red-500" onClick={()=>{
      useEffect(()=>{
        const del=async()=>{axios.delete('',{
      headers:{'Authorization':`Bearer ${getToken}`}
    })}
    },[]) 
}}>Delete
</button>
</div>} 