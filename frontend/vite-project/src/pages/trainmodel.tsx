import React from "react";
import axios from "axios";
import { useState,useEffect } from "react";
export function TrainModel(){
const [name,setName]=useState("")
const [age,setAge]=useState(0)
const [gender,setGender]=useState("")
const [ethinicity,setEthinicity]=useState("")
const [eyeColor,setEyeColor]=useState("")
const [bald,setBald]=useState("")
    return <div>
        <h1>Train Your AI Model</h1>
        <h3>Upload 10-20 high-quality photos of yourself to create a personalized AI model</h3>
    <span className="border-white border-r-2">
        <h2>Photo Guidelines</h2>
        <div className="flex flex-col">
        <div className="flex">
            <div>Clear Face</div>
            <div>Good Lighting</div>
        </div>
        <div className="flex">
            <div>Variety</div>
            <div>Solo Photos</div>
          </div>  </div>
    </span>
    <span className="border-white border-r-2">
        <h2>Model Name</h2>
        <h4>Give your model a memorable name</h4>
        <input value={name} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setName(e.target.value)}} type="text" placeholder="name" />
    </span>
    <span className="border-white border-r-2">
        <h2>Model Age</h2>
        
        <input  type="number" value={age} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setAge(Number(e.target.value))}} placeholder="type your age" />
    </span>

 <span className="border-white border-r-2">
  <input value={gender} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGender(e.target.value)}} list="gender" />
<datalist id="gender">
    <option value="Male"></option>
    <option value="Female"></option>
    <option value="Others"></option>
</datalist>
    </span>

 <span className="border-white border-r-2">
 <input list="ethinicity" value={ethinicity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEthinicity(e.target.value)}} /> 
<datalist id="ethinicity">
    <option value="White"></option>
    <option value="Black"></option>
    <option value="AsianAmerican"></option>
      <option value="EastAsian"></option>
        <option value="SouthEastAsian"></option>
          <option value="SouthAsianMiddleEastern"></option>
            <option value="Pacific"></option>
              <option value= "Hispanic"></option>
</datalist>
    </span>


 
<span className="border-white border-r-2">
  <input value={eyeColor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEyeColor(e.target.value)}}   list="eye color" />
<datalist id="eye color">
    <option value="Brown"></option>
    <option value="Black"></option>
    <option value="Hazel"></option>
    <option value="Gray"></option>
</datalist>
    </span>

<span className="border-white border-r-2">
<input value={bald}  onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setBald(e.target.value)}} list="Bald" />  
<datalist id="Bald">
    <option value="Yes"></option>
    <option value="No"></option>

</datalist>
    </span>


    <span className="border-white border-r-2">
<h2>Upload Photos</h2>
<h4>Drag and drop your photos here or click to upload </h4>
    
    </span>
<button className="bg-blue-500 pt-2 pb-2 pr-4 pl-4" onClick={()=>{useEffect(()=>{
    const trainingModelData=async ()=>{
        const dbUpdate=await axios.post('',{name:{name},gender:{gender},age:{age},bald:{bald},ethinicity:{ethinicity},eyecolor:{eyeColor}})
    console.log(dbUpdate)
    }
},[])}}>Start Training</button>
    </div>
}