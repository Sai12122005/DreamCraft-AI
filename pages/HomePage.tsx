
import React from 'react';
import { Page } from '../types';
import Button from '../components/common/Button';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 text-center">
             <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
             <div className="relative z-10 w-full max-w-3xl">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    D
                </div>
                <h1 className="mt-6 text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                    DreamCraft AI
                </h1>
                <p className="mt-4 text-lg md:text-xl text-slate-600">
                    Turn Dreams into Apps. Instantly.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-3" onClick={() => onNavigate(Page.AIBuilder)}>
                        Start Building
                    </Button>
                    <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3" onClick={() => onNavigate(Page.Auth)}>
                        Login / Signup
                    </Button>
                </div>
                <p className="mt-12 text-slate-500">
                    An advanced AI system that behaves like Google AI Studio, designed to turn your ideas into fully functional applications.
                </p>
            </div>
        </div>
    );
};

export default HomePage;
