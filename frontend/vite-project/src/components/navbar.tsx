import { CameraIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
export function Navbar() {
  const navigate=useNavigate()
    return(
     <div className='bg-black'>
    <div className="flex justify-between border border-gray-800 rounded-xl">
   <div className='flex ml-6 mb-0'> <button  className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors">
  <CameraIcon className="w-6 h-6" />
</button>
 <div className='text-white font-bold text-3xl ml-4 mt-3'>DreamSnap</div>
</div>
   
   <div> 
    <button onClick={()=>{navigate('/signup')}} className='bg-blue-500 p-3 mr-6 hover:bg-purple-300 rounded-2xl'>Get Started</button></div>
   
         </div>
      </div>
    )
}