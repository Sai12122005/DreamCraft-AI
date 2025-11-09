
import { User, Project } from '../types';

// --- MOCK DATABASE ---
const MOCK_USERS: { [key: string]: User } = {
    'uid-123': { uid: 'uid-123', email: 'user@example.com', displayName: 'Demo User' },
};

const MOCK_PROJECTS: { [key: string]: Project[] } = {
    'uid-123': [
        { id: 'proj-1', title: 'E-commerce Platform', description: 'A full-stack online store.', language: 'React/Node.js', createdAt: new Date() },
        { id: 'proj-2', title: 'Task Management App', description: 'A simple to-do list application.', language: 'Flutter/Firebase', createdAt: new Date(Date.now() - 86400000) },
    ],
};

let MOCK_CURRENT_USER: User | null = null;
let authStateListener: ((user: User | null) => void) | null = null;

// --- MOCK AUTH ---
export const auth = {
    // This is just a mock object to pass around
};

export const signInWithEmailAndPassword = async (auth: any, email: string, password: string): Promise<{ user: User }> => {
    console.log(`Signing in with ${email}/${password}`);
    await new Promise(res => setTimeout(res, 500));
    if (email === 'user@example.com' && password === 'password') {
        const user = MOCK_USERS['uid-123'];
        MOCK_CURRENT_USER = user;
        if (authStateListener) authStateListener(user);
        return { user };
    }
    throw new Error('Invalid credentials');
};

export const createUserWithEmailAndPassword = async (auth: any, email: string, password: string): Promise<{ user: User }> => {
    console.log(`Creating user with ${email}/${password}`);
    await new Promise(res => setTimeout(res, 500));
    const uid = `uid-${Date.now()}`;
    const newUser: User = { uid, email, displayName: email.split('@')[0] };
    MOCK_USERS[uid] = newUser;
    MOCK_CURRENT_USER = newUser;
    if (authStateListener) authStateListener(newUser);
    return { user: newUser };
};

export const signInWithGoogle = async (auth: any): Promise<{ user: User }> => {
    console.log('Signing in with Google');
    await new Promise(res => setTimeout(res, 500));
    const user = MOCK_USERS['uid-123'];
    MOCK_CURRENT_USER = user;
    if (authStateListener) authStateListener(user);
    return { user };
};


export const signOut = async (auth: any): Promise<void> => {
    console.log('Signing out');
    MOCK_CURRENT_USER = null;
    if (authStateListener) authStateListener(null);
};

export const onAuthStateChanged = (auth: any, callback: (user: User | null) => void): (() => void) => {
    authStateListener = callback;
    // Immediately notify listener of current state
    setTimeout(() => callback(MOCK_CURRENT_USER), 0);
    return () => {
        authStateListener = null; // Unsubscribe
    };
};

// --- MOCK FIRESTORE ---
export const firestore = {
    // mock object
};

export const getProjects = async (userId: string): Promise<Project[]> => {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_PROJECTS[userId] || [];
};

export const createProject = async(userId: string, title: string, description: string, language: string): Promise<Project> => {
    await new Promise(res => setTimeout(res, 500));
    const newProject: Project = {
        id: `proj-${Date.now()}`,
        title,
        description,
        language,
        createdAt: new Date(),
    };
    if (!MOCK_PROJECTS[userId]) {
        MOCK_PROJECTS[userId] = [];
    }
    MOCK_PROJECTS[userId].unshift(newProject);
    return newProject;
};
