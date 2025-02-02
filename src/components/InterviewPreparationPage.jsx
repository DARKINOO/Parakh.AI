import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Clock, CheckCircle, Mic, MicOff, Brain, ArrowRight } from 'lucide-react';
import { useLoading } from '../context/LoadingProvider'
import { gsap } from 'gsap';

function InterviewPreparationPage() {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useLoading();
    const containerRef = useRef(null);

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

    useEffect(() => {
        const tl = gsap.timeline();
        const container = containerRef.current;
        
        if (container) {
            const header = container.querySelector('.interview-header');
            const questionBox = container.querySelector('.question-box');
            const answerBox = container.querySelector('.answer-box');
            const button = container.querySelector('.action-button');

            tl.fromTo(container,
                { opacity: 0, y: 30 },
                { duration: 1, opacity: 1, y: 0, ease: "power3.out" }
            )
            .fromTo(header,
                { opacity: 0, x: -30 },
                { duration: 0.6, opacity: 1, x: 0, ease: "back.out(1.7)" },
                "-=0.5"
            )
            .fromTo(questionBox,
                { opacity: 0, scale: 0.95 },
                { duration: 0.6, opacity: 1, scale: 1, ease: "power2.out" },
                "-=0.3"
            )
            .fromTo(answerBox,
                { opacity: 0, y: 20 },
                { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" },
                "-=0.3"
            )
            .fromTo(button,
                { opacity: 0, scale: 0.9 },
                { duration: 0.5, opacity: 1, scale: 1, ease: "elastic.out(1, 0.7)" },
                "-=0.2"
            );
        }
    }, []);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 md:py-4 px-4 md:px-6 lg:px-8">
            <div ref={containerRef} className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl p-6 md:p-4">
                    <div className="interview-header flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-3">
                        <div className="flex items-center gap-4">
                            <Bot className="text-blue-400 w-8 h-8 md:w-12 md:h-12 animate-pulse" />
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                                    Interview Session
                                </h2>
                                <p className="text-gray-400">
                                    Question {currentQuestionIndex + 1}/{questions.length}
                                </p>
                            </div>
                        </div>
                        {(hasStartedTyping || timerActive) && <TimerCircle timeRemaining={timeRemaining} />}
                    </div>

                    <div className="question-box mb-6 min-h-[120px] md:min-h-[150px] border-2 border-gray-700/50 rounded-xl p-4 bg-gray-900/50">
                        <p className="text-lg text-gray-200">
                            {displayedQuestion}
                            {isTypingQuestion && <span className="animate-pulse">|</span>}
                        </p>
                    </div>

                    <div className="answer-box relative mb-6">
                        <textarea 
                            className="w-full p-4 bg-gray-900/80 border-2 border-gray-700/50 rounded-xl min-h-[200px] text-gray-200 focus:ring-2 focus:ring-orange-400 transition-all pr-12 resize-none"
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
                                    ? 'bg-red-500/80 hover:bg-red-600' 
                                    : 'bg-blue-500/80 hover:bg-blue-600'
                            }`}
                        >
                            {isListening ? (
                                <MicOff className="h-5 w-5 text-white" />
                            ) : (
                                <Mic className="h-5 w-5 text-white" />
                            )}
                        </button>
                    </div>

                    <button 
                        onClick={handleNextQuestionOrSubmit}
                        disabled={isTypingQuestion}
                        className={`action-button w-full group flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                            currentQuestionIndex < questions.length - 1
                                ? 'bg-gradient-to-r from-blue-400 to-orange-400 hover:opacity-90'
                                : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-90'
                        }`}
                    >
                        <span>
                            {currentQuestionIndex < questions.length - 1 
                                ? 'Next Question' 
                                : 'Complete Interview'}
                        </span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InterviewPreparationPage;