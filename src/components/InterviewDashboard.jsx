import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Trophy,
    Target,
    BarChart2,
    LineChart,
    MessageCircle,
    ThumbsUp,
    ThumbsDown,
    Star,
    CheckCircle,
    Brain,
    Lightbulb,
    ArrowUp,
    Clock,
    AlertCircle
} from 'lucide-react';

// Score category cards with proper data mapping
const ScoreCard = ({ icon: Icon, title, score, description, color }) => (
    <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-200">{title}</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-100">{score}</span>
                    <span className="text-sm text-gray-400">/100</span>
                </div>
            </div>
        </div>
        {description && (
            <p className="mt-2 text-sm text-gray-400">{description}</p>
        )}
    </div>
);

const FeedbackList = ({ title, items, icon: Icon, colorClass }) => (
    <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10">
        <div className={`flex items-center gap-2 mb-4 ${colorClass}`}>
            <Icon className="w-5 h-5" />
            <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <ul className="space-y-3">
            {items?.length > 0 ? (
                items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <ArrowUp className="w-4 h-4 mt-1 text-blue-400 shrink-0" />
                        <span className="text-gray-300">{item}</span>
                    </li>
                ))
            ) : (
                <li className="text-gray-400 italic">No data available</li>
            )}
        </ul>
    </div>
);

const DetailedFeedback = ({ title, content, icon: Icon }) => (
    <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 h-full">
        <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Icon className="w-5 h-5" />
            <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {content || 'Not available'}
        </p>
    </div>
);

const InterviewDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [interviewData, setInterviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const skillsChartRef = useRef(null);
    const progressChartRef = useRef(null);

    useEffect(() => {
        const data = location.state?.interviewData;
        if (data) {
            console.log("Received interview data:", data); // Debug log
            setInterviewData(data);
            setLoading(false);
        } else {
            setError("No interview data found");
            setLoading(false);
        }
    }, [location]);

    useEffect(() => {
        if (interviewData && skillsChartRef.current && progressChartRef.current) {
            const chartConfigs = [
                {
                    ref: skillsChartRef,
                    config: {
                        type: 'radar',
                        data: {
                            labels: [
                                'Technical Skills',
                                'Communication',
                                'Problem Solving',
                                'Cultural Fit',
                                'Leadership'
                            ],
                            datasets: [{
                                label: 'Performance',
                                data: [
                                    interviewData.technicalScore || 0,
                                    interviewData.communicationScore || 0,
                                    interviewData.problemSolvingScore || 0,
                                    interviewData.culturalFitScore || 0,
                                    interviewData.leadershipScore || 0
                                ],
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                            }]
                        },
                        options: {
                            scales: {
                                r: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: { stepSize: 20 },
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                    pointLabels: { color: 'rgba(255, 255, 255, 0.7)' }
                                }
                            },
                            plugins: {
                                legend: { display: false }
                            }
                        }
                    }
                },
                {
                    ref: progressChartRef,
                    config: {
                        type: 'line',
                        data: {
                            labels: ['Initial', 'Technical', 'Communication', 'Problem Solving', 'Final'],
                            datasets: [{
                                label: 'Interview Progress',
                                data: [60, 
                                    interviewData.technicalScore || 0,
                                    interviewData.communicationScore || 0,
                                    interviewData.problemSolvingScore || 0,
                                    interviewData.overallScore || 0
                                ],
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                tension: 0.4,
                                fill: true,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)'
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                                },
                                x: {
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                                }
                            },
                            plugins: {
                                legend: { display: false }
                            }
                        }
                    }
                }
            ];

            const charts = chartConfigs.map(({ ref, config }) => {
                const ctx = ref.current.getContext('2d');
                return new Chart(ctx, config);
            });

            return () => charts.forEach(chart => chart.destroy());
        }
    }, [interviewData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="text-gray-200">Loading interview results...</span>
                </div>
            </div>
        );
    }

    if (error || !interviewData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 flex items-center justify-center">
                <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-3">
                    <AlertCircle className="text-red-400 w-6 h-6" />
                    <p className="text-gray-300">{error || 'No interview data available. Please complete an interview first.'}</p>
                </div>
            </div>
        );
    }

    // Debug log for feedback data
    console.log("Detailed Feedback:", interviewData.detailedFeedback);
    console.log("Full Evaluation:", interviewData.fullEvaluation);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-200 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h2 className='text-4xl font-bold text-blue-300 text-center'>Interview Analysis</h2>
                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ScoreCard
                        icon={Trophy}
                        title="Overall Score"
                        score={interviewData.overallScore || 0}
                        color="text-yellow-400"
                    />
                    <ScoreCard
                        icon={Brain}
                        title="Technical"
                        score={interviewData.technicalScore || 0}
                        color="text-blue-400"
                    />
                    <ScoreCard
                        icon={MessageCircle}
                        title="Communication"
                        score={interviewData.communicationScore || 0}
                        color="text-green-400"
                    />
                    <ScoreCard
                        icon={Lightbulb}
                        title="Problem Solving"
                        score={interviewData.problemSolvingScore || 0}
                        color="text-purple-400"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10">
                        <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
                            <BarChart2 className="text-blue-400" />
                            Skills Assessment
                        </h3>
                        <canvas ref={skillsChartRef}></canvas>
                    </div>

                    <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10">
                        <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
                            <LineChart className="text-green-400" />
                            Progress Analysis
                        </h3>
                        <canvas ref={progressChartRef}></canvas>
                    </div>
                </div>

                {/* Feedback Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeedbackList
                        title="Key Strengths"
                        items={interviewData.strengths}
                        icon={ThumbsUp}
                        colorClass="text-green-400"
                    />
                    <FeedbackList
                        title="Areas for Improvement"
                        items={interviewData.improvements}
                        icon={ThumbsDown}
                        colorClass="text-red-400"
                    />
                </div>

                {/* Detailed Feedback */}
                {/* <div className="grid grid-cols-1 gap-6">
                    <DetailedFeedback
                        title="Full Evaluation"
                        content={interviewData.fullEvaluation}
                        icon={Target}
                    />
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {interviewData.detailedFeedback && (
                        <>
                            <DetailedFeedback
                                title="Technical Assessment"
                                content={interviewData.detailedFeedback.technical}
                                icon={Brain}
                            />
                            <DetailedFeedback
                                title="Communication Analysis"
                                content={interviewData.detailedFeedback.communication}
                                icon={MessageCircle}
                            />
                            <DetailedFeedback
                                title="Problem-Solving Approach"
                                content={interviewData.detailedFeedback.problemSolving}
                                icon={Lightbulb}
                            />
                            <DetailedFeedback
                                title="Overall Assessment"
                                content={interviewData.detailedFeedback.overall}
                                icon={Target}
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/home')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewDashboard;