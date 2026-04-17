import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    User, Mail, Briefcase, Phone, Calendar, Shield, 
    MapPin, ArrowLeft, BadgeCheck, Clock, Building,
    Mail as MailIcon, Smartphone, Calendar as CalendarIcon,
    ShieldCheck, UserCircle, Activity, ExternalLink,
    MoreHorizontal, Edit3, Trash2, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import EditMemberModal from '../components/EditMemberModal';

const TeamMemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            const { data } = await api.get(`/auth/user/${id}`);
            setMember(data);
        } catch (error) {
            toast.error('Failed to fetch member details');
            navigate('/app/profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateMember = async (updatedData) => {
        try {
            const { data } = await api.put(`/auth/user/${id}`, updatedData);
            setMember(data);
            toast.success('Member profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update member profile');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    if (!member) return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
            <UserCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">Member not found</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Go Back</button>
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Active': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'On Leave': 'bg-amber-50 text-amber-600 border-amber-100',
            'Inactive': 'bg-rose-50 text-rose-600 border-rose-100'
        };
        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border ${styles[status] || styles['Active']}`}>
                {status || 'Active'}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Navigation & Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center px-4 py-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to Team</span>
                </button>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2.5 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-all duration-300"
                        title="Edit Profile"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                        className="p-2.5 text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-rose-200 hover:bg-rose-50 transition-all duration-300"
                        title="More Options"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Profile Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
                {/* Banner with Pattern */}
                <div className="h-48 bg-gradient-to-br from-blue-700 via-indigo-800 to-violet-900 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
                </div>

                <div className="px-10 pb-10">
                    <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-20 gap-8">
                        {/* Avatar Wrapper */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            {member.avatar ? (
                                <img 
                                    src={member.avatar} 
                                    alt={member.name} 
                                    className="relative w-40 h-40 rounded-[2.2rem] border-[6px] border-white shadow-2xl object-cover bg-white"
                                />
                            ) : (
                                <div className="relative w-40 h-40 rounded-[2.2rem] border-[6px] border-white shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 text-5xl font-black uppercase">
                                    {member.name.charAt(0)}
                                </div>
                            )}
                            <div className="absolute bottom-4 -right-2 scale-110">
                                <StatusBadge status={member.status} />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-3 pb-2">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{member.name}</h1>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                                <div className="flex items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className="text-slate-700">{member.role}</span>
                                </div>
                                <div className="flex items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Building className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="text-slate-700">{member.department || 'General Department'}</span>
                                </div>
                                <div className="flex items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Calendar className="w-4 h-4 mr-2 text-violet-500" />
                                    <span className="text-slate-700">Joined {formatDate(member.joiningDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Detailed Info Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center">
                                <UserCircle className="w-7 h-7 mr-4 text-blue-600" />
                                Professional Profile
                            </h2>
                            <button className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Export PDF
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block group-hover:text-blue-500 transition-colors">Personal Email</label>
                                <div className="flex items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-blue-100 group-hover:bg-white transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4 text-blue-600 group-hover:scale-110 transition-transform">
                                        <MailIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{member.email}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Primary Communication</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block group-hover:text-indigo-500 transition-colors">Phone Contact</label>
                                <div className="flex items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-white transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mr-4 text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{member.phoneNumber || '+1 --- --- ----'}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Mobile Number</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block group-hover:text-violet-500 transition-colors">Department Unit</label>
                                <div className="flex items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-violet-100 group-hover:bg-white transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mr-4 text-violet-600 group-hover:scale-110 transition-transform">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{member.department || 'Not Assigned'}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Organization Hierarchy</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block group-hover:text-emerald-500 transition-colors">Start Date</label>
                                <div className="flex items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-emerald-100 group-hover:bg-white transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mr-4 text-emerald-600 group-hover:scale-110 transition-transform">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{formatDate(member.joiningDate)}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Company Onboarding</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Activity Feed Placeholder */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                            <Activity className="w-7 h-7 mr-4 text-purple-600" />
                            Recent Activity
                        </h2>
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-800 font-bold mb-1">No Activity Records Yet</p>
                            <p className="text-slate-400 text-sm text-center max-w-[280px]">When this member performs actions in the system, they will be logged here automatically.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Controls & Access */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Permissions Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
                    >
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center">
                            <ShieldCheck className="w-6 h-6 mr-3 text-orange-500" />
                            Access Control
                        </h2>
                        
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions Tier</label>
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                </div>
                                <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 relative overflow-hidden group">
                                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                        <Shield className="w-24 h-24 text-orange-600" />
                                    </div>
                                    <p className="text-lg font-black text-orange-900 mb-1">{member.accessLevel || 'Standard'}</p>
                                    <p className="text-xs text-orange-700 leading-relaxed font-medium">
                                        {member.accessLevel === 'Admin' 
                                            ? 'Full administrative privileges across all modules and system configurations.' 
                                            : 'Standard privileges for managing assigned tasks and project data sets.'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Verification Status</label>
                                <div className="flex items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                                        <BadgeCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-blue-900">{member.role} Verified</p>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">System Role</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Admin Actions Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Lock className="w-24 h-24 text-white" />
                        </div>
                        
                        <div className="relative">
                            <h3 className="text-xl font-black text-white mb-2">Management</h3>
                            <p className="text-slate-400 text-xs font-medium mb-8">Administrative actions for this account.</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="group w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-sm transition-all duration-300 border border-white/10 flex items-center justify-center shadow-lg"
                                >
                                    <Edit3 className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" />
                                    Modify Member Profile
                                </button>
                                <button className="group w-full py-4 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl font-black text-sm transition-all duration-300 border border-rose-500/20 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" />
                                    Deactivate Account
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditMemberModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateMember}
                memberData={member}
            />
        </div>
    );
};

export default TeamMemberDetail;
