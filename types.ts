
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    language: string;
    createdAt: Date;
}

export interface CodeFile {
    name: string;
    code: string;
    explanation: string;
}

export interface GeneratedApp {
    summary: string;
    architecture: string;
    folderStructure: string;
    files: CodeFile[];
    deployment: string;
}

export enum Page {
    Home = 'HOME',
    Auth = 'AUTH',
    Dashboard = 'DASHBOARD',
    AIBuilder = 'AI_BUILDER'
}
