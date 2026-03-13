import { Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import KingpinLoader from '@/components/loader/kingpin-loader';
import { useDevice } from '@deriv-com/ui';
import ChartModalDesktop from './chart-modal-desktop';

export const ChartModal = observer(() => {
    const { isDesktop } = useDevice();
    return <Suspense fallback={<KingpinLoader size='sm' />}>{isDesktop && <ChartModalDesktop />}</Suspense>;
});

export default ChartModal;
