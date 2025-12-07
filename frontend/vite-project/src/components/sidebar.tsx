import { CameraIcon } from '@heroicons/react/24/solid'
export function Sidebar() {
    return(<div>
       <div> <button className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors">
  <CameraIcon className="w-6 h-6" />
</button> DreamSnap</div> 
 <hr />
 <div className="flex flex-col justify-between">
    <div className='flex flex-col'>
        <button className='hover:to-blue-500 font-semibold'>Dashboard</button>
        <button className='hover:to-blue-500 font-semibold'>Train Model</button>
        <button className='hover:to-blue-500 font-semibold'>My Models</button>
        <button className='hover:to-blue-500 font-semibold'>Generate</button>
        <button className='hover:to-blue-500 font-semibold'>Browse Packs</button>
        <button className='hover:to-blue-500 font-semibold'>My Packs</button>
        <button className='hover:to-blue-500 font-semibold'>Gallery</button>
    </div>
    <div>
        <div></div>
        <button>Sign out</button>
    </div>
</div>
    </div>)
}