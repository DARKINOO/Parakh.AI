import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { useLoading } from '../context/LoadingProvider';
import { gsap } from 'gsap';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

const UserSignup = () => {
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    const form = formRef.current;
    const heading = form.querySelector('.form-heading');
    const inputs = form.querySelectorAll('.form-input');
    const button = form.querySelector('.submit-button');

    tl.fromTo(form,
      { opacity: 0, y: 100 },
      { duration: 0.8, opacity: 1, y: 0, ease: "power3.out" }
    )
    .fromTo(heading,
      { opacity: 0, y: -30 },
      { duration: 0.5, opacity: 1, y: 0, ease: "back.out(1.7)" },
      "-=0.3"
    )
    .fromTo(inputs,
      { opacity: 0, x: -30 },
      { duration: 0.5, opacity: 1, x: 0, stagger: 0.2, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(button,
      { opacity: 0, scale: 0.8 },
      { duration: 0.5, opacity: 1, scale: 1, ease: "elastic.out(1, 0.7)" },
      "-=0.2"
    );
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    startLoading();
    
    try {
      const newUser = {
        fullname: {
          firstname: firstName,
          lastname: lastName
        },
        email,
        password
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL_AUTH}/api/user/register`,
        newUser,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        navigate('/resume');
      }
    } catch (error) {
      console.error('Registration Error:', error);
    } finally {
      stopLoading();
    }

    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div 
        ref={formRef}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <UserPlus className="w-8 h-8 text-orange-400" />
          <h1 className="form-heading text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
            Create Account
          </h1>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="form-input grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  placeholder="First name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <div className="form-input space-y-2">
            <label className="text-sm text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="email"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-input space-y-2">
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="password"
                placeholder="Create a password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button group w-full bg-orange-400 hover:bg-orange-500 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;