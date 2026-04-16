import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Target, 
    CheckCircle, 
    Clock, 
    MessageSquare, 
    Star, 
    Eye, 
    List, 
    Wallet, 
    Search, 
    Filter, 
    ChevronRight, 
    Info, 
    ArrowUpRight, 
    Users, 
    Globe, 
    Briefcase, 
    PieChart as PieChartIcon,
    X,
    Heart,
    Download,
    ExternalLink,
    Send
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line
} from 'recharts';
import { investorMockData } from '../services/mockData';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const InvestorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [startups, setStartups] = useState([]);
    const [filteredStartups, setFilteredStartups] = useState([]);
    const [selectedStartup, setSelectedStartup] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [watchlist, setWatchlist] = useState(investorMockData.watchlist);
    const [interestedStartups, setInterestedStartups] = useState([]);
    
    // Filters
    const [filters, setFilters] = useState({
        industry: 'All',
        stage: 'All',
        fundingRange: 'All',
        location: 'All'
    });

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setStartups(investorMockData.startups);
            setFilteredStartups(investorMockData.startups);
            setLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        let result = startups;
        if (filters.industry !== 'All') {
            result = result.filter(s => s.industry === filters.industry);
        }
        if (filters.stage !== 'All') {
            result = result.filter(s => s.stage === filters.stage);
        }
        // Add more filter logic as needed
        setFilteredStartups(result);
    }, [filters, startups]);

    const handleViewDetails = (startup) => {
        setSelectedStartup(startup);
        setShowModal(true);
    };

    const toggleWatchlist = (id) => {
        if (watchlist.includes(id)) {
            setWatchlist(watchlist.filter(item => item !== id));
            toast.success('Removed from watchlist');
        } else {
            setWatchlist([...watchlist, id]);
            toast.success('Added to watchlist');
        }
    };

    const toggleInterest = (id) => {
        if (interestedStartups.includes(id)) {
            setInterestedStartups(interestedStartups.filter(item => item !== id));
            toast.success('Interest removed');
        } else {
            setInterestedStartups([...interestedStartups, id]);
            toast.success('Interest expressed!');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 animate-pulse">Loading Investor Portal...</p>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-12">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <OverviewCard 
                    title="Total Startups Viewed" 
                    value={investorMockData.overview.totalViewed} 
                    icon={Eye} 
                    trend="+12% this month"
                    color="blue"
                />
                <OverviewCard 
                    title="Shortlisted Startups" 
                    value={investorMockData.overview.shortlisted} 
                    icon={List} 
                    trend="+5 new today"
                    color="purple"
                />
                <OverviewCard 
                    title="Investments Made" 
                    value={investorMockData.overview.investmentsMade} 
                    icon={Briefcase} 
                    trend="2 in progress"
                    color="green"
                />
                <OverviewCard 
                    title="Available Budget" 
                    value={investorMockData.overview.availableBudget} 
                    icon={Wallet} 
                    trend="Allocated: $7.5M"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Discovery Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Discovery Header & Filters */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <Search className="w-5 h-5 mr-2 text-blue-500" />
                                    Discover Startups
                                </h2>
                                <p className="text-slate-400 text-sm">Find your next unicorn investment</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                                    <Filter className="w-4 h-4 mr-2" />
                                    All Filters
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FilterSelect 
                                label="Industry" 
                                options={['All', 'CleanTech', 'HealthTech', 'FinTech', 'AI']} 
                                value={filters.industry}
                                onChange={(val) => setFilters({...filters, industry: val})}
                            />
                            <FilterSelect 
                                label="Stage" 
                                options={['All', 'Idea', 'MVP', 'Revenue']} 
                                value={filters.stage}
                                onChange={(val) => setFilters({...filters, stage: val})}
                            />
                            <FilterSelect 
                                label="Funding" 
                                options={['All', '< $500k', '$500k - $2M', '> $2M']} 
                                value={filters.fundingRange}
                                onChange={(val) => setFilters({...filters, fundingRange: val})}
                            />
                            <FilterSelect 
                                label="Location" 
                                options={['All', 'USA', 'Europe', 'Asia']} 
                                value={filters.location}
                                onChange={(val) => setFilters({...filters, location: val})}
                            />
                        </div>
                    </div>

                    {/* Startup List */}
                    <div className="space-y-4">
                        {filteredStartups.map(startup => (
                            <StartupCard 
                                key={startup.id} 
                                startup={startup} 
                                onDetails={() => handleViewDetails(startup)}
                                isWatchlisted={watchlist.includes(startup.id)}
                                onWatchlist={() => toggleWatchlist(startup.id)}
                                isInterested={interestedStartups.includes(startup.id)}
                                onInterest={() => toggleInterest(startup.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar Analytics & Recommendations */}
                <div className="space-y-8">
                    {/* Recommended Startups */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                            AI Recommendations
                        </h3>
                        <div className="space-y-4">
                            {investorMockData.recommended.map(item => (
                                <div key={item.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{item.name}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                                            {item.stage}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-400 space-x-3">
                                        <span>{item.industry}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>Req: {item.fundingRequired}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center">
                            View All Suggestions
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    {/* Investment Distribution */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                            Portfolio Distribution
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={investorMockData.analytics.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {investorMockData.analytics.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {investorMockData.analytics.distribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center text-xs text-slate-400">
                                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.name} ({entry.value}%)
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                            Performance Overview
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={investorMockData.analytics.performance}>
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="growth" stroke="#10b981" fillOpacity={1} fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Startup Details Modal */}
            {showModal && selectedStartup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        {/* Close Button */}
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-12">
                            {/* Modal Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
                                        {selectedStartup.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h2 className="text-4xl font-black text-white">{selectedStartup.name}</h2>
                                            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                                                {selectedStartup.stage}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-slate-400 space-x-4">
                                            <span className="flex items-center"><Globe className="w-4 h-4 mr-1.5" /> {selectedStartup.location}</span>
                                            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {selectedStartup.industry}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => toggleWatchlist(selectedStartup.id)}
                                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center"
                                    >
                                        <Heart className={clsx("w-5 h-5 mr-2", watchlist.includes(selectedStartup.id) ? "fill-red-500 text-red-500" : "")} />
                                        Watchlist
                                    </button>
                                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center">
                                        Invest Now
                                        <ArrowUpRight className="w-5 h-5 ml-2" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Core Info */}
                                <div className="lg:col-span-2 space-y-10">
                                    <section>
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <Info className="w-5 h-5 mr-2 text-blue-500" />
                                            The Vision
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">The Problem</p>
                                                <p className="text-slate-200 leading-relaxed">{selectedStartup.problem}</p>
                                            </div>
                                            <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                                                <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">The Solution</p>
                                                <p className="text-slate-200 leading-relaxed">{selectedStartup.solution}</p>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                                            Traction & Growth
                                        </h3>
                                        <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                                            <div className="h-64 mb-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={selectedStartup.growthData}>
                                                        <defs>
                                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                        />
                                                        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                                    <p className="text-xs text-slate-500 mb-1">Current Users</p>
                                                    <p className="text-xl font-bold text-white">50k+</p>
                                                </div>
                                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                                    <p className="text-xs text-slate-500 mb-1">Monthly Growth</p>
                                                    <p className="text-xl font-bold text-green-400">20%</p>
                                                </div>
                                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                                    <p className="text-xs text-slate-500 mb-1">Retention</p>
                                                    <p className="text-xl font-bold text-white">85%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-purple-500" />
                                            Meet the Team
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedStartup.team.map(member => (
                                                <div key={member.name} className="flex items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300 mr-4">
                                                        {member.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{member.name}</p>
                                                        <p className="text-xs text-blue-400 font-medium">{member.role}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{member.experience}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Investment Stats & Actions */}
                                <div className="space-y-8">
                                    {/* Financial Insights */}
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl">
                                        <h4 className="text-lg font-bold text-white mb-6">Investment Insights</h4>
                                        <div className="space-y-6">
                                            <StatItem label="Funding Required" value={selectedStartup.fundingRequired} />
                                            <StatItem label="Equity Offered" value={selectedStartup.equity} />
                                            <StatItem label="Valuation" value={selectedStartup.valuation} />
                                            <div className="pt-4 border-t border-slate-700/50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-slate-400">Estimated ROI</span>
                                                    <span className="text-lg font-black text-green-400">{selectedStartup.roi}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-400">Risk Profile</span>
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest",
                                                        selectedStartup.risk === 'Low' ? "bg-green-500/20 text-green-400" :
                                                        selectedStartup.risk === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-red-500/20 text-red-400"
                                                    )}>
                                                        {selectedStartup.risk}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resources</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <ActionButton icon={Download} label="Download Pitch Deck" />
                                            <ActionButton icon={ExternalLink} label="Visit Demo" />
                                            <ActionButton icon={MessageSquare} label="Message Founder" />
                                        </div>
                                    </div>

                                    {/* Communication Section */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                                        <h4 className="text-sm font-bold text-white mb-4">Direct Chat</h4>
                                        <div className="bg-slate-800/50 rounded-2xl p-4 h-32 mb-4 overflow-y-auto">
                                            <p className="text-xs text-slate-500 italic">No messages yet. Start the conversation!</p>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Type a message..." 
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                                            />
                                            <button className="absolute right-2 top-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                                                <Send className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                        <button className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center">
                                            Request Meeting
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const OverviewCard = ({ title, value, icon: Icon, trend, color }) => {
    const colorClasses = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        green: "text-green-500 bg-green-500/10 border-green-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl border", colorClasses[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <p className="text-3xl font-black text-white">{value}</p>
            </div>
        </div>
    );
};

const StartupCard = ({ startup, onDetails, isWatchlisted, onWatchlist, isInterested, onInterest }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0">
                    {startup.name[0]}
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{startup.name}</h3>
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-700">
                                {startup.industry}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={onWatchlist}
                                className={clsx(
                                    "p-2 rounded-lg border transition-all",
                                    isWatchlisted ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                                )}
                            >
                                <Heart className={clsx("w-4 h-4", isWatchlisted ? "fill-red-500" : "")} />
                            </button>
                            <button 
                                onClick={onInterest}
                                className={clsx(
                                    "px-4 py-2 text-sm font-bold rounded-lg transition-colors",
                                    isInterested 
                                        ? "bg-green-600 text-white hover:bg-green-500" 
                                        : "bg-blue-600 text-white hover:bg-blue-500"
                                )}
                            >
                                {isInterested ? 'Interested' : 'Mark Interested'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <CardMetric label="Stage" value={startup.stage} />
                        <CardMetric label="Funding Required" value={startup.fundingRequired} />
                        <CardMetric label="Traction" value={startup.traction} />
                        <CardMetric label="Location" value={startup.location} />
                    </div>

                    <button 
                        onClick={onDetails}
                        className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center transition-colors"
                    >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CardMetric = ({ label, value }) => (
    <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
);

const FilterSelect = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const StatItem = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-base font-bold text-white">{value}</span>
    </div>
);

const ActionButton = ({ icon: Icon, label }) => (
    <button className="w-full flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 text-sm text-slate-300 hover:text-white transition-all">
        <span className="flex items-center">
            <Icon className="w-4 h-4 mr-3 text-blue-400" />
            {label}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
    </button>
);

export default InvestorDashboard;
