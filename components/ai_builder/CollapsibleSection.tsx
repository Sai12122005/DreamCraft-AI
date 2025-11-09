
import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700"
            >
                <span>{title}</span>
                <ChevronDownIcon isOpen={isOpen} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export default CollapsibleSection;
