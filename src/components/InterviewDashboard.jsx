import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    BarChart2, 
    PieChart, 
    LineChart, 
    MessageCircle, 
    Send, 
    Award 
} from 'lucide-react';

const InterviewDashboard = () => {
    const navigate = useNavigate();
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const location = useLocation();
    const [interviewData, setInterviewData] = useState(null);

    // Chart References
    const hiringTrendsChartRef = useRef(null);
    const feedbackChartRef = useRef(null);
    const leaderboardChartRef = useRef(null);


    useEffect(() => {
        // Extract interview data from navigation state
        const data = location.state?.interviewData;
        if (data) {
            setInterviewData(data);
        }
    }, [location]);

    // Chat Message Handling
    // const sendMessage = () => {
    //     if (userInput.trim()) {
    //         const newMessages = [
    //             ...chatMessages, 
    //             { type: 'user', text: userInput },
    //             { type: 'ai', text: 'AI: Thank you for your' }
    //         ];
    //         setChatMessages(newMessages);
    //         setUserInput('');
    //     }
    // };

    // Initialize Charts
    useEffect(() => {
        if (interviewData) {
            // Hiring Trends Chart
            const hiringTrendsChart = new Chart(hiringTrendsChartRef.current, {
                type: 'line',
                data: {
                    labels: 'Skills Performance',
                    datasets: [{
                        label: 'Hiring Trends',
                        data: [
                            interviewData.technicalScore || 50, 
                            interviewData.communicationScore || 50, 
                            interviewData.culturalFitScore || 50
                        ],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });

            // Feedback Breakdown Chart
            const feedbackChart = new Chart(feedbackChartRef.current, {
                type: 'pie',
                data: {
                    labels: ['Technical Skills', 'Communication', 'Cultural Fit'],
                    datasets: [{
                        data: [
                            interviewData.technicalScore || 35, 
                            interviewData.communicationScore || 30, 
                            interviewData.culturalFitScore || 30
                        ],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });

            // Leaderboard Chart
            const leaderboardChart = new Chart(leaderboardChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Your Score', 'Average', 'Top Score'],
                    datasets: [{
                        label: 'Interview Scores',
                        data: [
                            interviewData.overallScore || 92, 
                            85, 
                            95
                        ],
                        backgroundColor: [
                            'rgba(72, 187, 120, 0.8)',
                            'rgba(56, 161, 105, 0.8)',
                            'rgba(36, 135, 85, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            // Cleanup function
            return () => {
                hiringTrendsChart.destroy();
                feedbackChart.destroy();
                leaderboardChart.destroy();
            };
        }
    }, [interviewData]);

    if (!interviewData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-gray-200 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">No Interview Data Available</h2>
                    <p className="mb-6">Please complete an interview first.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black text-gray-200">
            <header className="bg-gradient-to-r from-blue-900 to-black text-white p-4 text-center">
                <h1 className="text-2xl font-bold animate-pulse">AI Interview Dashboard</h1>
            </header>

            <div className=" grid grid-cols-1 md:grid-cols-2 p-8">
                {/* Interview Performance Overview */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Award className="mr-2 text-blue-400" />
                        Interview Performance
                    </h2>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-blue-400 mb-4">
                            {interviewData?.overallScore || 92}/100
                        </div>
                        <p className="text-gray-400">
                            {interviewData?.performanceNote || 'Great performance! Keep improving.'}
                        </p>
                    </div>
                </div>

                {/* AI Communication */}
                {/* <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <MessageCircle className="mr-2 text-green-400" />
                        AI Communication
                    </h2>
                    <div className="h-48 overflow-y-auto border border-gray-700 rounded-lg p-4 mb-4">
                        {chatMessages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`mb-2 p-2 rounded-lg ${
                                    msg.type === 'user' 
                                        ? 'bg-blue-600 text-right' 
                                        : 'bg-green-600 text-left'
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="flex">
                        <input 
                            type="text" 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="flex-grow p-2 bg-gray-700 rounded-l-lg"
                            placeholder="Ask about your interview..."
                        />
                        <button 
                            onClick={sendMessage}
                            className="bg-blue-600 p-2 rounded-r-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                {/* Hiring Trends */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <LineChart className="mr-2 text-blue-400" />
                        Hiring Trends
                    </h2>
                    <canvas ref={hiringTrendsChartRef}></canvas>
                </div>

                {/* Feedback Breakdown */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <PieChart className="mr-2 text-green-400" />
                        Feedback Breakdown
                    </h2>
                    <canvas ref={feedbackChartRef}></canvas>
                </div>

                {/* Leaderboard */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <BarChart2 className="mr-2 text-red-400" />
                        Performance Comparison
                    </h2>
                    <canvas ref={leaderboardChartRef}></canvas>
                </div>
            </div>

            {/* Detailed Evaluation */}
            <div className="p-8">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Detailed Evaluation</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">
                        {interviewData?.fullEvaluation || 'No detailed evaluation available.'}
                    </p>
                </div>
            </div>

            <div className="text-center p-8">
                <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default InterviewDashboard;