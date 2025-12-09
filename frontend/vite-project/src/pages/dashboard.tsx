import {Navbar} from "../components/navbar"
import {Sidebar} from "../components/sidebar"
import {useState} from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
export function Dashboard(){
    const navigate=useNavigate()
      const [name,setName]=useState('')
    const [initials,setInitials]=useState('')
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
    return <div>
<Navbar></Navbar>
<Sidebar name={name} initials={initials}></Sidebar>
<h1 className="font-semibold font-white">Welcome back, {name}!</h1>
<h2>Ready to create some amazing AI photos?</h2>
<div className="flex"><span></span>
<span></span></div>
<div className=" flex flex-col">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
</div>

 
    </div>
}