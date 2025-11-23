import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function IconButton({ 
  children, 
  className,
  variant = 'standard',
  disabled,
  ...props 
}) {
  const variants = {
    standard: 'text-black hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-700',
    filled: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700',
    tonal: 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
  };

  return (
    <motion.button
      className={cn(
        'p-2 rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
