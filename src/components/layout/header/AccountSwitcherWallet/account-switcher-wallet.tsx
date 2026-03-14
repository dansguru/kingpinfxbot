import React from 'react';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import ThemedScrollbars from '@/components/shared_ui/themed-scrollbars';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import useStoreWalletAccountsList from '@/hooks/useStoreWalletAccountsList';
import { Localize } from '@deriv-com/translations';
import { AccountSwitcherWalletList } from './account-switcher-wallet-list';
import './account-switcher-wallet.scss';
import '../wallets/wallet.scss';

type TAccountSwitcherWalletProps = {
    is_visible: boolean;
    toggle: (value?: boolean) => void;
    residence?: string;
};

export const AccountSwitcherWallet = observer(({ is_visible, toggle, residence }: TAccountSwitcherWalletProps) => {
    const { data: wallet_list, has_wallet = false } = useStoreWalletAccountsList() || {};
    const dtrade_account_wallets = wallet_list?.filter(wallet => wallet.dtrade_loginid);

    const wrapper_ref = React.useRef<HTMLDivElement>(null);

    // We're removing the token check from the account switcher component
    // This check is now handled in the Layout component to avoid triggering
    // OIDC login when opening the account switcher

    const validateClickOutside = (event: MouseEvent) => {
        const checkAllParentNodes = (node: HTMLElement): boolean => {
            if (node?.classList?.contains('acc-info__wallets')) return true;
            const parent = node?.parentNode as HTMLElement;
            if (parent) return checkAllParentNodes(parent);
            return false;
        };

        return is_visible && !checkAllParentNodes(event.target as HTMLElement);
    };

    const closeAccountsDialog = React.useCallback(() => {
        toggle(false);
    }, [toggle]);

    useOnClickOutside(wrapper_ref, closeAccountsDialog, validateClickOutside);

    return (
        <div className='account-switcher-wallet' ref={wrapper_ref}>
            <div className='account-switcher-wallet__header'>
                <Text as='h4' weight='bold' size='xs'>
                    <Localize i18n_default_text='Options accounts' />
                </Text>
            </div>
            <ThemedScrollbars height={450}>
                <AccountSwitcherWalletList wallets={dtrade_account_wallets} closeAccountsDialog={closeAccountsDialog} />
            </ThemedScrollbars>
        </div>
    );
});
