import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const elevations = {
  1: 'shadow-sm',
  2: 'shadow-md',
  3: 'shadow-lg',
  4: 'shadow-xl',
  5: 'shadow-2xl',
};

export default function Card({ 
  children, 
  className,
  animate = true,
  elevation = 2,
  hover = false,
  ...props 
}) {
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      className={cn(
        'bg-white dark:bg-surface-800 rounded-3xl',
        'border border-surface-200 dark:border-surface-700',
        'overflow-hidden transition-all duration-300',
        elevations[elevation],
        hover && 'hover:shadow-2xl hover:-translate-y-1',
        className
      )}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={animate ? { type: 'spring', stiffness: 300, damping: 30 } : false}
      {...props}
    >
      {children}
    </Component>
  );
}
