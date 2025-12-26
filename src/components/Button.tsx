import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    disabled?: boolean;
}

export function Button({ children, disabled, ...props }: ButtonProps) {
    return (
        <button
            className='bg-blue-600 text-white py-1 px-3 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
