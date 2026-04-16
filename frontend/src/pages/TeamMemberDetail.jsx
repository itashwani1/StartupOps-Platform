import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    User, Mail, Briefcase, Phone, Calendar, Shield, 
    MapPin, ArrowLeft, BadgeCheck, Clock, Building,
    Mail as MailIcon, Smartphone, Calendar as CalendarIcon,
    ShieldCheck, UserCircle, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TeamMemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!member) return <div className="p-8 text-center">Member not found</div>;

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
            'Active': 'bg-green-100 text-green-700 border-green-200',
            'On Leave': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Inactive': 'bg-red-100 text-red-700 border-red-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles['Active']}`}>
                {status || 'Active'}
            </span>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Team
            </button>

            {/* Profile Header Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8"
            >
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col sm:flex-row items-end -mt-16 mb-6 gap-6">
                        <div className="relative">
                            {member.avatar ? (
                                <img 
                                    src={member.avatar} 
                                    alt={member.name} 
                                    className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                                    {member.name.charAt(0)}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2">
                                <StatusBadge status={member.status} />
                            </div>
                        </div>
                        <div className="flex-1 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                <h1 className="text-3xl font-extrabold text-slate-900">{member.name}</h1>
                                <span className="text-slate-400 font-medium text-lg">{member.memberId || member.username}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500">
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1.5" />
                                    {member.role}
                                </div>
                                <div className="flex items-center">
                                    <Building className="w-4 h-4 mr-1.5" />
                                    {member.department || 'General'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Essential Info */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-8"
                >
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <UserCircle className="w-5 h-5 mr-3 text-blue-600" />
                            Employee Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="flex items-center text-slate-700">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-3">
                                        <MailIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="font-medium">{member.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                <div className="flex items-center text-slate-700">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-3">
                                        <Smartphone className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="font-medium">{member.phoneNumber || 'Not provided'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                                <div className="flex items-center text-slate-700">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-3">
                                        <Building className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="font-medium">{member.department || 'Not specified'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                                <div className="flex items-center text-slate-700">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-3">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="font-medium">{formatDate(member.joiningDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <Activity className="w-5 h-5 mr-3 text-purple-600" />
                            Work History & Activity
                        </h2>
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                            <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400">Activity logs will appear here as they are generated.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Governance */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-3 text-orange-600" />
                            Permissions
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Access Level</label>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start">
                                    <Shield className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-orange-900">{member.accessLevel || 'Standard'}</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            {member.accessLevel === 'Admin' ? 'Can manage team members and settings.' : 'Can manage assigned tasks and project data.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">System Role</h3>
                                <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                                    <BadgeCheck className="w-4 h-4 text-blue-500 mr-2" />
                                    <span className="text-sm font-medium text-slate-700">{member.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white">
                        <h3 className="text-lg font-bold mb-2">Admin Actions</h3>
                        <p className="text-indigo-100 text-sm mb-6">Manage account status and accessibility.</p>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/10">
                                Edit Member Profile
                            </button>
                            <button className="w-full py-3 bg-red-500/80 hover:bg-red-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20">
                                Suspend Account
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TeamMemberDetail;
