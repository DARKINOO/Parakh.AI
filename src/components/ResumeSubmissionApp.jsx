import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useLoading } from '../context/LoadingProvider';

function ResumeSubmissionApp() {
  const { startLoading, stopLoading } = useLoading();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPreferences, setJobPreferences] = useState({
    industry: '',
    position: '',
  });
  const containerRef = useRef(null);
  const [submissionStatus, setSubmissionStatus] = useState({
    type: null,
    message: ''
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setSubmissionStatus({
        type: 'error',
        message: 'Invalid file type. Please upload PDF or DOC files.'
      });
      return;
    }

    if (file.size > maxSize) {
      setSubmissionStatus({
        type: 'error',
        message: 'File size exceeds 5MB limit.'
      });
      return;
    }

    setResumeFile(file);
    setSubmissionStatus({
      type: 'success',
      message: `${file.name} uploaded successfully`
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setJobPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(jobPreferences).some(value => value === '')) {
      setSubmissionStatus({
        type: 'error',
        message: 'Please fill out all job preference fields'
      });
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobPreferences', JSON.stringify(jobPreferences));

    try {
      startLoading();
      const response = await fetch('http://localhost:4000/api/resume/submit-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Submission failed');
      }

      const data = await response.json();
      setSubmissionStatus({
        type: 'success',
        message: data.message || 'Resume submitted successfully'
      });
      
      if (response.ok) {
        window.location.href = `/interview/${data.resumeId}`;
        stopLoading();
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setSubmissionStatus({
        type: 'error',
        message: error.message || 'Network error. Please try again.'
      });
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const tl = gsap.timeline();
    const container = containerRef.current;
    const heading = container.querySelector('.main-heading');
    const form = container.querySelector('form');
    const uploadSection = container.querySelector('.upload-section');
    const preferencesSection = container.querySelector('.preferences-section');
    const submitButton = container.querySelector('.submit-button');

    tl.fromTo(container,
      { opacity: 0, y: 50 },
      { duration: 1, opacity: 1, y: 0, ease: "power3.out" }
    )
    .fromTo(heading,
      { opacity: 0, y: -30 },
      { duration: 0.8, opacity: 1, y: 0, ease: "back.out(1.7)" },
      "-=0.5"
    )
    .fromTo(uploadSection,
      { opacity: 0, x: -30 },
      { duration: 0.8, opacity: 1, x: 0, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(preferencesSection,
      { opacity: 0, x: 30 },
      { duration: 0.8, opacity: 1, x: 0, ease: "power2.out" },
      "-=0.6"
    )
    .fromTo(submitButton,
      { opacity: 0, scale: 0.8 },
      { duration: 0.5, opacity: 1, scale: 1, ease: "elastic.out(1, 0.7)" },
      "-=0.3"
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div ref={containerRef} className="container mx-auto px-4 py-16 md:py-8">
        <h1 className="main-heading text-5xl md:text-5xl font-bold text-center mb-12 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
          Resume Submission
        </h1>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm border border-gray-700">
          <div className="upload-section h-[200px] border-2 border-dashed border-gray-500 rounded-xl p-6 text-center">
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
              <Upload className="w-12 h-12 text-orange-400 mb-4" />
              <p className="text-xl font-semibold">
                {resumeFile ? `Selected: ${resumeFile.name}` : 'Upload Resume (PDF)'}
              </p>
            </label>
          </div>

          {submissionStatus.message && (
            <div className={`flex items-center p-4 rounded-lg ${
              submissionStatus.type === 'success' ? 'bg-green-900/50' : 'bg-red-900/50'
            }`}>
              {submissionStatus.type === 'success' ? 
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> : 
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              }
              {submissionStatus.message}
            </div>
          )}

          <div className="preferences-section grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-lg font-semibold">Industry</label>
              <select
                name="industry"
                value={jobPreferences.industry}
                onChange={handlePreferenceChange}
                className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400"
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
                placeholder="e.g., Software Engineer"
                className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button group w-full bg-gradient-to-r from-blue-400 to-orange-400 text-black py-4 rounded-lg hover:opacity-90 transition duration-300 text-lg font-bold flex items-center justify-center"
          >
            <span>Start Interview Preparation</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResumeSubmissionApp;