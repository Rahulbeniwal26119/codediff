import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const variants = {
  filled: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg dark:bg-primary-600 dark:hover:bg-primary-700',
  tonal: 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
  outlined: 'border-2 border-primary-600 text-gray-900 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950',
  text: 'text-gray-900 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({ 
  children, 
  variant = 'filled', 
  size = 'md',
  className,
  disabled,
  as,
  ...props 
}) {
  const Component = as ? motion[as] || motion.button : motion.button;
  
  const handleClick = (e) => {
    if (disabled) return;
    
    // Create ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    // Call original onClick if exists
    if (props.onClick) props.onClick(e);
  };
  
  return (
    <>
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      <Component
        className={cn(
          'rounded-2xl font-medium transition-all duration-200 relative overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={disabled}
        {...props}
        onClick={handleClick}
      >
        {children}
      </Component>
    </>
  );
}
