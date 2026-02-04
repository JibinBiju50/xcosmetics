'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    size = 'md',
    text = 'Loading...',
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} border-pink-200 border-t-pink-500 rounded-full animate-spin`}
                style={{ borderStyle: 'solid' }}
            />
            {text && <p className="text-gray-500 text-sm font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
}
