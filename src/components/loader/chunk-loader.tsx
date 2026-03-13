import KingpinLoader from './kingpin-loader';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='app-root'>
            <KingpinLoader size='lg' />
            <div className='load-message'>{message}</div>
        </div>
    );
}
