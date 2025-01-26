import React, { useState,useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLoading } from '../context/LoadingProvider'

const UserLogin = () => {
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({})
  
  const { user,setUser } = useContext(UserDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e)=>{
   e.preventDefault();
    startLoading(); 
   const userData ={
    email:email,
    password:password
   }

  const response = await axios.post(`${import.meta.env.VITE_BASE_URL_AUTH}/api/user/login`, userData)

  if(response.status === 200){
    console.log(response.data);

    const data = response.data
    setUser(data.user)
    localStorage.setItem('token', data.token)
    stopLoading();
    navigate('/resume')
  }
  
   setEmail('')
   setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between bg-gray-900 text-white'>
        <div className='w-[30vw] ml-[35vw] mt-[15vh] bg-gray-700 border-amber-300 border-2 p-6'>
        <h1 className='w-14 mb-8 text-5xl font-bold text-white'>AIParakh</h1>
        <form onSubmit={(e)=>{
            submitHandler(e)
          }}>
            <h3 className='text-2xl mb-2'>What's your email</h3>
            
            <input
             required 
             value={email}
             onChange={(e)=>{
                setEmail(e.target.value);
             }}
             className='bg-[#eeeeee] rounded px-4 py-2 mb-7 border w-full text-lg placeholder:text-base'
             type="email" placeholder='email@example.com'
            />
            
            <h3 className='text-2xl mb-2'>Enter Password</h3>
            <input className='bg-[#eeeeee] rounded px-4 py-2 mb-7 border w-full text-lg placeholder:text-base'
            value={password}
            onChange={(e)=>{
                setPassword(e.target.value);
             }}
            required type="password" placeholder='password'/>
            
            <button type="submit" className='flex items-center justify-center w-full bg-yellow-400 text-black font-bold text-xl py-3 rounded mt-5 placeholder:text-base'>Login</button>
        </form>
        
        <p className='text-center lg:text-left lg:ml-16 mt-4'>New here?<Link to='/signup' className='text-blue-600'>Create New Account</Link></p> 
        </div>

    </div>
  )
}

export default UserLogin