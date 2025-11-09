
import React from 'react';
import { Page } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
    onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
    const { signOut } = useAuth();
    
    const navItems = [
        { name: 'Dashboard', page: Page.Dashboard, icon: <HomeIcon /> },
        { name: 'AI Builder', page: Page.AIBuilder, icon: <BuilderIcon /> },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
            <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    D
                </div>
                <h1 className="text-xl font-bold ml-3 text-gray-800">DreamCraft AI</h1>
            </div>
            <nav className="flex-1">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate(item.page); }}
                                className="flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                {item.icon}
                                <span className="ml-3">{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); signOut(); }}
                    className="flex items-center px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <LogoutIcon />
                    <span className="ml-3">Logout</span>
                </a>
            </div>
        </div>
    );
};

// SVG Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const BuilderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21v-2.5M12 18.5v-2.5m0 0l2-1m-2 1l-2-1" />
    </svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default Sidebar;
