import React from 'react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
    title: string;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-1 md:p-3"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        {title}
                    </h1>
                    <div className="h-1.5 w-20 bg-emerald-500 rounded-full mt-2" />
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </motion.div>
    );
};

export default DashboardLayout;
