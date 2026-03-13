import React from 'react';

type TIconProps = {
    className?: string;
    height?: number;
    width?: number;
};

export const KingpinMarkIcon = ({ className, height = 20, width = 20 }: TIconProps) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            role='img'
            aria-label='KingpinFX'
        >
            <path
                d='M4 4h5v7l6-7h6l-8 9 8 9h-6l-6-7v7H4V4z'
                fill='currentColor'
                opacity='0.92'
            />
            <path d='M4.5 20.5h15' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' opacity='0.65' />
        </svg>
    );
};

export const KingpinWordmark = ({ className }: { className?: string }) => {
    return (
        <div className={className} aria-label='KingpinFX'>
            <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>Kingpin</span>
            <span style={{ fontWeight: 800, letterSpacing: '0.02em', color: 'var(--brand-accent)' }}>FX</span>
        </div>
    );
};

