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
                padding: '16px',
                fontSize: '11px',
                color: '#9e97b0',
                fontWeight: 500,
                width: '100%',
                background: 'transparent',
                pointerEvents: 'none',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                letterSpacing: '0.3px'
            }}
        >
            Designed by Arasukirubanandhan <span style={{ color: '#f87171' }}>❤️</span>
        </motion.p>
    );
};
