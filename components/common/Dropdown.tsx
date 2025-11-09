import React from 'react';

interface DropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, icon, disabled = false }) => {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                {icon}
                <span className="ml-2">{label}</span>
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Dropdown;