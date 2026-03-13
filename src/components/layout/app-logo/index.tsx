import { KingpinMarkIcon, KingpinWordmark } from '@/components/brand/kingpin-logo';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <a className='app-header__logo' href='/' aria-label='KingpinFX'>
            <KingpinMarkIcon className='app-header__logo-mark' width={22} height={22} />
            <KingpinWordmark className='app-header__logo-wordmark' />
        </a>
    );
};
