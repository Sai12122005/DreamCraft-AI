
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Project, Page } from '../types';
import { getProjects } from '../services/firebaseMock';
import Button from '../components/common/Button';

interface DashboardPageProps {
    onNavigate: (page: Page, projectId?: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            if (user) {
                setIsLoading(true);
                const userProjects = await getProjects(user.uid);
                setProjects(userProjects);
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    return (
        <div className="p-8 h-full bg-gray-50">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.displayName || 'Developer'}!</p>
            </header>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">My Projects</h2>
                <Button onClick={() => onNavigate(Page.AIBuilder)}>
                    <PlusIcon />
                    Start New Project
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project, onNavigate: (page: Page, projectId: string) => void }> = ({ project, onNavigate }) => (
    <div 
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all cursor-pointer"
        onClick={() => onNavigate(Page.AIBuilder, project.id)}
    >
        <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{project.description}</p>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{project.language}</span>
            <span>{project.createdAt.toLocaleDateString()}</span>
        </div>
    </div>
);

const ProjectCardSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
    </div>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);


export default DashboardPage;
