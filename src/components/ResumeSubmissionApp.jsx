import React, { useState, useRef, useEffect } from 'react'
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useLoading } from '../context/LoadingProvider'
import { gsap } from 'gsap'

function ResumeSubmissionApp() {
  // State management for resume submission
  const { startLoading, stopLoading } = useLoading()
  const [resumeFile, setResumeFile] = useState(null)
  const [jobPreferences, setJobPreferences] = useState({
    industry: '',
    position: '',
  })
  const containerRef = useRef(null);
  const [submissionStatus, setSubmissionStatus] = useState({
    type: null,
    message: ''
  })

  // Handler for file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB limit

    if (!allowedTypes.includes(file.type)) {
      setSubmissionStatus({
        type: 'error',
        message: 'Invalid file type. Please upload PDF or DOC files.'
      })
      return
    }

    if (file.size > maxSize) {
      setSubmissionStatus({
        type: 'error',
        message: 'File size exceeds 5MB limit.'
      })
      return
    }

    setResumeFile(file)
    setSubmissionStatus({
      type: 'success',
      message: `${file.name} uploaded successfully`
    })
  }

  // Handler for preference changes
  const handlePreferenceChange = (e) => {
    const { name, value } = e.target
    setJobPreferences(prev => ({
      ...prev,
      [name]: value
    }))
  }

const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate that all required preferences are filled
    const hasEmptyPreferences = Object.values(jobPreferences).some(value => value === '');
    if (hasEmptyPreferences) {
        setSubmissionStatus({
            type: 'error',
            message: 'Please fill out all job preference fields'
        });
        return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobPreferences', JSON.stringify({
        industry: jobPreferences.industry,
        position: jobPreferences.position
    }));
    
  
    try {
        startLoading();
        const response = await fetch('http://localhost:4000/api/resume/submit-resume', {
            method: 'POST',
            body: formData,
            credentials: 'include' 
        });
  
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Submission failed');
        }
  
        const data = await response.json();
  
        setSubmissionStatus({
            type: 'success',
            message: data.message || 'Resume submitted successfully'
        });
        stopLoading();

        if (response.ok) {
            // Navigate to interview page
            window.location.href = `/interview/${data.resumeId}`;
            
        }
    } catch (error) {
        console.error('Submission Error:', error);
        
        setSubmissionStatus({
            type: 'error',
            message: error.message || 'Network error. Please try again.'
        });
    }
};

useEffect(() => {
  const tl = gsap.timeline();
  const container = containerRef.current;
  const heading = container.querySelector('h1');
  const form = container.querySelector('form');

  // Staggered animation
  tl.fromTo(container, 
    { opacity: 0, y: -900, x: -900, scale: 0.8 },
    { 
      duration: 1.5, 
      opacity: 1, 
      y: 0, 
      x:0,
      scale: 1, 
      ease: "elastic.out(1, 0.7)",
      rotate: 720
    })
    .fromTo(heading, 
      { opacity: 0, y: -50 },
      { 
        duration: 0.5, 
        opacity: 1, 
        y: 0,
        ease: "power2.out"
      }, 
      0.3 // Slight delay after container drop
    )
    .fromTo(form, 
      { opacity: 0, y: 50 },
      { 
        duration: 2.5, 
        opacity: 1, 
        y: 0,
        ease: "power2.out"
      }, 
      0.5 // Stagger form entrance
    );
}, []);


  return (
    <div className="min-h-screen bg-cover bg-center bg-blend-overlay bg-gray-600 bg-[url('https://media.istockphoto.com/id/2158368166/photo/robot-ai-employee-replacing-humans-at-work.webp?a=1&b=1&s=612x612&w=0&k=20&c=nsKNgu0gZsePtzwS_mZB2MfK4_d2MPwCS8JATFB9iUk=')] flex items-center justify-center p-6">
      <div ref={containerRef}  className="w-full max-w-2xl bg-transparent text-white shadow-lg rounded-xl p-8 pt-0">
        <h1 className="text-4xl font-bold text-center mb-12">
          AI Interview Preparation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="h-[25vh] border-2 border-dashed border-gray-100 p-6 text-center rounded-lg">
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="resume-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-white mb-4" />
              <p className="text-white font-bold text-2xl">
                {resumeFile 
                  ? `Selected: ${resumeFile.name}` 
                  : 'Upload Resume (PDF)'}
              </p>
            </label>
          </div>

          {/* Status Indicator */}
          {submissionStatus.message && (
            <div className={`
              flex items-center p-3 rounded-md 
              ${submissionStatus.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'}
            `}>
              {submissionStatus.type === 'success' 
                ? <CheckCircle className="mr-2" /> 
                : <AlertCircle className="mr-2" />
              }
              {submissionStatus.message}
            </div>
          )}

          {/* Job Preferences Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-lg font-semibold">Industry</label>
              <select
                name="industry"
                value={jobPreferences.industry}
                onChange={handlePreferenceChange}
                className="w-full h-[7vh] p-2 border rounded bg-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry</option>
                <option value="tech">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-lg font-semibold">Position</label>
              <input
                type="text"
                name="position"
                value={jobPreferences.position}
                onChange={handlePreferenceChange}
                placeholder="Software Engineer"
                className="w-full p-2 bg-gray-900 border rounded h-[7vh] text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-400 text-gray-800 py-3 rounded-lg 
            hover:bg-orange-500 transition duration-300 text-lg
            flex items-center justify-center"
          >
            <FileText className="mr-2 text-black" />
            Start AI Interview Preparation
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResumeSubmissionApp