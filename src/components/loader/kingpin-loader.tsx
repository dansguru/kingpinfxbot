import React from 'react';
import clsx from 'clsx';
import { KingpinMarkIcon } from '@/components/brand/kingpin-logo';
import './kingpin-loader.scss';

type TKingpinLoaderProps = {
    className?: string;
    message?: string;
    fullscreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

const KingpinLoader = ({ className, message, fullscreen = false, size = 'md' }: TKingpinLoaderProps) => {
    return (
        <div className={clsx('kingpin-loader', className, { 'kingpin-loader--fullscreen': fullscreen })}>
            <div className={clsx('kingpin-loader__ring', `kingpin-loader__ring--${size}`)} aria-hidden='true' />
            <div className='kingpin-loader__mark' aria-hidden='true'>
                <KingpinMarkIcon width={18} height={18} />
            </div>
            {message ? <div className='kingpin-loader__message'>{message}</div> : null}
        </div>
    );
};

export default KingpinLoader;

