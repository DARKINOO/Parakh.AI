import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import InterviewPreparationPage from './components/InterviewPreparationPage';
import ResumeSubmissionApp from './components/ResumeSubmissionApp';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';  
import UserSignup from './pages/UserSignup';
import UserProtectWrapper from './pages/UserProtectWrapper';
import { LoadingProvider } from './context/LoadingProvider';
import InterviewDashboard from './components/InterviewDashboard';

function App() {
  return (
    <LoadingProvider>
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<Home/>} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/home' element={
            <Home />
          } />  
        <Route path="/resume" element={
            <ResumeSubmissionApp />
          } />
        <Route path="/interview/:resumeId" element={<InterviewWrapper />} />
        <Route 
    path="/dashboard" 
    element={
        <InterviewDashboard 
            interviewData={location.state?.interviewData} 
        />
    } 
/>  
      </Routes>
    </BrowserRouter>
    </LoadingProvider>
  );
}

function InterviewWrapper() {
  const { resumeId } = useParams();
  return <InterviewPreparationPage resumeId={resumeId} />;
}

export default App;