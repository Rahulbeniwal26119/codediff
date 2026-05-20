import { motion } from 'framer-motion';
import { FaCircle } from 'react-icons/fa';
import { useCode } from '../context/CodeContext';
import { cn } from '../utils/cn';

export default function Header() {
    const { isDarkTheme } = useCode();

    return (
        <motion.header
            className={cn(
                'shrink-0 border-b',
                isDarkTheme ? 'border-[#251b14] bg-[#090807]' : 'border-[#eadfd6] bg-[#fffaf6]'
            )}
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        >
            <nav className="mx-auto flex h-12 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-5">
                <a href="/" className="flex min-w-0 items-center gap-2.5">
                    <img
                        src="/logo.png"
                        alt="CodeDiff"
                        className="h-7 w-7 rounded-lg bg-white object-cover"
                    />
                    <span className={cn(
                        'truncate text-sm font-bold',
                        isDarkTheme ? 'text-white' : 'text-[#17120f]'
                    )}>
                        CodeDiff
                    </span>
                </a>

                <div className={cn(
                    'hidden min-w-0 items-center gap-2 text-xs font-medium md:flex',
                    isDarkTheme ? 'text-[#9a9087]' : 'text-[#756a61]'
                )}>
                    <FaCircle className="h-1.5 w-1.5 text-[#ff7a1a]" />
                    <span className="truncate">Focused review workbench</span>
                </div>

                <div className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-bold',
                    isDarkTheme
                        ? 'border-[#3a2a20] bg-[#17110d] text-[#ff9a3d]'
                        : 'border-[#f3c7a4] bg-[#fff2e8] text-[#c65300]'
                )}>
                    Workbench
                </div>
            </nav>
        </motion.header>
    );
}
