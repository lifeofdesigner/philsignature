import React from 'react';
import { motion, type Variants } from 'framer-motion';

// Luxury Haute Parfumerie Easing Curves
export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;
export const LUXURY_SLOW_EASE = [0.22, 1, 0.36, 1] as const;

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  className?: string;
  viewportOnce?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.7,
  className,
  viewportOnce = true,
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: LUXURY_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)', y: 12 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: LUXURY_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.04,
  as: Component = 'span',
}) => {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.65,
        ease: LUXURY_EASE,
      },
    },
  };

  const MotionComponent = motion[Component as 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'] || motion.span;

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block mr-[0.26em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </MotionComponent>
  );
};

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  viewportOnce?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.06,
  className,
  viewportOnce = true,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewportOnce, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
  distance = 20,
}) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: LUXURY_EASE,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
      transition={{ duration: 0.45, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
