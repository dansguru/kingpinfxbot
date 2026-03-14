import { TNoNonEuAccounts } from './types';

type TNoNonEuAccountsWithResidence = TNoNonEuAccounts & {
    residence?: string;
};

const NoNonEuAccounts = (_props: TNoNonEuAccountsWithResidence) => {
    // KingpinFX: hide Deriv Hub flows (previously redirected to Trader's Hub to add accounts).
    return null;
};

export default NoNonEuAccounts;
