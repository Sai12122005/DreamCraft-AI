import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Page, GeneratedApp, CodeFile } from '../types';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';
import { generateApp, refineApp } from '../services/geminiService';
import { translate } from '../services/translationService';
import CollapsibleSection from '../components/ai_builder/CollapsibleSection';
import CodeBlock from '../components/ai_builder/CodeBlock';
import JSZip from 'jszip';

// SpeechRecognition API interfaces
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}
// Fix for: Cannot find name 'SpeechRecognitionErrorEvent'.
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

// Fix for: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}


interface AIBuilderPageProps {
    project: string | null;
    onNavigate: (page: Page) => void;
}

const AIBuilderPage: React.FC<AIBuilderPageProps> = ({ project, onNavigate }) => {
    const [prompt, setPrompt] = useState('Create a simple to-do list app');
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [frontend, setFrontend] = useState('React');
    const [backend, setBackend] = useState('Node.js');
    const [database, setDatabase] = useState('Firebase');
    const [language, setLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAttachedFile(event.target.files[0]);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };
    
    const handleVoiceInput = useCallback(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert("Your browser doesn't support the SpeechRecognition API. Try Chrome or Firefox.");
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }
        
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.lang = language;
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setPrompt(p => p ? `${p} ${transcript}` : transcript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);

    }, [isRecording, language]);


    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedApp(null);
        setError(null);

        let fileData: { mimeType: string; data: string } | null = null;
        if (attachedFile) {
            try {
                const base64Data = await fileToBase64(attachedFile);
                fileData = { mimeType: attachedFile.type, data: base64Data };
            } catch (err) {
                 setError("Failed to read the attached file.");
                 setIsLoading(false);
                 return;
            }
        }

        try {
            const result = await generateApp(prompt, frontend, backend, database, fileData);
            setGeneratedApp(result);
            setActiveTab('preview');
        } catch (error) {
            console.error("Failed to generate app:", error);
            setError('Sorry, something went wrong while generating your app. Please try again or check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefine = async () => {
        if (!refinementPrompt || !generatedApp) return;
        setIsRefining(true);
        setError(null);
        try {
            const result = await refineApp(refinementPrompt, generatedApp);
            setGeneratedApp(result);
            setRefinementPrompt(''); // Clear input after successful refinement
        } catch (error) {
            console.error("Failed to refine app:", error);
            setError('Sorry, something went wrong while refining your app. Please try again.');
        } finally {
            setIsRefining(false);
        }
    };

    const handleStartOver = () => {
        setGeneratedApp(null);
        setPrompt('Create a simple to-do list app');
        setRefinementPrompt('');
        setError(null);
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setActiveTab('code');
    };

    const handleDownload = async () => {
        if (!generatedApp) return;

        const zip = new JSZip();
        generatedApp.files.forEach(file => {
            zip.file(file.name, file.code);
        });

        try {
            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'dreamcraft-app.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Failed to generate ZIP file:", error);
            setError('Sorry, something went wrong while creating the ZIP file.');
        }
    };

    const previewHtml = useMemo(() => {
        if (!generatedApp) return '';
        
        const mainHtmlFile = generatedApp.files.find(f => f.name.toLowerCase().endsWith('index.html'));
        if (!mainHtmlFile) {
             const fileList = generatedApp.files.map(f => `<li>${f.name}</li>`).join('');
             return `
                <html>
                    <head>
                        <title>App Preview</title>
                        <style>
                            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
                            .container { text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            h2 { color: #1d4ed8; }
                            ul { list-style-type: none; padding: 0; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; max-width: 300px; margin: 1rem auto; }
                            li { padding: 0.25rem 0; font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>index.html Not Found</h2>
                            <p>The AI generated the following files, but a preview could not be rendered automatically because a main 'index.html' file is missing.</p>
                            <ul>${fileList}</ul>
                        </div>
                    </body>
                </html>
            `;
        }
        
        let htmlContent = mainHtmlFile.code;

        // Best-effort replacement for local CSS and JS files to make preview work.
        // It scans for local <link> and <script> tags and replaces them with inline content.
        generatedApp.files.forEach(file => {
            if (file === mainHtmlFile) return;

            const fileName = file.name.split('/').pop();
            if (!fileName) return;

            if (file.name.endsWith('.css')) {
                const regex = new RegExp(`<link[^>]*href=["'](.*?/?)${fileName}["'][^>]*>`, 'gi');
                htmlContent = htmlContent.replace(regex, `<style>${file.code}</style>`);
            }
            
            if (file.name.endsWith('.js')) {
                const regex = new RegExp(`<script[^>]*src=["'](.*?/?)${fileName}["'][^>]*>\\s*<\\/script>`, 'gi');
                htmlContent = htmlContent.replace(regex, (match) => {
                    if (match.toLowerCase().includes('type="module"')) {
                        return match;
                    }
                    return `<script>${file.code}</script>`;
                });
            }
        });
        
        return htmlContent;
    }, [generatedApp]);
    
    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'ta', label: 'Tamil' },
        { value: 'te', label: 'Telugu' },
        { value: 'ar', label: 'Arabic' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'de', label: 'German' },
    ];
    
    return (
        <div className="h-full flex flex-col bg-gray-50">
            <header className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">{translate('aiBuilderTitle', language)}</h1>
                    <p className="text-sm text-gray-500">{translate('aiBuilderSubtitle', language)}</p>
                </div>
                {generatedApp && (
                    <div className="flex items-center gap-2">
                         <Button onClick={handleDownload} variant="secondary">
                            <DownloadIcon />
                            {translate('downloadZipButton', language)}
                        </Button>
                        <Button onClick={handleStartOver} variant="secondary">
                            {translate('startOverButton', language)}
                        </Button>
                    </div>
                )}
            </header>

            <div className="flex-1 p-6 overflow-y-auto">
                {generatedApp ? (
                    <div className="animate-fade-in">
                        <div className="mb-4 border-b border-gray-200">
                             <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <button onClick={() => setActiveTab('preview')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    {translate('previewTab', language)}
                                </button>
                                <button onClick={() => setActiveTab('code')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'code' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    {translate('codeTab', language)}
                                </button>
                             </nav>
                        </div>
                        {activeTab === 'preview' ? (
                            <div className="w-full h-[60vh] bg-white rounded-lg shadow border">
                                <iframe srcDoc={previewHtml} title="App Preview" className="w-full h-full border-0 rounded-lg" sandbox="allow-scripts allow-modals allow-forms" />
                            </div>
                        ) : (
                             <div className="space-y-6">
                                <CollapsibleSection title={translate('summarySection', language)}>
                                    <p className="text-gray-600">{generatedApp.summary}</p>
                                </CollapsibleSection>
                                <CollapsibleSection title={translate('architectureSection', language)}>
                                    <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-x-auto"><code>{generatedApp.architecture}</code></pre>
                                </CollapsibleSection>
                                <CollapsibleSection title={translate('folderStructureSection', language)}>
                                    <pre className="text-sm bg-gray-100 p-4 rounded-md"><code>{generatedApp.folderStructure}</code></pre>
                                </CollapsibleSection>
                                <CollapsibleSection title={translate('codeFilesSection', language)}>
                                    <div className="space-y-4">
                                        {generatedApp.files.map((file, index) => (
                                            <CodeBlock key={index} file={file} language={language} />
                                        ))}
                                    </div>
                                </CollapsibleSection>
                                <CollapsibleSection title={translate('deploymentSection', language)}>
                                    <pre className="text-sm bg-gray-100 p-4 rounded-md whitespace-pre-wrap"><code>{generatedApp.deployment}</code></pre>
                                </CollapsibleSection>
                            </div>
                        )}
                    </div>
                ) : isLoading ? (
                     <LoadingState language={language} />
                ) : error ? (
                    <ErrorState message={error} language={language} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                            D
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700">{translate('welcomeHeader', language)}</h2>
                        <p className="text-gray-500">{translate('welcomeSubheader', language)}</p>
                    </div>
                )}
            </div>

            <footer className="p-4 bg-white border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Dropdown label={translate('frontendLabel', language)} value={frontend} onChange={setFrontend} options={['React', 'React Native', 'HTML/CSS/JS', 'Flutter', 'Streamlit']} icon={<CodeIcon />} disabled={!!generatedApp} />
                    <Dropdown label={translate('backendLabel', language)} value={backend} onChange={setBackend} options={['Node.js', 'Python (Flask)', 'Java (Spring Boot)', 'FastAPI', 'None']} icon={<ServerIcon />} disabled={!!generatedApp} />
                    <Dropdown label={translate('databaseLabel', language)} value={database} onChange={setDatabase} options={['Firebase', 'MongoDB', 'PostgreSQL', 'None']} icon={<DatabaseIcon />} disabled={!!generatedApp} />
                     <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                           <LanguageIcon />
                            <span className="ml-2">{translate('languageLabel', language)}</span>
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={!!generatedApp}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {attachedFile && !generatedApp && (
                    <div className="mb-2 flex items-center justify-between bg-blue-50 p-2 rounded-md">
                        <p className="text-sm text-blue-700 truncate">{translate('attachedFile', language)}: {attachedFile.name}</p>
                        <button onClick={() => setAttachedFile(null)} className="text-blue-500 hover:text-blue-700">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {generatedApp ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={refinementPrompt}
                            onChange={(e) => setRefinementPrompt(e.target.value)}
                            placeholder={translate('refinePlaceholder', language)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                        />
                        <Button onClick={handleRefine} isLoading={isRefining} className="px-6 py-2 shrink-0">
                            {translate('refineButton', language)}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={translate('promptPlaceholder', language)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.txt,.pdf,.docx" />
                        <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-md border border-gray-300 hover:bg-gray-100 ${attachedFile ? 'text-blue-600' : 'text-gray-500'}`} aria-label={translate('attachFileAria', language)}>
                            <AttachmentIcon />
                        </button>
                        <button onClick={handleVoiceInput} className={`p-2 rounded-md border border-gray-300 hover:bg-gray-100 ${isRecording ? 'text-red-600 animate-pulse' : 'text-gray-500'}`} aria-label={translate('voiceInputAria', language)}>
                        <MicrophoneIcon />
                        </button>
                        <Button onClick={handleGenerate} isLoading={isLoading} className="px-6 py-2 shrink-0">
                            {translate('generateButton', language)}
                        </Button>
                    </div>
                )}
            </footer>
        </div>
    );
};

const LoadingState = ({ language }: { language: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-600">{translate('loadingHeader', language)}</h2>
        <p className="text-gray-500">{translate('loadingSubheader', language)}</p>
    </div>
);

const ErrorState = ({ message, language }: { message: string, language: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-16 h-16 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-red-600">{translate('errorHeader', language)}</h2>
        <p className="text-gray-600 mt-2">{message}</p>
    </div>
);


// Icons
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const ServerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2-2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7a8 8 0 0116 0" /></svg>;
const LanguageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path d="M12.873 3.522c3.951.844 6.252 5.37 5.408 9.321s-5.37 6.252-9.321 5.408-6.252-5.37-5.408-9.321c.844-3.951 5.37-6.252 9.321-5.408z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13-4-4-4 4M19 5h.01M19 12h.01M19 19h.01" /></svg>;
const MicrophoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 6v3m0 0h-2m2 0h2M5 3a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" /></svg>;
const AttachmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export default AIBuilderPage;