'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Mail, ArrowLeft, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/xportal/reset-password`,
        });

        if (resetError) {
            setError('Failed to send reset email. Please try again.');
            setLoading(false);
            return;
        }

        setSent(true);
        setLoading(false);
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                    <p className="text-gray-500 mb-6">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                    </p>
                    <Link
                        href="/xportal/login"
                        className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-500 mt-1">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="admin@example.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/xportal/login"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-500 text-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
