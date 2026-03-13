import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import KingpinLoader from '@/components/loader/kingpin-loader';

const BlocklyLoading = observer(() => {
    const { blockly_store } = useStore();
    const { is_loading } = blockly_store;

    return (
        <>
            {is_loading && (
                <div className='bot__loading' data-testid='blockly-loader'>
                    <KingpinLoader size='md' />
                    <div>Loading Blockly...</div>
                </div>
            )}
        </>
    );
});

export default BlocklyLoading;
