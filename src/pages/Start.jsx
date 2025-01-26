import React from 'react'
import { Link } from 'react-router-dom'
import image from '../assets/freepik__the-style-is-candid-image-photography-with-natural__38299.png'

const Start = () => {
  return (
    <div>
        <div className="bg-cover bg-center bg-[url('https://assets-global.website-files.com/64ab85fe83d8ba10beb48571/64df3ac5cc50773e851778f4_typing-artificial-intelligence-conversational-ai.jpg')] h-screen pt-8 lg:pt-4 flex justify-between flex-col w-full">
            <h1 className='w-14 ml-8 text-3xl font-bold text-white'>AIParakh</h1>
            <div className='bg-black py-5 px-6'>
                <h2 className='text-3xl text-white font-bold'>Get Started with AIParakh </h2>
                <Link to='/login' className='flex items-center justify-center w-full bg-blue-700 text-white font-bold text-xl py-3 rounded mt-5'>Continue</Link>
            </div>
        </div>
    </div>
  )
}

export default Start