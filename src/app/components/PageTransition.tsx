import { motion } from "motion/react";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    classNames?: string;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -20,
    },
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
} as const;

export function PageTransition({ children, classNames = "" }: PageTransitionProps) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={classNames}
        >
            {children}
        </motion.div>
    );
}
