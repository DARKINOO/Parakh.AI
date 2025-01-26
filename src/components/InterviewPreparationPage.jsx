import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Clock, CheckCircle } from 'lucide-react';

function InterviewPreparationPage() {
    const { resumeId } = useParams();
    const navigate = useNavigate();

    // State Management
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [finalEvaluation, setFinalEvaluation] = useState(null);
    
    const [displayedQuestion, setDisplayedQuestion] = useState('');
    const [isTypingQuestion, setIsTypingQuestion] = useState(true);
    // Timer State
    const [timeRemaining, setTimeRemaining] = useState(60); // 5 minutes per question
    const [timerActive, setTimerActive] = useState(false);

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
                    setTimerActive(true);
                }
            }, 20); // Typing speed


            return () => clearInterval(typingInterval);
        }
    }, [questions, currentQuestionIndex, isTypingQuestion]);

    // Fetch Interview Questions
    useEffect(() => {
        const fetchInterviewQuestions = async () => {
            try {
                const response = await fetch(`/api/resume/interview-questions/${resumeId}`);
                const data = await response.json();
                
                // Clean questions (remove any intro/conclusion)
                const cleanQuestions = data.questions
                    .map(q => q.replace(/^(Introduction:|Conclusion:)/i, '').trim())
                    .filter(q => q.length > 10);
                
                setQuestions(cleanQuestions);
                // Initialize answers array
                setUserAnswers(new Array(cleanQuestions.length).fill(''));
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchInterviewQuestions();
    }, [resumeId]);

    

    // Timer Logic
    useEffect(() => {
        let timer;
        if (timerActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            // Auto submit answer when time runs out
            handleNextQuestionOrSubmit();
        }

        return () => clearInterval(timer);
    }, [timerActive, timeRemaining]);

    // Reset timer when moving to next question
    useEffect(() => {
        setTimeRemaining(180); // Reset to 5 minutes
        setTimerActive(true);
        setDisplayedQuestion('');
        setIsTypingQuestion(true);
    }, [currentQuestionIndex]);

    // Combine Next Question and Submit Logic
    const handleNextQuestionOrSubmit = () => {
        // Save current answer (use current answer or empty string if time ran out)
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = currentAnswer || '';
        setUserAnswers(updatedAnswers);

        // Move to next question or submit
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer(''); // Reset current answer
            // setTimerActive(true);
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
    const TimerCircle = ({ timeRemaining, totalTime = 120 }) => {
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

    // Submit Full Interview
    const handleSubmitInterview = async () => {
        try {
            // Ensure last answer is saved
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
            
            const evaluation = {
                overallScore: extractScoreFromText(data.fullEvaluation),
                fullEvaluation: data.fullEvaluation,
                technicalScore: extractScoreSection(data.fullEvaluation, 'Technical Skills'),
                communicationScore: extractScoreSection(data.fullEvaluation, 'Communication Skills'),
                culturalFitScore: extractScoreSection(data.fullEvaluation, 'Cultural Fit'),
                performanceNote: extractPerformanceNote(data.fullEvaluation)
            };

            navigate('/dashboard', { 
                state: { 
                    interviewData: evaluation 
                }
            });
        } catch (error) {
            console.error('Interview Submission Error:', error);
        }
    };

    const extractScoreFromText = (text) => {
        // Try to extract overall score from the evaluation text
        const scoreRegexes = [
            /Overall Performance Score:\s*(\d+)/i,
            /Overall\s*Score:\s*(\d+)/i,
            /Score:\s*(\d+)/i
        ];
    
        for (const regex of scoreRegexes) {
            const match = text.match(regex);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
    
        // Fallback to a default score if no score is found
        return 50;
    };

    // Helper function to extract score from evaluation text
    const extractScoreSection = (text, section) => {
        const regex = new RegExp(`${section}:\\s*(\\d+)`, 'i');
        const match = text.match(regex);
        return match ? parseInt(match[1], 10) : 50;
    };
    
    const extractPerformanceNote = (text) => {
        const lines = text.split('\n');
        const noteLines = lines.filter(line => 
            !line.match(/Score|Technical|Communication|Cultural|Strengths|Improvement/i)
        );
        return noteLines.slice(0, 3).join(' ').trim() || 'Solid performance with room for growth.';
    };

    // Render Final Evaluation
    // if (interviewCompleted && finalEvaluation) {
    //     return (
    //         <div className="container mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center">
    //             <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
    //                 <div className="flex items-center justify-center mb-6">
    //                     <CheckCircle className="text-green-500 w-16 h-16 mr-4" />
    //                     <h2 className="text-3xl font-bold text-blue-600">Interview Completed</h2>
    //                 </div>
                    
    //                 <div className="text-center mb-6">
    //                     <div className="text-6xl font-bold text-blue-500 bg-blue-100 p-6 rounded-lg inline-block">
    //                         {finalEvaluation.overallScore}/100
    //                     </div>
    //                 </div>

    //                 <div className="bg-gray-50 p-6 rounded-lg mb-6">
    //                     <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
    //                     <p className="whitespace-pre-wrap">{finalEvaluation.fullEvaluation}</p>
    //                 </div>

    //                 <button 
    //                     onClick={() => navigate('/')}
    //                     className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
    //                 >
    //                     Return to Home
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    // Interview in Progress
    return (
        <div className=" w-full p-6 bg-black h-screen flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl shadow-2xl text-white p-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Bot className="text-blue-500 w-12 h-12 mr-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white">
                        Question {currentQuestionIndex + 1}/{questions.length}
                    </h2>
                </div>
                <TimerCircle timeRemaining={timeRemaining} />
            </div>

            <div className="mb-6 h-48 w-[100%] overflow-y-auto border-2 border-blue-100 rounded-lg p-4">
                    <p className="text-lg text-white">
                        {displayedQuestion}
                        {isTypingQuestion && <span className="animate-blink text-white">|</span>}
                    </p>
                </div>

            <textarea 
                className="w-full p-4 border-2 border-blue-200 rounded-lg min-h-[200px] mb-6 focus:ring-2 focus:ring-blue-400 transition-all"
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isTypingQuestion}
            />

            <div className="flex space-x-4">
                {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                        onClick={handleNextQuestionOrSubmit}
                        disabled={isTypingQuestion}
                        className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors "
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