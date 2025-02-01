import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Clock, CheckCircle, Mic, MicOff } from 'lucide-react';
import { useLoading } from '../context/LoadingProvider'

function InterviewPreparationPage() {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();

    // State Management
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [isTypingQuestion, setIsTypingQuestion] = useState(true);
    
    // Timer State
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [timerActive, setTimerActive] = useState(false);
    const [hasStartedTyping, setHasStartedTyping] = useState(false);

    // Speech recognition state
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                }
                if (transcript) {
                    setCurrentAnswer(prev => prev + transcript);
                    if (!hasStartedTyping && !isTypingQuestion) {
                        setHasStartedTyping(true);
                        setTimerActive(true);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognition);
        }
    }, []);

    // Toggle speech recognition
    const toggleListening = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        if (questions.length > 0 && isTypingQuestion) {
            const currentQuestion = questions[currentQuestionIndex];
            let index = 0;
            const typingInterval = setInterval(() => {
                if (index < currentQuestion.length) {
                    setDisplayedQuestion(prev => prev + currentQuestion[index]);
                    index++;
                } else {
                    clearInterval(typingInterval);
                    setIsTypingQuestion(false);
                }
            }, 20);

            return () => clearInterval(typingInterval);
        }
    }, [questions, currentQuestionIndex, isTypingQuestion]);

    // Fetch Interview Questions
    useEffect(() => {
        const fetchInterviewQuestions = async () => {
            try {
                const response = await fetch(`/api/resume/interview-questions/${resumeId}`);
                const data = await response.json();
                
                const cleanQuestions = data.questions
                    .map(q => q.replace(/^(Introduction:|Conclusion:)/i, '').trim())
                    .filter(q => q.length > 10);
                
                setQuestions(cleanQuestions);
                setUserAnswers(new Array(cleanQuestions.length).fill(''));
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchInterviewQuestions();
    }, [resumeId]);

    // Timer Logic - Now starts when user starts typing
    useEffect(() => {
        let timer;
        if (timerActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            handleNextQuestionOrSubmit();
        }

        return () => clearInterval(timer);
    }, [timerActive, timeRemaining]);

    // Reset states when moving to next question
    useEffect(() => {
        setTimeRemaining(180);
        setTimerActive(false);
        setHasStartedTyping(false);
        setDisplayedQuestion('');
        setIsTypingQuestion(true);
    }, [currentQuestionIndex]);

    const handleAnswerChange = (e) => {
        setCurrentAnswer(e.target.value);
        
        // Start timer on first keystroke
        if (!hasStartedTyping && !isTypingQuestion) {
            setHasStartedTyping(true);
            setTimerActive(true);
        }
    };

    const handleNextQuestionOrSubmit = () => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = currentAnswer || '';
        setUserAnswers(updatedAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer('');
        } else {
            handleSubmitInterview();
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Timer Circle Component
    const TimerCircle = ({ timeRemaining, totalTime = 180 }) => {
        const percentage = (timeRemaining / totalTime) * 100;
        return (
            <div className="relative text-white w-16 h-16">
                <svg className="absolute top-0 left-0" viewBox="0 0 36 36">
                    <path 
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                    />
                    <path 
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={percentage < 30 ? "#ff4136" : "#2ecc40"}
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
                    {formatTime(timeRemaining)}
                </div>
            </div>
        );
    };

    const handleSubmitInterview = async () => {
        try {
            startLoading(); // Show loading overlay
            const finalAnswers = [...userAnswers];
            finalAnswers[currentQuestionIndex] = currentAnswer || '';

            const response = await fetch('/api/resume/submit-full-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeId,
                    answers: finalAnswers
                })
            });

            const data = await response.json();
            stopLoading(); // Hide loading overlay
            
            navigate('/dashboard', { 
                state: { 
                    interviewData: data 
                }
            });
        } catch (error) {
            console.error('Interview Submission Error:', error);
            stopLoading(); // Ensure loading overlay is hidden even if there's an error
        }
    };

    return (
        <div className="w-full p-6 bg-black h-screen flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl shadow-2xl text-white p-8 w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Bot className="text-blue-500 w-12 h-12 mr-4 animate-pulse" />
                        <h2 className="text-2xl font-bold text-white">
                            Question {currentQuestionIndex + 1}/{questions.length}
                        </h2>
                    </div>
                    {(hasStartedTyping || timerActive) && <TimerCircle timeRemaining={timeRemaining} />}
                </div>

                <div className="mb-6 h-48 w-[100%] overflow-y-auto border-2 border-blue-100 rounded-lg p-4">
                    <p className="text-lg text-white">
                        {displayedQuestion}
                        {isTypingQuestion && <span className="animate-blink text-white">|</span>}
                    </p>
                </div>

                <div className="relative">
                    <textarea 
                        className="w-full p-4 border-2 border-blue-200 rounded-lg min-h-[200px] mb-6 focus:ring-2 focus:ring-blue-400 transition-all pr-12"
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={handleAnswerChange}
                        disabled={isTypingQuestion}
                    />
                    <button
                        onClick={toggleListening}
                        disabled={isTypingQuestion}
                        className={`absolute right-3 top-3 p-2 rounded-full transition-all ${
                            isListening 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {isListening ? (
                            <MicOff className="h-5 w-5 text-white" />
                        ) : (
                            <Mic className="h-5 w-5 text-white" />
                        )}
                    </button>
                </div>

                <div className="flex space-x-4">
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button 
                            onClick={handleNextQuestionOrSubmit}
                            disabled={isTypingQuestion}
                            className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button 
                            onClick={handleNextQuestionOrSubmit}
                            disabled={isTypingQuestion}
                            className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            Complete Interview
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


export default InterviewPreparationPage;