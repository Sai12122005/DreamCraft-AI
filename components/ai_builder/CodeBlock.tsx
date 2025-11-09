import React, { useState } from 'react';
import { CodeFile } from '../../types';
import { translate } from '../../services/translationService';

interface CodeBlockProps {
    file: CodeFile;
    language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ file, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(file.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 flex justify-between items-center border-b">
                <div className="font-mono text-sm text-gray-600 flex items-center">
                    <FileIcon /> <span className="ml-2">{file.name}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="text-sm text-gray-500 hover:text-gray-800 flex items-center transition-colors"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span className="ml-1">{copied ? translate('copied', language) : translate('copy', language)}</span>
                </button>
            </div>
            <pre className="bg-gray-800 text-white p-4 text-sm overflow-x-auto">
                <code>{file.code}</code>
            </pre>
            <div className="p-4 bg-blue-50 border-t">
                <h4 className="font-semibold text-sm text-blue-800 mb-1">{translate('aiExplanation', language)}</h4>
                <p className="text-sm text-blue-700">{file.explanation}</p>
            </div>
        </div>
    );
};

// Icons
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

export default CodeBlock;