import Share from './Share';

export default function Controls({ compact = false }) {
    return (
        <div className={compact ? 'flex items-center gap-1.5' : 'flex flex-wrap items-center justify-center gap-2 sm:gap-2'}>
            {/* Share button */}
            <Share
                compact={compact}
            />
        </div>
    );
}
