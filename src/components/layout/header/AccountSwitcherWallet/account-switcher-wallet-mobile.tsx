import React from 'react';
import { observer } from 'mobx-react-lite';
import MobileDialog from '@/components/shared_ui/mobile-dialog';
import useStoreWalletAccountsList from '@/hooks/useStoreWalletAccountsList';
import { Localize } from '@deriv-com/translations';
import { AccountSwitcherWalletList } from './account-switcher-wallet-list';
import './account-switcher-wallet-mobile.scss';

type TAccountSwitcherWalletMobile = {
    loginid: string;
    is_visible: boolean;
    toggle: (value: boolean) => void;
    residence?: string;
    is_virtual?: boolean;
    currency?: string;
};

export const AccountSwitcherWalletMobile = observer(({ is_visible, toggle }: TAccountSwitcherWalletMobile) => {
    const { data: wallet_list } = useStoreWalletAccountsList() || {};
    const dtrade_account_wallets = wallet_list?.filter(wallet => wallet.dtrade_loginid);

    const closeAccountsDialog = React.useCallback(() => {
        toggle(false);
    }, [toggle]);

    return (
        <MobileDialog
            portal_element_id='modal_root'
            footer={null}
            visible={is_visible}
            onClose={closeAccountsDialog}
            has_close_icon
            has_full_height
            title={<Localize i18n_default_text='Options accounts' />}
        >
            <div className='account-switcher-wallet-mobile'>
                <AccountSwitcherWalletList wallets={dtrade_account_wallets} closeAccountsDialog={closeAccountsDialog} />
            </div>
        </MobileDialog>
    );
});

