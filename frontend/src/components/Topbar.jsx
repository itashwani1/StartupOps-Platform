import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, Sun, Moon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const Topbar = ({ onMobileMenuClick }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isDarkMode = theme === 'dark';

    // Initial fetch
    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: long polling or socket.io could be used here for real-time
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {});
            // Update local state
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    };

    return (
        <header className={clsx(
            "h-16 border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 transition-colors duration-300",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
            {/* Mobile menu button */}
            <button
                onClick={onMobileMenuClick}
                className={clsx(
                    "p-2 rounded-lg transition-colors md:hidden",
                    isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                )}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="flex items-center flex-1 max-w-md hidden md:flex">
                <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={clsx(
                            "h-4 w-4",
                            isDarkMode ? "text-slate-500" : "text-slate-400"
                        )} />
                    </span>
                    <input
                        type="text"
                        className={clsx(
                            "block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all",
                            isDarkMode 
                                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-700" 
                                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                        )}
                        placeholder={user?.role === 'Investor' ? "Search startups, industries..." : "Search tasks, team members..."}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={clsx(
                        "p-2 rounded-full transition-colors",
                        isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
                    )}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={clsx(
                            "p-2 rounded-full transition-colors relative",
                            isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className={clsx(
                            "absolute right-0 mt-2 w-80 rounded-lg shadow-lg border py-1 z-50",
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        )}>
                            <div className={clsx(
                                "px-4 py-2 border-b flex justify-between items-center",
                                isDarkMode ? "border-slate-700" : "border-slate-100"
                            )}>
                                <h3 className={clsx(
                                    "font-semibold",
                                    isDarkMode ? "text-white" : "text-slate-700"
                                )}>Notifications</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <div
                                            key={notification._id}
                                            className={clsx(
                                                "px-4 py-3 border-b last:border-0 transition-colors cursor-pointer",
                                                isDarkMode 
                                                    ? `hover:bg-slate-700 border-slate-700 ${!notification.read ? 'bg-blue-900/20' : ''}`
                                                    : `hover:bg-slate-50 border-slate-50 ${!notification.read ? 'bg-blue-50/50' : ''}`
                                            )}
                                            onClick={() => handleMarkAsRead(notification._id)}
                                        >
                                            <p className={clsx(
                                                "text-sm",
                                                isDarkMode ? "text-slate-200" : "text-slate-800"
                                            )}>{notification.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-slate-500 text-sm">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={clsx(
                    "flex items-center space-x-3 pl-4 border-l",
                    isDarkMode ? "border-slate-800" : "border-slate-200"
                )}>
                    <div className="text-right hidden sm:block">
                        <div className={clsx(
                            "text-sm font-medium",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>{user?.name || 'User'}</div>
                        <div className="text-xs text-slate-500">{user?.role || 'Member'}</div>
                    </div>
                    <div className={clsx(
                        "h-8 w-8 rounded-full flex items-center justify-center font-medium ring-2 cursor-pointer transition-all",
                        isDarkMode 
                            ? "bg-blue-900 text-blue-400 ring-slate-800 hover:ring-blue-500" 
                            : "bg-blue-100 text-blue-700 ring-white hover:ring-blue-200"
                    )}>
                        {getInitials(user?.name)}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "p-1 ml-2 transition-colors",
                            isDarkMode ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"
                        )}
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
