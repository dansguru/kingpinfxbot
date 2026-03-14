import React from 'react';

type TAccountSwitcherFooter = {
    oAuthLogout: () => void;
    loginid?: string;
    is_logging_out?: boolean;
    residence?: string;
    type?: 'demo' | 'real';
};

const AccountSwitcherFooter = (_props: TAccountSwitcherFooter) => {
    // KingpinFX: remove external Deriv navigation/actions from the account switcher footer.
    return null;
};

export default AccountSwitcherFooter;

