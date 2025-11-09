
import React, { useState, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AIBuilderPage from './pages/AIBuilderPage';
import Sidebar from './components/layout/Sidebar';
import { Page } from './types';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>(user ? Page.Dashboard : Page.Home);
    const [activeProject, setActiveProject] = useState<string | null>(null);

    const navigate = useCallback((page: Page, projectId: string | null = null) => {
        setCurrentPage(page);
        if (projectId) {
            setActiveProject(projectId);
        }
    }, []);
    
    const mainContent = useMemo(() => {
        if (!user) {
            if (currentPage === Page.Auth) {
                return <AuthPage onAuthSuccess={() => navigate(Page.Dashboard)} />;
            }
            return <HomePage onNavigate={navigate} />;
        }

        switch (currentPage) {
            case Page.Dashboard:
                return <DashboardPage onNavigate={navigate} />;
            case Page.AIBuilder:
                return <AIBuilderPage project={activeProject} onNavigate={navigate} />;
            default:
                return <DashboardPage onNavigate={navigate} />;
        }
    }, [user, currentPage, navigate, activeProject]);

    return (
        <div className="flex h-screen w-screen bg-gray-50 text-gray-800">
            {user && <Sidebar onNavigate={navigate} />}
            <main className="flex-1 overflow-y-auto">
                {mainContent}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
