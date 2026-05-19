import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Moon, Sun, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = usePortfolio();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden min-h-screen min-h-[-webkit-fill-available]">
      {/* Floating Action Buttons (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-4">
        <button
          onClick={toggleLanguage}
          className="p-3 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-lg"
          aria-label="Toggle Language"
        >
          <Languages className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-lg"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content */}
      <motion.main 
        className="relative z-10 w-full h-full"
        initial={{ opacity: 0, filter: 'blur(20px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
