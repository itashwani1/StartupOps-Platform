import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserX, Clock, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const Connections = () => {
    const { user } = useAuth();
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.startup) {
            fetchInterests();
        }
    }, [user]);

    const fetchInterests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/access/interests/${user.startup}`);
            setInterests(data.interests);
        } catch (error) {
            console.error('Error fetching interests:', error);
            toast.error('Failed to load connection requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (interestId, action) => {
        try {
            await api.put(`/access/interest/${interestId}`, { action });
            toast.success(`Request ${action.toLowerCase()}ed successfully`);
            // Update local state
            setInterests(prev => prev.map(item => 
                item._id === interestId ? { ...item, status: action === 'Accept' ? 'Connected' : 'Declined' } : item
            ));
        } catch (error) {
            toast.error('Failed to process request');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Investor Connections</h1>
                <p className="text-slate-500">Manage interest requests and access from potential investors.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Interest Requests</h2>
                </div>

                <div className="divide-y divide-slate-50">
                    {interests.length > 0 ? interests.map((request) => (
                        <div key={request._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                                    {request.investor.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900">{request.investor.name}</h3>
                                        <span className={clsx(
                                            "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                                            request.status === 'Pending' ? "bg-orange-50 text-orange-500" :
                                            request.status === 'Connected' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                                        )}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-2">{request.investor.email}</p>
                                    
                                    {request.message && (
                                        <div className="flex gap-2 bg-white p-3 rounded-lg border border-slate-100 mt-2">
                                            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-600 italic">"{request.message}"</p>
                                        </div>
                                    )}
                                    
                                    <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Requested on {new Date(request.requestedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {request.status === 'Pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleRespond(request._id, 'Accept')}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
                                        >
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Accept & Grant Access
                                        </button>
                                        <button 
                                            onClick={() => handleRespond(request._id, 'Decline')}
                                            className="flex items-center px-4 py-2 bg-white text-slate-600 text-sm font-bold rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <UserX className="w-4 h-4 mr-2" />
                                            Decline
                                        </button>
                                    </>
                                ) : request.status === 'Connected' ? (
                                    <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg">
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Access Active
                                    </div>
                                ) : (
                                    <div className="text-slate-400 font-bold text-sm bg-slate-50 px-4 py-2 rounded-lg">
                                        Request Declined
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1">No requests yet</h3>
                            <p className="text-slate-500 text-sm">When investors express interest in your startup, they'll appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Connections;
