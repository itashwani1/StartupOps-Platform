import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Phone, Calendar, Shield, MapPin, Upload, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditMemberModal = ({ isOpen, onClose, onUpdate, memberData }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Team',
        department: '',
        accessLevel: 'Standard',
        phoneNumber: '',
        joiningDate: '',
        avatar: '',
        status: 'Active'
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (memberData) {
            setFormData({
                name: memberData.name || '',
                email: memberData.email || '',
                role: memberData.role || 'Team',
                department: memberData.department || '',
                accessLevel: memberData.accessLevel || 'Standard',
                phoneNumber: memberData.phoneNumber || '',
                joiningDate: memberData.joiningDate ? new Date(memberData.joiningDate).toISOString().split('T')[0] : '',
                avatar: memberData.avatar || '',
                status: memberData.status || 'Active'
            });
        }
    }, [memberData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.name || !formData.email) {
            setError('Name and Email are required.');
            setIsSubmitting(false);
            return;
        }

        try {
            await onUpdate(formData);
            onClose();
        } catch (err) {
            setError('Failed to update member profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const InputField = ({ label, icon: Icon, name, type = "text", placeholder, options }) => (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
                {options ? (
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.2rem] focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                        placeholder={placeholder}
                    />
                )}
                {options && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Modify Profile</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Management Portal</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Section: Identity */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Identity Details</span>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Full Name" icon={User} name="name" placeholder="John Doe" />
                                    <InputField label="Email Address" icon={Mail} name="email" type="email" placeholder="john@startup.com" />
                                </div>
                            </div>

                            {/* Section: Organization */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Work & Status</span>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="System Role" 
                                        icon={Briefcase} 
                                        name="role" 
                                        options={[
                                            { value: 'Founder', label: 'Founder' },
                                            { value: 'Team', label: 'Team Member' },
                                            { value: 'Investor', label: 'Investor' },
                                            { value: 'Mentor', label: 'Mentor' }
                                        ]} 
                                    />
                                    <InputField label="Department" icon={Building} name="department" placeholder="Engineering, Sales, etc." />
                                    <InputField label="Phone Contact" icon={Phone} name="phoneNumber" placeholder="+1 (555) 000-0000" />
                                    <InputField label="Joining Date" icon={Calendar} name="joiningDate" type="date" />
                                </div>
                            </div>

                            {/* Section: Governance */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Permissions & UI</span>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="Access Level" 
                                        icon={Shield} 
                                        name="accessLevel" 
                                        options={[
                                            { value: 'Standard', label: 'Standard User' },
                                            { value: 'Editor', label: 'Editor Access' },
                                            { value: 'Admin', label: 'Administrator' },
                                            { value: 'Full', label: 'Full Ownership' }
                                        ]} 
                                    />
                                    <InputField 
                                        label="Account Status" 
                                        icon={Activity} 
                                        name="status" 
                                        options={[
                                            { value: 'Active', label: 'Active Status' },
                                            { value: 'On Leave', label: 'On Leave' },
                                            { value: 'Inactive', label: 'Deactivated' }
                                        ]} 
                                    />
                                    <div className="md:col-span-2">
                                        <InputField label="Avatar Image URL" icon={Upload} name="avatar" placeholder="https://example.com/photo.jpg" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 hover:border-slate-300 transition-all duration-300"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            form="edit-member-form"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <CheckCircle2 className="w-5 h-5" />
                            )}
                            {isSubmitting ? 'Updating...' : 'Commit Changes'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Simplified Activity icon
const Activity = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default EditMemberModal;