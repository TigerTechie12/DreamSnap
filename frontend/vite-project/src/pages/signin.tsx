import { CameraIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
export function Signin() {
 const [signin,setSignin]=useState(true)
    return (
        <div>
    <div className='bg-black'>
    <div className="flex">
          <button className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors">
  <CameraIcon className="w-6 h-6" />
</button> <div className='font-white font-bold'>DreamSnap</div> 
    
    </div>
<div className="flex-col">
    {signin ? <h1 className='font-bold font-white'>Welcome Back</h1> : <h1 className='font-bold font-white'>Create your account</h1>}
    <h1 className='font-bold font-white'>Welcome Back</h1>
<h3>Sign in to continue creating amazing AI photos</h3>
<div>Email Address</div>
<input type="text" placeholder='john@example.com' className='border-2 border-gray-300 rounded-lg p-2 w-96'>

</input>
<div>Password</div>
<input type="password" placeholder='Enter your password' className='border-2 border-gray-300 rounded-lg p-2 w-96'/>
<button className='bg-blue-500 pl-6 pr-6 pt-3 pb-3 font-black'>Sign In</button>

</div>
    </div>
        </div>
    )
}