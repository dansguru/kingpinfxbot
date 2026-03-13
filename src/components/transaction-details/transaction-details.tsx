import { Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import KingpinLoader from '@/components/loader/kingpin-loader';
import { useDevice } from '@deriv-com/ui';
import TransactionDetailsDesktop from './transaction-details-desktop';
import TransactionDetailsMobile from './transaction-details-mobile';

export const TransactionDetails = observer(() => {
    const { isDesktop } = useDevice();
    return (
        <Suspense fallback={<KingpinLoader size='sm' />}>
            {!isDesktop ? <TransactionDetailsMobile /> : <TransactionDetailsDesktop />}
        </Suspense>
    );
});

export default TransactionDetails;
