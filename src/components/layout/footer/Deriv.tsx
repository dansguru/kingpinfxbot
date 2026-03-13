import { KingpinMarkIcon } from '@/components/brand/kingpin-logo';
import { useTranslations } from '@deriv-com/translations';
import { Tooltip } from '@deriv-com/ui';

const Deriv = () => {
    const { localize } = useTranslations();

    return (
        <Tooltip
            as='a'
            className='app-footer__icon'
            href='/'
            target='_blank'
            tooltipContent={localize('Go to KingpinFX')}
        >
            <KingpinMarkIcon width={16} height={16} />
        </Tooltip>
    );
};

export default Deriv;
