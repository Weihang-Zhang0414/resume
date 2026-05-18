/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PortfolioData {
  defaultLanguage: string;
  settings?: {
    cardSound?: string;
    sectionSound?: string;
  };
  hero: any;
  education: any[];
  internships: any[];
  projects: any[];
  exchanges: any[];
  volunteers: any[];
  skills: any[];
}

interface PortfolioContextType {
  data: PortfolioData | null;
  loading: boolean;
  saveData: (newData: PortfolioData) => Promise<boolean>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check initial theme from system
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/portfolio.json`);
        const json = await response.json();
        setData(json);
        i18n.changeLanguage(json.defaultLanguage || 'en');
      } catch (error) {
        console.error('Error loading portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveData = async (newData: PortfolioData) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (response.ok) {
        setData(newData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  return (
    <PortfolioContext.Provider value={{ data, loading, saveData, theme, toggleTheme }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
