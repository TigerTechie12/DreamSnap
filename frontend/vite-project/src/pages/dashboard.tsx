import {Navbar} from "../components/navbar"
import {Sidebar} from "../components/sidebar"
import {useState,useEffect} from "react"
import axios from "axios"

import { useNavigate } from "react-router-dom"
export function Dashboard(){
   
    const navigate=useNavigate()
      const [name,setName]=useState('')
    const [initials,setInitials]=useState('')
    const [imagesCreated,setImagesCreated]=useState(0)
    const [packsGenerated,setPacksGenerated]=useState(0)
const token=localStorage.getItem('token')
if(token){
    const tokenArray=token.split(" ")
const payload=tokenArray[1]
const decodedPayload=atob(payload)
const parsedData=JSON.parse(decodedPayload)
const obtainedName=parsedData.name
const nameWithoutSpaces=obtainedName.trim()
const firstLetter=nameWithoutSpaces.charAt(0).toUpperCase()

const nameWordsArray=nameWithoutSpaces.split(" ")
const index=nameWordsArray.length-1
const lastWord=nameWordsArray[index]
const lastLetter=lastWord.charAt(0).toUpperCase()
const initials=firstLetter+lastLetter
setInitials(initials)
setName(obtainedName)}

    useEffect(()=>{
const fetchingImages=async()=>{
    const imagesData:any=await axios.get('',{
      headers:{'Authorization':`Bearer ${token}`}
    })
    const number=imagesData.data.numberOfImages
setImagesCreated(number)}

const fetchingPacks=async ()=>{
const packsData:any=await axios.get('',{
      headers:{'Authorization':`Bearer ${token}`}
    })
const number=packsData.data.numberOfPacks
setPacksGenerated(number)
}


},[imagesCreated,packsGenerated])

    return <div>
<Navbar></Navbar>
<Sidebar name={name} initials={initials}></Sidebar>
<h1 className="font-semibold font-white">Welcome back, {name}!</h1>
<h2>Ready to create some amazing AI photos?</h2>
<div className="flex">
    <span className="border-white p-3">
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
  <path fill-rule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z" clip-rule="evenodd"/>
</svg>
{imagesCreated} Images Generated
    
    </span>

<span className="border-white p-3">
    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path fill="currentColor" fill-rule="evenodd" d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm5.178 12.137a4.137 4.137 0 1 1 1.036-8.144A6.113 6.113 0 0 0 8.726 12c0 1.531.56 2.931 1.488 4.006a4.114 4.114 0 0 1-1.036.131ZM10.726 12c0-1.183.496-2.252 1.294-3.006A4.125 4.125 0 0 1 13.315 12a4.126 4.126 0 0 1-1.294 3.006A4.126 4.126 0 0 1 10.726 12Zm4.59 0a6.11 6.11 0 0 1-1.489 4.006 4.137 4.137 0 1 0 0-8.013A6.113 6.113 0 0 1 15.315 12Z" clip-rule="evenodd"/>
</svg>
{packsGenerated} Packs Generated
    </span>
    </div> 

<div className=" flex flex-col">

 <span className="border-blue-500 p-3 m-2">
<svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V14a1 1 0 1 1-2 0V6.85L8.78 9.626a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3ZM9 14v-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0Zm8 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" clip-rule="evenodd"/>
</svg>

    <div>Train New Model</div>
    <h4>Upload photos of yourself to train a personalized AI model</h4>
    <button className="hover:to-blue-500 pl-4 pr-4 pt-1 pb-1 rounded-2xl" onClick={()=>{navigate('/trainmodel')}}>Start Training</button>
 </span>

 <span className="border-blue-500 p-3 m-2">
    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.872 9.687 20 6.56 17.44 4 4 17.44 6.56 20 16.873 9.687Zm0 0-2.56-2.56M6 7v2m0 0v2m0-2H4m2 0h2m7 7v2m0 0v2m0-2h-2m2 0h2M8 4h.01v.01H8V4Zm2 2h.01v.01H10V6Zm2-2h.01v.01H12V4Zm8 8h.01v.01H20V12Zm-2 2h.01v.01H18V14Zm2 2h.01v.01H20V16Z"/>
</svg>
<div>
   Generate Images 
</div>
<h4>Create stunning photos using your trained models and custom prompts</h4>
<button className="hover:to-purple-500 pl-4 pr-4 pt-1 pb-1" onClick={()=>{}}>Generate Now</button>
 </span>
 
 <span className="border-blue-500 p-3 m-2">
    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path fill="currentColor" d="M9.98189 4.50602c1.24881-.67469 2.78741-.67469 4.03621 0l3.9638 2.14148c.3634.19632.6862.44109.9612.72273l-6.9288 3.60207L5.20654 7.225c.2403-.22108.51215-.41573.81157-.5775l3.96378-2.14148ZM4.16678 8.84364C4.05757 9.18783 4 9.5493 4 9.91844v4.28296c0 1.3494.7693 2.5963 2.01811 3.2709l3.96378 2.1415c.32051.1732.66011.3019 1.00901.3862v-7.4L4.16678 8.84364ZM13.009 20c.3489-.0843.6886-.213 1.0091-.3862l3.9638-2.1415C19.2307 16.7977 20 15.5508 20 14.2014V9.91844c0-.30001-.038-.59496-.1109-.87967L13.009 12.6155V20Z"/>
</svg>
<div>Generate Packs</div>
<h4>Explore themed photo packs for Valentine's, beach, professional and more</h4>
<button className="hover:bg-green-500 pl-4 pr-4 pt-1 pb-1" onClick={()=>{}}></button>
 </span>
 
 <span className="border-blue-500 p-3 m-2">
    <h3>Recent Generations</h3> 
 <h4>Your latest AI-generated photos</h4>
 <button className="hover:bg-red-400 pl-2 pr-2 pb-1 pt-1">View All</button>
 {}
 </span>
 
 <span className="border-blue-500 p-3 m-2">
    <h3>Your AI Models</h3>
<h4>Trained models ready for image generation </h4>
{}
     </span>
</div>

 
    </div>
}