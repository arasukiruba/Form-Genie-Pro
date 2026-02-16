import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { announcementsApi } from '../services/api';
import { LayoutDashboard, Users, Zap, LogOut, Sparkles, CreditCard, Megaphone, AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'urgent';
    created_at: string;
}

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await announcementsApi.getActive();
                setAnnouncements(data.announcements || []);
            } catch {
                // ignore
            }
        };
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const linkClasses = (isActive: boolean) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-gradient-to-r from-[#4285F4]/10 to-[#5a9cf5]/10 text-[#4285F4] shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;

    const typeConfig: Record<string, { bg: string; border: string; icon: React.ReactNode; color: string }> = {
        info: { bg: '#eff6ff', border: '#bfdbfe', icon: <Info style={{ width: 14, height: 14, color: '#3b82f6' }} />, color: '#1e40af' },
        warning: { bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle style={{ width: 14, height: 14, color: '#f59e0b' }} />, color: '#92400e' },
        success: { bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle style={{ width: 14, height: 14, color: '#10b981' }} />, color: '#065f46' },
        urgent: { bg: '#fef2f2', border: '#fecaca', icon: <AlertOctagon style={{ width: 14, height: 14, color: '#ef4444' }} />, color: '#991b1b' },
    };

    return (
        <aside
            style={{
                width: '260px',
                height: '100vh',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                borderRight: '1px solid #e8e5f0',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                fontFamily: "'Inter', sans-serif",
                overflowY: 'auto',
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
                <div style={{ background: 'linear-gradient(135deg, #4285F4, #5a9cf5)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e1b2e' }}>Form Genie</h2>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9e97b0', fontWeight: 500 }}>Smart Automation</p>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                <NavLink to="/dashboard" className={({ isActive }) => linkClasses(isActive)}>
                    <LayoutDashboard style={{ width: 18, height: 18 }} />
                    Dashboard
                </NavLink>
                <NavLink to="/dashboard/automate" className={({ isActive }) => linkClasses(isActive)}>
                    <Zap style={{ width: 18, height: 18 }} />
                    Automate Form
                </NavLink>
                {user?.role === 'admin' && (
                    <NavLink to="/admin" className={({ isActive }) => linkClasses(isActive)}>
                        <Users style={{ width: 18, height: 18 }} />
                        User Management
                    </NavLink>
                )}
            </nav>

            {/* Announcements Card */}
            {announcements.length > 0 && (
                <div style={{ background: '#fafafa', borderRadius: '12px', border: '1px solid #e8e5f0', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e8e5f0', background: '#f5f3ff' }}>
                        <Megaphone style={{ width: 14, height: 14, color: '#7c3aed' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Announcements
                        </span>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '8px' }}>
                        {announcements.map((ann) => {
                            const config = typeConfig[ann.type] || typeConfig.info;
                            return (
                                <div key={ann.id} style={{ background: config.bg, border: `1px solid ${config.border}`, borderRadius: '8px', padding: '10px 12px', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        {config.icon}
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: config.color }}>{ann.title}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '11px', color: config.color, opacity: 0.85, lineHeight: 1.4 }}>{ann.message}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Credits Display */}
            {user && (
                <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #d4e3fc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CreditCard style={{ width: 16, height: 16, color: '#4285F4' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4285F4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credits</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e1b2e' }}>{user.role === 'admin' ? '∞' : user.credits.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#6b6580', marginTop: '4px' }}>{user.role === 'admin' ? 'Unlimited (Admin)' : `${user.plan || 'N/A'} plan`}</div>
                </div>
            )}

            {/* User Info + Logout */}
            <div style={{ borderTop: '1px solid #e8e5f0', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4285F4, #5a9cf5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e1b2e' }}>{user?.name || 'User'}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9e97b0' }}>{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: '1px solid #e8e5f0', borderRadius: '10px', background: 'transparent', color: '#6b6580', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b6580'; (e.currentTarget as HTMLElement).style.borderColor = '#e8e5f0'; }}
                >
                    <LogOut style={{ width: 16, height: 16 }} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
