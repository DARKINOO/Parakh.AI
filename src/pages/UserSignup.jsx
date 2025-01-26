import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'
import LoadingProvider, { useLoading } from '../context/LoadingProvider'

const UserSignup = () => {
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')
  const [userData, setUserData] = useState({})
  const navigate = useNavigate()
  const { user, setUser } = React.useContext(UserDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
  
    try {
        startLoading();
 
        const newUser = {
            fullname: {
              firstname: firstName,
              lastname: lastName
            },
            email: email,
            password: password
          }

        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL_AUTH}/api/user/register`, 
            newUser, 
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
  
      if(response.status == 201){
        const data = response.data
        setUser(data.user)
        localStorage.setItem('token', data.token)
        navigate('/resume')
      }
    } catch (error) {
      console.error('Registration Error:', error.response ? error.response.data : error.message);
      // Handle error (show message to user, etc.)
    }
    finally {
        // Always stop loading, whether successful or not
        stopLoading();
    }
  
    // Reset form
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
  }
  return (
    <div className='pt-5 p-7 h-screen flex flex-col justify-between'>
    <div>
    <h1 className='w-14 mb-8 text-3xl font-bold text-black'>AIParakh</h1>
    <form onSubmit={(e)=>{
        submitHandler(e)
    }}>
         <h3 className='text-lg w-1/2  font-medium mb-2'>What's your name</h3>
            <div className='flex gap-4 mb-7'>
              <input
                required
                className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border  text-lg placeholder:text-base'
                type="text"
                placeholder='First name'
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                }}
              />
              <input
                required
                className='bg-[#eeeeee] w-1/2  rounded-lg px-4 py-2 border  text-lg placeholder:text-base'
                type="text"
                placeholder='Last name'
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                }}
              />
            </div>

            <h3 className='text-lg font-medium mb-2'>What's your email</h3>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
              type="email"
              placeholder='email@example.com'
            />

            <h3 className='text-lg font-medium mb-2'>Enter Password</h3>

            <input
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              required type="password"
              placeholder='password'
            />

            <button
              className='bg-yellow-400 text-black font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base'
            >Create account</button>

          </form>
          <p className='text-center'>Already have a account? <Link to='/login' className='text-blue-600'>Login here</Link></p>
        </div>
</div>
  )
}

export default UserSignup