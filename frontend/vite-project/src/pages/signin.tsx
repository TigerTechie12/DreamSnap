import { CameraIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn } from "@clerk/clerk-react"
export  function SignInPage() {
  return <SignIn routing="path" path="/sign-in" />
}


/*export function Auth() {
 const [signin,setSignin]=useState(true)
const navigate=useNavigate()

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
   {signin ? <h3>Sign in to continue creating amazing AI photos</h3> : <h3>Sign up to start creating amazing AI photos</h3>} 
{!signin ? <div className='flex-col'>
    <div className='font-white'>First Name</div>
    <input type='text' placeholder='John' className='border-2 border-gray-300 rounded-lg p-2 w-96'/>
    <div className='font-white'>Last Name</div>
    <input type='text' placeholder='Doe' className='border-2 border-gray-300 rounded-lg p-2 w-96'/>
</div> : null}
<div>Email Address</div>
<input type="text" placeholder='john@example.com' className='border-2 border-gray-300 rounded-lg p-2 w-96'>

</input>
<div className='flex'><div>Password</div> {signin ? <button onClick={()=>{navigate('/forgotpassword')}} className='font-blue'>Forgot Password</button> : null}</div>

<input type="password" placeholder='Enter your password' className='border-2 border-gray-300 rounded-lg p-2 w-96'/>

<button className='bg-blue-500 pl-6 pr-6 pt-3 pb-3 font-black'> {signin ? 'Sign in' : 'Sign up'}</button>
{signin ? <div>Don't have an account? <button className='font-blue' onClick={()=>{setSignin(false)}}>Sign up</button></div>:}

</div>
    </div>
        </div>
    )
}*/