import { observer } from 'mobx-react-lite';

export const MenuItems = observer(() => {
    // KingpinFX: remove external Deriv navigation items (Trader's Hub/Cashier/Reports)
    // to avoid leaving the app and triggering Deriv's legacy auth flows.
    return null;
});

export default MenuItems;
