import { CameraIcon } from '@heroicons/react/24/solid'
export function Navbar() {
    return(
     <div className='bg-black'>
    <div className="flex">
    <button className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors">
  <CameraIcon className="w-6 h-6" />
</button>
    <div>DreamSnap</div>
    <button className='hover:bg-purple-500 rounded-2xl'>Sign in</button>
    <button className='bg-blue-500 p-3 font-black rounded-2xl'>Get Started</button>
         </div>
      </div>
    )
}