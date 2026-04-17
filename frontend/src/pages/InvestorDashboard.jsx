import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    TrendingUp, 
    Target, 
    CheckCircle, 
    Clock, 
    MessageSquare, 
    Star, 
    Plus, 
    Minus, 
    CreditCard, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    MoreHorizontal,
    Bell,
    ChevronRight,
    Search,
    PieChart,
    Banknote,
    Briefcase,
    Repeat,
    FileText,
    Settings as SettingsIcon,
    Filter,
    Download,
    ArrowLeft,
    MoreVertical,
    Activity,
    Shield,
    Users,
    Newspaper,
    ExternalLink,
    MousePointer2,
    PenTool,
    Maximize2,
    Settings2,
    Magnet,
    Eye,
    Lock
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    ComposedChart,
    Line
} from 'recharts';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const InvestorDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname.split('/').pop();
    
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('Individual'); // Individual or Establishment
    const [opportunities, setOpportunities] = useState([]);
    const [startups, setStartups] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loanStats, setLoanStats] = useState({ totalBorrowed: 0, totalOutstanding: 0 });
    const [walletData, setWalletData] = useState({ 
        balance: 0, 
        totalInvested: 0, 
        transactions: [],
        borrowing: { balance: 0, outstanding: 0, nextPayment: 'N/A' }
    });
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStage, setFilterStage] = useState('All');
    const [interestMessage, setInterestMessage] = useState('');
    const [selectedStartupData, setSelectedStartupData] = useState(null);

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return '₹ 0';
        if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} L`;
        return `₹ ${amount.toLocaleString('en-IN')}`;
    };

    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [walletAmount, setWalletAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loanFormData, setLoanFormData] = useState({ amount: '', type: 'Working Capital', purpose: '', tenure: 12 });
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
    const [isInterestConfirmModalOpen, setIsInterestConfirmModalOpen] = useState(false);
    const [pendingInterestStartup, setPendingInterestStartup] = useState(null);
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
    const [shareUnits, setShareUnits] = useState('1');
    const [hoveredData, setHoveredData] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [oppsRes, startupsRes, loansRes, walletRes] = await Promise.all([
                api.get('/investor/opportunities'),
                api.get('/investor/startups'),
                api.get('/investor/loans'),
                api.get('/investor/wallet')
            ]);
            
            console.log('Dashboard data fetched:', {
                opps: oppsRes.data,
                startups: startupsRes.data,
                loans: loansRes.data,
                wallet: walletRes.data
            });

            setOpportunities(oppsRes.data.opportunities || []);
            setStartups(startupsRes.data.startups || []);
            setLoans(loansRes.data.loans || []);
            setLoanStats(loansRes.data.stats || { totalBorrowed: 0, totalOutstanding: 0 });
            setWalletData({
                balance: walletRes.data.balance || 0,
                totalInvested: walletRes.data.totalInvested || 0,
                transactions: walletRes.data.transactions || [],
                borrowing: walletRes.data.borrowing || { balance: 0, outstanding: 0, nextPayment: 'N/A' }
                });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const errorMsg = error.response?.data?.message || 'Failed to load data';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLoanSubmit = async (e) => {
        e.preventDefault();
        if (!loanFormData.amount || parseFloat(loanFormData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const loadingToast = toast.loading('Submitting your loan request...');
            
            const payload = {
                ...loanFormData,
                amount: parseFloat(loanFormData.amount)
            };

            const { data } = await api.post('/investor/loans', payload);
            
            toast.dismiss(loadingToast);
            toast.success(data.message);
            setIsLoanModalOpen(false);
            setLoanFormData({ amount: '', type: 'Working Capital', purpose: '', tenure: 12 });
            
            // Refresh loans list
            const loansRes = await api.get('/investor/loans');
            setLoans(loansRes.data.loans);
            setLoanStats(loansRes.data.stats);
        } catch (error) {
            console.error('Loan submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit loan request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWalletAction = async (type) => {
        if (!walletAmount || parseFloat(walletAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const loadingToast = toast.loading(`${type === 'deposit' ? 'Depositing' : 'Withdrawing'} funds...`);
        try {
            setIsSubmitting(true);
            
            const { data } = await api.post(`/investor/${type}`, { amount: parseFloat(walletAmount) });
            
            toast.dismiss(loadingToast);
            toast.success(data.message);
            
            setIsDepositModalOpen(false);
            setIsWithdrawModalOpen(false);
            setWalletAmount('');
            
            // Refresh wallet data
            const walletRes = await api.get('/investor/wallet');
            setWalletData({
                balance: walletRes.data.balance || 0,
                totalInvested: walletRes.data.totalInvested || 0,
                transactions: walletRes.data.transactions || [],
                borrowing: walletRes.data.borrowing || { balance: 0, outstanding: 0, nextPayment: 'N/A' }
            });
        } catch (error) {
            console.error(`${type} error:`, error);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || `Failed to ${type} funds`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchStartupDetail = async (id) => {
        try {
            console.log('Fetching startup details for:', id);
            const { data } = await api.get(`/investor/dashboard/${id}`);
            console.log('Startup detail response:', data);
            
            if (data && data.startup) {
                setSelectedStartupData(data);
            } else {
                console.error('Invalid startup data received:', data);
                toast.error('Invalid company data');
            }
        } catch (error) {
            console.error('Error fetching startup detail:', error);
            const errorMsg = error.response?.data?.message || 'Failed to fetch company details';
            toast.error(errorMsg);
        }
    };

    const handleExpressInterest = async () => {
        if (!pendingInterestStartup) return;
        
        try {
            setIsSubmitting(true);
            await api.post('/investor/interest', { 
                startupId: pendingInterestStartup.id,
                message: interestMessage 
            });
            toast.success('Interest expressed successfully! The founder will be notified.');
            setOpportunities(prev => prev.map(opp => 
                opp.id === pendingInterestStartup.id ? { ...opp, hasExpressedInterest: true } : opp
            ));
            setIsInterestConfirmModalOpen(false);
            setPendingInterestStartup(null);
            setSelectedOpportunity(null);
            setInterestMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to express interest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openInterestConfirmation = (opp) => {
        setPendingInterestStartup(opp);
        setIsInterestConfirmModalOpen(true);
    };

    const handleInvest = async () => {
        if (!selectedOpportunity || !shareUnits) return;

        try {
            setIsSubmitting(true);
            const { data } = await api.post('/investor/invest', {
                startupId: selectedOpportunity.id,
                shareUnits: parseInt(shareUnits)
            });

            toast.success(data.message);
            setIsInvestModalOpen(false);
            setShareUnits('1');
            setSelectedOpportunity(null);
            
            // Refresh data WITHOUT auto-selecting a startup detail view
            const [oppsRes, startupsRes, loansRes, walletRes] = await Promise.all([
                api.get('/investor/opportunities'),
                api.get('/investor/startups'),
                api.get('/investor/loans'),
                api.get('/investor/wallet')
            ]);

            setOpportunities(oppsRes.data.opportunities || []);
            setStartups(startupsRes.data.startups || []);
            setLoans(loansRes.data.loans || []);
            setLoanStats(loansRes.data.stats || { totalBorrowed: 0, totalOutstanding: 0 });
            setWalletData({
                balance: walletRes.data.balance || 0,
                totalInvested: walletRes.data.totalInvested || 0,
                transactions: walletRes.data.transactions || [],
                borrowing: walletRes.data.borrowing || { balance: 0, outstanding: 0, nextPayment: 'N/A' }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStartupData) return;

        try {
            setIsSubmitting(true);
            await api.post('/investor/feedback', {
                startupId: selectedStartupData.startup.id || selectedStartupData.startup._id,
                ...feedbackData
            });
            toast.success('Feedback submitted successfully!');
            setIsFeedbackModalOpen(false);
            setFeedbackData({ rating: 5, comment: '' });
        } catch (error) {
            console.error('Feedback error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate OHLC Data for Candlestick Chart
    const generateCandleData = (baseValue) => {
        const data = [];
        let currentPrice = baseValue;
        const now = new Date();
        const totalPoints = 100;
        
        for (let i = 0; i < totalPoints; i++) {
            const volatility = 0.03;
            const open = currentPrice;
            const change = currentPrice * volatility * (Math.random() - 0.48); // Slight upward bias
            const close = open + change;
            const high = Math.max(open, close) + (Math.random() * currentPrice * volatility * 0.6);
            const low = Math.min(open, close) - (Math.random() * currentPrice * volatility * 0.6);
            
            const date = new Date(now);
            date.setMinutes(date.getMinutes() - (totalPoints - i));
            
            data.push({
                name: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                open,
                close,
                high,
                low,
                bottom: Math.min(open, close),
                height: Math.abs(open - close),
                isUp: close >= open,
                timestamp: date.getTime()
            });
            currentPrice = close;
        }
        return data;
    };

    const Candlestick = (props) => {
        const { x, y, width, height, payload } = props;
        const { open, close, high, low, isUp } = payload;
        const fill = isUp ? '#22c55e' : '#ef4444';
        const stroke = isUp ? '#22c55e' : '#ef4444';
        const wickX = x + width / 2;

        // Calculate the ratio of pixels to data units for the body
        const bodyValue = Math.abs(open - close);
        const ratio = bodyValue === 0 ? 0 : height / bodyValue;
        
        // Calculate wick points relative to body top (y)
        // If body is zero, we use high/low directly relative to y
        const highWickY = bodyValue === 0 ? y - (high - open) : y - (high - Math.max(open, close)) * ratio;
        const lowWickY = bodyValue === 0 ? y + (open - low) : y + height + (Math.min(open, close) - low) * ratio;

        return (
            <g>
                {/* Wick */}
                <line
                    x1={wickX}
                    y1={highWickY}
                    x2={wickX}
                    y2={lowWickY}
                    stroke={stroke}
                    strokeWidth={1.5}
                />
                {/* Body (minimum 1px for flat candles) */}
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={Math.max(height, 1)}
                    fill={fill}
                    stroke={stroke}
                    rx={1}
                />
            </g>
        );
    };

    const generateCompanyNews = (companyName) => {
        return [
            { id: 1, date: '2 hours ago', title: `${companyName} Secures New Strategic Partnership in South Asia`, source: 'TechCrunch', tag: 'Market' },
            { id: 2, date: 'Yesterday', title: `Quarterly Earnings Report: ${companyName} Surpasses Growth Targets`, source: 'Bloomberg', tag: 'Finance' },
            { id: 3, date: '3 days ago', title: `New Innovation Hub Launched by ${companyName} to Accelerate R&D`, source: 'Reuters', tag: 'Product' },
            { id: 4, date: '1 week ago', title: `Industry Experts Predict Bullish Trend for ${companyName} Valuation`, source: 'Forbes', tag: 'Analysis' },
        ];
    };

    const renderStartupDetail = () => {
        if (!selectedStartupData) return null;
        const { startup, analytics, milestones } = selectedStartupData;
        const candleData = generateCandleData(startup.valuation);
        
        // Show current hover data or last candle data
        const displayData = hoveredData || candleData[candleData.length - 1];

        return (
            <div className="fixed inset-0 md:left-64 z-40 bg-white flex flex-col animate-in fade-in slide-in-from-right duration-300 overflow-hidden text-slate-900">
                {/* Navbar style Header */}
                <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                setSelectedStartupData(null);
                                setHoveredData(null);
                            }}
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-200">
                                {startup.name[0]}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-sm font-black text-slate-900 leading-none">{startup.name} / INR</h2>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">1D • StartupOps Exchange</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 text-[11px] font-bold">
                            <div className="flex flex-col"><span className="text-slate-400 text-[9px] uppercase tracking-tighter">Open</span><span className="text-slate-900">{formatCurrency(displayData.open)}</span></div>
                            <div className="flex flex-col"><span className="text-slate-400 text-[9px] uppercase tracking-tighter text-green-600">High</span><span className="text-green-600">{formatCurrency(displayData.high)}</span></div>
                            <div className="flex flex-col"><span className="text-slate-400 text-[9px] uppercase tracking-tighter text-red-600">Low</span><span className="text-red-600">{formatCurrency(displayData.low)}</span></div>
                            <div className="flex flex-col"><span className="text-slate-400 text-[9px] uppercase tracking-tighter">Close</span><span className="text-slate-900">{formatCurrency(displayData.close)}</span></div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-[9px] uppercase tracking-tighter">Change</span>
                                <span className={displayData.isUp ? "text-green-600" : "text-red-600"}>
                                    {displayData.isUp ? '+' : ''}{((displayData.close - displayData.open) / displayData.open * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => {
                                    setSelectedOpportunity({
                                        id: startup.id || startup._id,
                                        name: startup.name,
                                        valuation: startup.valuation,
                                        investmentAmount: startup.investmentAmount
                                    });
                                    setIsInvestModalOpen(true);
                                }}
                                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-green-100 active:scale-95"
                            >
                                BUY
                            </button>
                            <button className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95">
                                SELL
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Toolbar */}
                    <div className="w-12 border-r border-slate-100 flex flex-col items-center py-4 gap-4 bg-slate-50/50">
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><MousePointer2 className="w-5 h-5" /></button>
                        <div className="w-6 h-[1px] bg-slate-200"></div>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><PenTool className="w-5 h-5" /></button>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><Activity className="w-5 h-5" /></button>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><Magnet className="w-5 h-5" /></button>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                        <div className="flex-1"></div>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><SettingsIcon className="w-5 h-5" /></button>
                        <button className="p-2.5 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"><Lock className="w-5 h-5" /></button>
                    </div>

                    {/* Main Chart Area */}
                    <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
                        {/* Metrics Cards Overlay (Floating Style) */}
                        <div className="absolute top-6 left-6 right-6 z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pointer-events-none">
                            <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 pointer-events-auto hover:translate-y-[-2px] transition-transform">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Market Price</p>
                                <p className="text-xl font-black text-slate-900">{formatCurrency(startup.valuation)}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 pointer-events-auto hover:translate-y-[-2px] transition-transform">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Investment</p>
                                <p className="text-xl font-black text-blue-600">{formatCurrency(startup.investmentAmount)}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 pointer-events-auto hover:translate-y-[-2px] transition-transform">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stage</p>
                                <p className="text-xl font-black text-slate-900">{startup.stage}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 pointer-events-auto hover:translate-y-[-2px] transition-transform">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sector</p>
                                <p className="text-xl font-black text-slate-900">{startup.market || 'Technology'}</p>
                            </div>
                        </div>

                        {/* Candlestick Chart */}
                        <div className="flex-1 w-full relative pt-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart 
                                    data={candleData} 
                                    margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                                    onMouseMove={(state) => {
                                        if (state.activePayload) {
                                            setHoveredData(state.activePayload[0].payload);
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                >
                                    <CartesianGrid stroke="#f1f5f9" vertical={true} strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        orientation="right"
                                        domain={['auto', 'auto']}
                                        axisLine={{ stroke: '#f1f5f9' }}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip 
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        content={() => null}
                                    />
                                    
                                    <Bar 
                                        dataKey="bottom" 
                                        stackId="a" 
                                        fill="transparent" 
                                        isAnimationActive={false}
                                    />
                                    <Bar 
                                        dataKey="height" 
                                        stackId="a"
                                        fill="#22c55e"
                                        shape={(props) => <Candlestick {...props} />}
                                        isAnimationActive={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bottom Toolbar */}
                        <div className="h-10 border-t border-slate-100 flex items-center px-6 justify-between bg-white">
                            <div className="flex items-center gap-2">
                                {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((t) => (
                                    <button key={t} className={clsx(
                                        "px-3 py-1 text-[10px] font-black rounded-lg transition-all",
                                        t === '1D' ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400">
                                <span className="tracking-widest">12:12:15 (UTC+5:30)</span>
                                <span className="uppercase tracking-tighter">% LOG AUTO</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Company Details */}
                    <div className="w-80 border-l border-slate-100 bg-slate-50/30 overflow-y-auto p-6 space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">About {startup.name}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {startup.description || `${startup.name} is a high-growth startup operating in the ${startup.industry || 'Technology'} sector, focused on delivering innovative solutions to complex market problems.`}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Company Profile</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400">Founded</span>
                                    <span className="text-xs font-bold text-slate-700">2022</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400">Location</span>
                                    <span className="text-xs font-bold text-slate-700">Bangalore, India</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400">Employees</span>
                                    <span className="text-xs font-bold text-slate-700">25-50</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400">Legal Name</span>
                                    <span className="text-xs font-bold text-slate-700">{startup.name} Private Limited</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
                            Download Pitch Deck
                        </button>
                    </div>
                </div>

                {/* News Section at Bottom */}
                <div className="h-72 bg-slate-50 border-t border-slate-100 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-3">
                                <Newspaper className="w-5 h-5 text-blue-500" />
                                Latest Market News
                            </h3>
                            <button className="text-[10px] font-black text-blue-600 hover:underline">VIEW ALL NEWS</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {generateCompanyNews(startup.name).map((news) => (
                                <div key={news.id} className="p-5 rounded-[2rem] bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">{news.date}</span>
                                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg">{news.tag}</span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors">{news.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center"><ExternalLink className="w-2 h-2 text-slate-400" /></div>
                                        <span className="text-[9px] font-bold text-slate-400">{news.source}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Mock Data based on the image
    const stats = [
        { label: 'Total Invested', value: formatCurrency(walletData?.totalInvested), icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
        { label: 'Earnings to Date', value: formatCurrency(7800), icon: PieChart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'Investments Made', value: startups.length.toString(), icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { label: 'Avg. Expected ROI', value: '11.2%', icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    ];

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    {currentPath === 'dashboard' ? `Good afternoon, ${user?.name?.split(' ')[0] || 'Investor'}` : 
                     currentPath.charAt(0).toUpperCase() + currentPath.slice(1).replace('-', ' ')}
                </h1>
                <p className="text-slate-500 text-sm">Acting as: <span className="font-medium text-slate-700">Falcon Trading Co.</span></p>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Stats and Opportunities */}
            <div className="xl:col-span-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[140px]">
                            <div className={clsx("p-2 w-fit rounded-xl", stat.bgColor)}>
                                <stat.icon className={clsx("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-medium mb-1">{stat.label}</p>
                                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">Latest Opportunities</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-8">
                        {opportunities.slice(0, 2).map((opp) => (
                            <div key={opp.id} className="space-y-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-blue-50">
                                        <Briefcase className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{opp.name}</h4>
                                        <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">{opp.stage}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleExpressInterest(opp.id)}
                                    disabled={opp.hasExpressedInterest}
                                    className={clsx(
                                        "w-full py-3 font-bold rounded-xl transition-all shadow-sm text-sm",
                                        opp.hasExpressedInterest ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                                    )}
                                >
                                    {opp.hasExpressedInterest ? 'Interest Expressed' : 'Express Interest'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Wallets and Loans */}
            <div className="xl:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-green-50 rounded-lg"><Wallet className="w-4 h-4 text-green-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investment Wallet</p>
                        </div>
                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-slate-400 font-bold text-sm mb-1">₹</span>
                            <span className="text-3xl font-bold text-slate-800">{walletData?.balance?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex gap-3 mb-8">
                            <button 
                                onClick={() => setIsDepositModalOpen(true)}
                                className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                Add funds
                            </button>
                            <button 
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="flex-1 py-2 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Withdraw
                            </button>
                        </div>
                        <div className="space-y-4">
                            {walletData.transactions.slice(0, 2).map((tx, idx) => (
                                <div key={tx._id || idx} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{tx.type}</p>
                                        <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className={clsx(
                                        "text-sm font-bold",
                                        ['Deposit', 'Loan Disbursement'].includes(tx.type) ? "text-green-500" : "text-red-500"
                                    )}>
                                        {['Deposit', 'Loan Disbursement'].includes(tx.type) ? '+' : '-'} ₹ {tx?.amount?.toLocaleString() || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg"><Banknote className="w-4 h-4 text-blue-600" /></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Borrowing Wallet</p>
                        </div>
                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-slate-400 font-bold text-sm mb-1">₹</span>
                            <span className="text-3xl font-bold text-slate-800">{walletData?.borrowing?.balance?.toLocaleString() || 0}</span>
                        </div>
                        <button className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors mb-8 shadow-sm shadow-blue-200">Repay Now</button>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Outstanding Repayment</p><p className="font-bold text-slate-800">₹ {walletData?.borrowing?.outstanding?.toLocaleString() || 0}</p></div>
                            <div><p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Next Payment Due</p><p className="font-bold text-slate-800">{walletData?.borrowing?.nextPayment || 'N/A'}</p></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Active Loans</h3>
                    <div className="space-y-4">
                        {loans.slice(0, 2).map((loan) => (
                            <div key={loan._id || loan.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <p className="text-lg font-bold text-slate-800">₹ {loan.amount?.toLocaleString() || 0}</p>
                                    <span className={clsx(
                                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                                        loan.status === 'Pending' ? "bg-orange-50 text-orange-500" :
                                        loan.status === 'Active' ? "bg-red-50 text-red-500" :
                                        loan.status === 'Repaid' ? "bg-green-50 text-green-500" :
                                        "bg-slate-50 text-slate-500"
                                    )}>{loan.status}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{loan.type}</p>
                                    <p className="text-xs font-bold text-slate-700">
                                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : loan.disbursed}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOpportunities = () => {
        const filteredOpportunities = opportunities.filter(opp => {
            const matchesSearch = opp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 opp.problem.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStage = filterStage === 'All' || opp.stage === filterStage;
            return matchesSearch && matchesStage;
        });

        const stages = ['All', ...new Set(opportunities.map(opp => opp.stage))];

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or problem..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                        >
                            {stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOpportunities.length > 0 ? filteredOpportunities.map((opp) => (
                        <div key={opp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform"><Briefcase className="w-6 h-6 text-blue-500" /></div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{opp.stage}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{opp.name}</h4>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1 h-10">{opp.problem}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                <div><p className="text-slate-400 text-[10px] uppercase font-bold">Investment</p><p className="font-bold text-blue-600 text-xs">{formatCurrency(opp.investmentAmount)}</p></div>
                                <div><p className="text-slate-400 text-[10px] uppercase font-bold">Market Value</p><p className="font-bold text-slate-800 text-xs truncate">{formatCurrency(opp.valuation)}</p></div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                 <button 
                                     onClick={() => setSelectedOpportunity(opp)}
                                     className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
                                 >
                                     Details
                                 </button>
                                 <button 
                                     onClick={() => {
                                         setSelectedOpportunity(opp);
                                         setIsInvestModalOpen(true);
                                     }}
                                     className="flex-1 py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors"
                                 >
                                     Invest
                                 </button>
                                 <button 
                                     onClick={() => openInterestConfirmation(opp)}
                                     disabled={opp.hasExpressedInterest}
                                     className={clsx(
                                         "flex-1 py-2.5 font-bold rounded-xl transition-all shadow-sm text-sm",
                                         opp.hasExpressedInterest ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                                     )}
                                 >
                                     {opp.hasExpressedInterest ? 'Sent' : 'Interest'}
                                 </button>
                             </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No opportunities match your search.</p>
                            <button onClick={() => { setSearchQuery(''); setFilterStage('All'); }} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderInvestments = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-800">My Portfolio</h3>
                <div className="flex gap-2">
                    <button className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-500 shadow-sm transition-all"><Filter className="w-4 h-4" /></button>
                    <button className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-500 shadow-sm transition-all"><Download className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.length > 0 ? startups.map((s) => {
                    const profit = (s.valuation || 0) - (s.investmentAmount || 0);
                    const profitPercentage = (s.investmentAmount > 0) ? (profit / s.investmentAmount) * 100 : 0;
                    const isProfit = profit >= 0;

                    return (
                        <div 
                            key={s.id} 
                            onClick={() => fetchStartupDetail(s.id)}
                            className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-50 hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{s.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.industry || 'Technology'}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                                    {s.stage}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Invested</p>
                                    <p className="text-sm font-black text-slate-900">{formatCurrency(s.investmentAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Market Value</p>
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-black text-slate-900">{formatCurrency(s.valuation)}</p>
                                        <p className={clsx(
                                            "text-[10px] font-black mt-0.5",
                                            isProfit ? "text-green-500" : "text-red-500"
                                        )}>
                                            {isProfit ? '▲' : '▼'} {Math.abs(profitPercentage).toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Growth</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.progress || 65}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-700">{s.progress || 65}%</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="p-6 bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">No active investments yet</h4>
                        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">Your portfolio is empty. Explore new opportunities to start your investment journey.</p>
                        <button 
                            onClick={() => navigate('/investor/opportunities')}
                            className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            Explore Opportunities
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderWallet = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Balance</p>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(walletData?.balance)}</p>
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={() => setIsDepositModalOpen(true)}
                            className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
                        >
                            Deposit
                        </button>
                        <button 
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="flex-1 py-2 bg-white text-slate-600 text-xs font-bold rounded-lg border border-slate-200"
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Invested</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(walletData?.totalInvested)}</p>
                    <p className="text-xs text-slate-500 mt-2">Active portfolio value</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Earnings</p>
                    <p className="text-3xl font-bold text-blue-600">₹ 7,800</p>
                    <p className="text-xs text-slate-500 mt-2">+12.5% from last month</p>
                </div>
            </div>
            {renderTransactions()}
        </div>
    );

    const renderTransactions = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Type</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {walletData?.transactions?.length > 0 ? walletData.transactions.map((tx, idx) => (
                            <tr key={tx._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                                        tx.status === 'Completed' ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
                                    )}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-700">{tx.type}</td>
                                <td className={clsx(
                                    "px-6 py-4 text-right text-xs font-bold",
                                    ['Deposit', 'Loan Disbursement'].includes(tx.type) ? "text-green-500" : "text-red-500"
                                )}>
                                    {['Deposit', 'Loan Disbursement'].includes(tx.type) ? '+' : '-'} ₹ {tx?.amount?.toLocaleString() || 0}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">No transactions yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLoans = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Borrowed</p>
                    <p className="text-3xl font-bold text-slate-800">₹ {loanStats?.totalBorrowed?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Outstanding</p>
                    <p className="text-3xl font-bold text-red-500">₹ {loanStats?.totalOutstanding?.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Loan Request Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Request a New Loan</h3>
                    <p className="text-blue-100 text-sm max-w-md">Need additional capital for your investment operations? Apply for a quick loan with competitive rates tailored for investors.</p>
                </div>
                <button 
                    onClick={() => setIsLoanModalOpen(true)}
                    className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shrink-0 shadow-md"
                >
                    Apply Now
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6">Loan Portfolio</h3>
                <div className="space-y-4">
                    {loans.length > 0 ? loans.map((loan) => (
                        <div key={loan._id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm"><Banknote className="w-6 h-6 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800">₹ {loan?.amount?.toLocaleString() || 0}</p>
                                    <p className="text-xs text-slate-500">{loan.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                                    <span className={clsx(
                                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                                        loan.status === 'Pending' ? "bg-orange-50 text-orange-500" :
                                        loan.status === 'Active' ? "bg-red-50 text-red-500" :
                                        loan.status === 'Repaid' ? "bg-green-50 text-green-500" :
                                        "bg-slate-50 text-slate-500"
                                    )}>{loan.status}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Repayment</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-slate-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${loan.repaymentProgress}%` }}></div></div>
                                        <span className="text-xs font-bold text-slate-700">{loan.repaymentProgress}%</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Applied On</p>
                                    <p className="text-xs font-bold text-slate-700">{new Date(loan.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-slate-400 italic">No loans found in your portfolio.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Monthly Investment Summary', 'Earnings Report Q1 2024', 'Tax Statements 2023', 'Portfolio Performance', 'Transaction History CSV'].map((report, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><FileText className="w-6 h-6" /></div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{report}</p>
                    </div>
                    <Download className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                </div>
            ))}
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50"><h3 className="font-bold text-slate-800">Account Settings</h3></div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label><input type="text" className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium" defaultValue={user?.name} /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label><input type="email" className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium" defaultValue={user?.email} /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Organization</label><input type="text" className="w-full px-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium" defaultValue="Falcon Trading Co." /></div>
                <div className="pt-6 border-t border-slate-50 flex justify-end gap-3"><button className="px-6 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl">Cancel</button><button className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl">Save Changes</button></div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (selectedStartupData) {
            return renderStartupDetail();
        }

        switch(currentPath) {
            case 'opportunities': return renderOpportunities();
            case 'investments': return renderInvestments();
            case 'wallet': return renderWallet();
            case 'loans': return renderLoans();
            case 'transactions': return renderTransactions();
            case 'reports': return renderReports();
            case 'settings': return renderSettings();
            default: return renderDashboard();
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6 bg-[#f8fafc]">
            {!selectedStartupData && renderHeader()}
            {renderContent()}

            {/* Loan Request Modal */}
            {isLoanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Apply for Loan</h3>
                                <p className="text-slate-500 text-sm mt-1">Fill in the details below to request a new loan.</p>
                            </div>
                            <button onClick={() => setIsLoanModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleLoanSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full pl-14 pr-4 py-3 bg-slate-50 border-none rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="0.00"
                                        value={loanFormData.amount}
                                        onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Type</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        value={loanFormData.type}
                                        onChange={(e) => setLoanFormData({ ...loanFormData, type: e.target.value })}
                                    >
                                        <option>Working Capital</option>
                                        <option>Invoice Financing</option>
                                        <option>Purchase Order Financing</option>
                                        <option>Investment Capital</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tenure (Months)</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        value={loanFormData.tenure}
                                        onChange={(e) => setLoanFormData({ ...loanFormData, tenure: e.target.value })}
                                    >
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months</option>
                                        <option value="24">24 Months</option>
                                        <option value="36">36 Months</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Purpose of Loan</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    rows="3"
                                    placeholder="Explain how you will use the funds..."
                                    value={loanFormData.purpose}
                                    onChange={(e) => setLoanFormData({ ...loanFormData, purpose: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsLoanModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={clsx(
                                        "flex-1 py-4 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]",
                                        isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                    )}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {isDepositModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Deposit Funds</h3>
                                <p className="text-slate-500 text-sm mt-1">Add money to your investment wallet.</p>
                            </div>
                            <button onClick={() => { setIsDepositModalOpen(false); setWalletAmount(''); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-14 pr-4 py-3 bg-slate-50 border-none rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="0.00"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => handleWalletAction('deposit')}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Deposit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Withdraw Funds</h3>
                                <p className="text-slate-500 text-sm mt-1">Available balance: ₹ {walletData?.balance?.toLocaleString() || 0}</p>
                            </div>
                            <button onClick={() => { setIsWithdrawModalOpen(false); setWalletAmount(''); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-14 pr-4 py-3 bg-slate-50 border-none rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="0.00"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => handleWalletAction('withdraw')}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Submit Feedback</h3>
                                <p className="text-slate-500 text-sm mt-1">Share your thoughts with the founder.</p>
                            </div>
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleFeedbackSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                            className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                feedbackData.rating >= star ? "text-yellow-400 bg-yellow-50" : "text-slate-300 bg-slate-50"
                                            )}
                                        >
                                            <Star className={clsx("w-6 h-6", feedbackData.rating >= star && "fill-current")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Comments</label>
                                <textarea 
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    rows="4"
                                    placeholder="Write your feedback here..."
                                    value={feedbackData.comment}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Opportunity Detail Modal */}
            {selectedOpportunity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <Briefcase className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{selectedOpportunity.name}</h3>
                                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{selectedOpportunity.stage} Stage</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOpportunity(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Investment</p>
                                    <p className="text-blue-600 font-bold text-sm">{formatCurrency(selectedOpportunity.investmentAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Value</p>
                                    <p className="text-slate-800 font-bold text-sm">{formatCurrency(selectedOpportunity.valuation)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Market</p>
                                    <p className="text-slate-800 font-bold text-sm truncate">{selectedOpportunity.market || 'Global'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${selectedOpportunity.progress}%` }}></div>
                                        </div>
                                        <span className="text-slate-800 font-bold text-[10px]">{selectedOpportunity.progress}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    Problem Statement
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                                    "{selectedOpportunity.problem}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Proposed Solution
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {selectedOpportunity.solution}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Personalize your interest (Optional)
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    rows="3"
                                    placeholder="Tell the founder why you're interested in their startup..."
                                    value={interestMessage}
                                    onChange={(e) => setInterestMessage(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                            <button 
                                onClick={() => setSelectedOpportunity(null)}
                                className="flex-1 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => setIsInvestModalOpen(true)}
                                className="flex-1 py-4 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                            >
                                Invest Now
                            </button>
                            <button 
                                onClick={() => openInterestConfirmation(selectedOpportunity)}
                                disabled={selectedOpportunity.hasExpressedInterest || isSubmitting}
                                className={clsx(
                                    "flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]",
                                    selectedOpportunity.hasExpressedInterest ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {isSubmitting ? 'Sending...' : selectedOpportunity.hasExpressedInterest ? 'Interest Already Sent' : 'Confirm Express Interest'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invest Modal */}
            {isInvestModalOpen && selectedOpportunity && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-blue-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <TrendingUp className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Invest in {selectedOpportunity.name}</h3>
                                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Equity Investment</p>
                                </div>
                            </div>
                            <button onClick={() => setIsInvestModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-slate-500 font-medium">Market Value (per unit)</span>
                                <span className="text-slate-800 font-bold">{formatCurrency(selectedOpportunity.valuation)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share Units</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={shareUnits}
                                    onChange={(e) => setShareUnits(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-500 font-medium">Total Investment</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(selectedOpportunity.valuation * (parseInt(shareUnits) || 0))}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Wallet Balance: {formatCurrency(walletData?.balance)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                            <button 
                                onClick={() => setIsInvestModalOpen(false)}
                                className="flex-1 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleInvest}
                                disabled={isSubmitting || !shareUnits || (selectedOpportunity.valuation * parseInt(shareUnits)) > walletData?.balance}
                                className={clsx(
                                    "flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]",
                                    (isSubmitting || !shareUnits || (selectedOpportunity.valuation * parseInt(shareUnits)) > walletData?.balance) ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {isSubmitting ? 'Processing...' : (selectedOpportunity.valuation * (parseInt(shareUnits) || 0)) > walletData?.balance ? 'Insufficient Funds' : 'Confirm Investment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interest Confirmation Modal */}
            {isInterestConfirmModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-8 h-8 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Send Interest?</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Your request will be sent to the founder of <span className="font-bold text-slate-700">{pendingInterestStartup?.name}</span>. They will be notified of your interest.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsInterestConfirmModalOpen(false);
                                    setPendingInterestStartup(null);
                                }}
                                className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleExpressInterest}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                            >
                                {isSubmitting ? 'Sending...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorDashboard;
