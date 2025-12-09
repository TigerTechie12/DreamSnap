import { useState } from "react"
export function MyPacks(){
    const [packs,setPacks]=useState([])
    const [numberOfPacks,setNumberOfPacks]=useState(0)
    const [totalImages,setTotalImages]=useState(0)  
return <div>
    <h1>My Packs</h1>
    <h4>{numberOfPacks} completed packs with total {totalImages} images</h4>
<h2>Generate Packs</h2>
<div className="flex flex-col">
    <input type="string" placeholder="Model Id" />
    <input type="text" placeholder="Pack Type" />
    <input type="number" placeholder="Total Images" />
    <input type="text" placeholder="Prompts" />
</div>

<h3>Completed Packs</h3>

<div></div>
</div>
}