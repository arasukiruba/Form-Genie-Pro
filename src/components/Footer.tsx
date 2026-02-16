import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
                textAlign: 'center',
                padding: '12px 24px',
                fontSize: '11px',
                color: '#6b6580',
                fontWeight: 600,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                letterSpacing: '0.2px',
                borderTop: '1px solid rgba(232, 229, 240, 0.6)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
            }}
        >
            Designed by Arasukirubanandhan <span style={{ color: '#f87171' }}>❤️</span>
        </motion.div>
    );
};
