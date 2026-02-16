import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
    return (
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
                textAlign: 'center',
                padding: '24px',
                fontSize: '12px',
                color: '#9e97b0',
                fontWeight: 500,
                width: '100%',
                background: 'transparent',
                pointerEvents: 'none'
            }}
        >
            Designed by Arasukirubanandhan <span style={{ color: '#f87171' }}>❤️</span>
        </motion.p>
    );
};
