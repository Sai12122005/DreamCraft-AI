
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithGoogle } from '../services/firebaseMock';
import { auth } from '../services/firebaseMock';
import Button from '../components/common/Button';

interface AuthPageProps {
    onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            await signInWithGoogle(auth);
            onAuthSuccess();
        } catch (err: any) {
             setError(err.message || 'An error occurred during Google Sign-In.');
        } finally {
             setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6 animate-fade-in">
                <div className="text-center">
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                        D
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="text-sm text-gray-600">Enter your credentials to continue</p>
                </div>

                <div className="flex border-b border-gray-200">
                    <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Login</button>
                    <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Signup</button>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Button type="submit" className="w-full" isLoading={isLoading}>{isLogin ? 'Login' : 'Signup'}</Button>
                </form>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button variant="secondary" onClick={handleGoogleSignIn} className="w-full" disabled={isLoading}>
                    <GoogleIcon />
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
};

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.233 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


export default AuthPage;
