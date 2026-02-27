import { CameraIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
export function Navbar() {
  const navigate=useNavigate()
    return(
     <div className='bg-black'>
    <div className="flex justify-between items-center border border-gray-800 rounded-xl px-4 py-2">
   <div className='flex items-center gap-2 md:gap-3'>
     <button className="p-2 md:p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex-shrink-0">
       <CameraIcon className="w-5 h-5 md:w-6 md:h-6" />
     </button>
     <div className='text-white font-bold text-xl md:text-3xl'>DreamSnap</div>
   </div>


   <div>
    <button onClick={()=>{navigate('/signup')}} className='bg-blue-500 text-white text-sm md:text-base px-3 py-2 md:p-3 mr-0 md:mr-6 hover:bg-purple-300 rounded-2xl font-semibold'>Get Started</button>
   </div>

         </div>
      </div>
    )
}
