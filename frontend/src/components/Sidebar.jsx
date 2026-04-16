import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, CheckSquare, MessageSquare, BarChart3, LogOut, Sparkles, X, CreditCard, Wallet, Search, Briefcase, Heart, Settings, PieChart } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        onMobileClose?.();
    };

    const isDarkMode = theme === 'dark';

    const allNavItems = [
        // Founder & Team Items
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, roles: ['Founder', 'Team'] },
        { name: 'Startup Profile', path: '/app/profile', icon: Building2, roles: ['Founder'] },
        { name: 'Tasks & Milestones', path: '/app/tasks', icon: CheckSquare, roles: ['Founder', 'Team'] },
        { name: 'Feedback', path: '/app/feedback', icon: MessageSquare, roles: ['Founder', 'Team'] },
        { name: 'Analytics', path: '/app/analytics', icon: BarChart3, roles: ['Founder'] },
        { name: 'Pitch Generator', path: '/app/pitch', icon: Sparkles, roles: ['Founder'] },
        { name: 'Resources', path: '/app/resources', icon: Wallet, roles: ['Founder'] },
        { name: 'Subscription', path: '/app/subscription', icon: CreditCard, roles: ['Founder'] },

        // Investor Items
        { name: 'Dashboard', path: '/investor/dashboard', icon: LayoutDashboard, roles: ['Investor'] },
        { name: 'Discover Startups', path: '/investor/discover', icon: Search, roles: ['Investor'] },
        { name: 'My Investments', path: '/investor/investments', icon: Briefcase, roles: ['Investor'] },
        { name: 'Watchlist', path: '/investor/watchlist', icon: Heart, roles: ['Investor'] },
        { name: 'Messages', path: '/investor/messages', icon: MessageSquare, roles: ['Investor'] },
        { name: 'Analytics', path: '/investor/analytics', icon: PieChart, roles: ['Investor'] },
        { name: 'Settings', path: '/investor/settings', icon: Settings, roles: ['Investor'] },

        // Mentor Items
        { name: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard, roles: ['Mentor'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user?.role));


    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={clsx(
                "w-64 border-r hidden md:flex flex-col h-full transition-colors duration-300",
                isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
            )}>
                <div className="p-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className={clsx(
                            "text-xl font-bold",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>StartupOps</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                    isActive
                                        ? (isDarkMode ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-700')
                                        : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                )
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className={clsx(
                    "p-4 border-t",
                    isDarkMode ? "border-slate-800" : "border-slate-200"
                )}>
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            isDarkMode ? "text-slate-400 hover:bg-red-900/20 hover:text-red-400" : "text-slate-600 hover:bg-red-50 hover:text-red-700"
                        )}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside className={clsx(
                "fixed top-0 left-0 z-50 w-64 h-full border-r transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className={clsx(
                            "text-xl font-bold",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>StartupOps</span>
                    </div>
                    <button
                        onClick={onMobileClose}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onMobileClose}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                    isActive
                                        ? (isDarkMode ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-700')
                                        : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                )
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className={clsx(
                    "p-4 border-t",
                    isDarkMode ? "border-slate-800" : "border-slate-200"
                )}>
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            isDarkMode ? "text-slate-400 hover:bg-red-900/20 hover:text-red-400" : "text-slate-600 hover:bg-red-50 hover:text-red-700"
                        )}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
