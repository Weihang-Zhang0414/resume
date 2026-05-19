import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTickSound, SoundType } from '../components/useTickSound';

interface CarouselItem {
  id: string;
  type: string;
  categoryTitle: { en: string, zh: string };
  categoryIndex: number;
  data: any;
}

const Home: React.FC = () => {
  const { data, loading, theme } = usePortfolio();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as 'en' | 'zh';

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollAccumulator = useRef(0);
  const touchStart = useRef(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768 || window.innerWidth < window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
      setIsPortrait(window.innerWidth < 768 || window.innerWidth < window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Re-added state for detail modal
  const [detailItem, setDetailItem] = useState<CarouselItem | null>(null);

  // Markdown fetching states
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [markdownLoading, setMarkdownLoading] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (detailItem && detailItem.type !== 'education' && detailItem.data.hasMarkdown) {
      setMarkdownLoading(true);
      setMarkdownContent('');
      
      let folderType = 'projects';
      if (detailItem.type === 'internship') folderType = 'internships';
      if (detailItem.type === 'exchange') folderType = 'exchanges';
      if (detailItem.type === 'volunteer') folderType = 'volunteers';
      
      // Try language-specific file first, fallback to details.md
      const langMdUrl = `${import.meta.env.BASE_URL}experiences/${folderType}/${detailItem.data.id}/details_${lang}.md`;
      const fallbackMdUrl = `${import.meta.env.BASE_URL}experiences/${folderType}/${detailItem.data.id}/details.md`;
      
      fetch(langMdUrl)
        .then(res => {
          if (res.ok) return res.text();
          // Fallback to details.md if specific language file isn't found
          return fetch(fallbackMdUrl).then(fallbackRes => {
            if (fallbackRes.ok) return fallbackRes.text();
            throw new Error('Failed to load fallback markdown');
          });
        })
        .then(text => {
          setMarkdownContent(text);
        })
        .catch(err => {
          console.error(err);
          setMarkdownContent('');
        })
        .finally(() => {
          setMarkdownLoading(false);
        });
    } else {
      setMarkdownContent('');
    }
  }, [detailItem, lang]);

  const playTickSound = useTickSound();
  const prevIndex = useRef(activeIndex);

  useEffect(() => {
    if (prevIndex.current !== activeIndex && items.length > 0) {
      const prevItem = items[prevIndex.current];
      const currentItem = items[activeIndex];
      
      const isNewSection = prevItem && currentItem && prevItem.type !== currentItem.type;
      
      const soundType = isNewSection 
        ? (data?.settings?.sectionSound || 'clock') 
        : (data?.settings?.cardSound || 'wood');
        
      playTickSound(soundType as SoundType);
      prevIndex.current = activeIndex;
    }
  }, [activeIndex, playTickSound, items, data?.settings]);

  useEffect(() => {
    if (data) {
      const flattenedItems: CarouselItem[] = [];

      data.education.forEach((edu: any, idx: number) => {
        flattenedItems.push({ id: `edu-${idx}`, type: 'education', categoryTitle: { en: 'Education', zh: '教育背景' }, categoryIndex: idx + 1, data: edu });
      });
      data.internships.forEach((int: any, idx: number) => {
        flattenedItems.push({ id: `int-${idx}`, type: 'internship', categoryTitle: { en: 'Internships', zh: '实习经历' }, categoryIndex: idx + 1, data: int });
      });
      data.projects.forEach((proj: any, idx: number) => {
        flattenedItems.push({ id: `proj-${idx}`, type: 'project', categoryTitle: { en: 'Research & Projects', zh: '科研经历' }, categoryIndex: idx + 1, data: proj });
      });
      if (data.exchanges) {
        data.exchanges.forEach((exc: any, idx: number) => {
          flattenedItems.push({ id: `exc-${idx}`, type: 'exchange', categoryTitle: { en: 'Exchange Experience', zh: '海外交流经历' }, categoryIndex: idx + 1, data: exc });
        });
      }
      if (data.volunteers) {
        data.volunteers.forEach((vol: any, idx: number) => {
          flattenedItems.push({ id: `vol-${idx}`, type: 'volunteer', categoryTitle: { en: 'Volunteer Experience', zh: '志愿服务经历' }, categoryIndex: idx + 1, data: vol });
        });
      }
      data.skills.forEach((skill: any, idx: number) => {
        flattenedItems.push({ id: `skill-${idx}`, type: 'skill', categoryTitle: { en: 'Other Skills', zh: '其他技能' }, categoryIndex: idx + 1, data: skill });
      });

      setItems(flattenedItems);
    }
  }, [data]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (document.body.style.overflow === 'hidden') return;
      e.preventDefault();
      scrollAccumulator.current += e.deltaY;
      const threshold = 80;

      if (Math.abs(scrollAccumulator.current) > threshold) {
        if (showWelcome) {
          if (scrollAccumulator.current > 0) {
            setShowWelcome(false);
          }
          scrollAccumulator.current = 0;
          return;
        }

        if (scrollAccumulator.current > 0) {
          if (activeIndex >= items.length - 1) {
            setShowEndScreen(true);
          } else {
            setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
          }
        } else {
          if (showEndScreen) {
            setShowEndScreen(false);
          } else {
            setActiveIndex(prev => Math.max(prev - 1, 0));
          }
        }
        scrollAccumulator.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (document.body.style.overflow === 'hidden') return;
      touchStart.current = isPortrait ? e.touches[0].clientX : e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (document.body.style.overflow === 'hidden') return;
      const touchEnd = isPortrait ? e.changedTouches[0].clientX : e.changedTouches[0].clientY;
      const delta = touchStart.current - touchEnd;
      const threshold = 50;

      if (Math.abs(delta) > threshold) {
        if (showWelcome) {
          if (delta > 0) {
            setShowWelcome(false);
          }
          return;
        }

        if (delta > 0) {
          if (activeIndex >= items.length - 1) {
            setShowEndScreen(true);
          } else {
            setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
          }
        } else {
          if (showEndScreen) {
            setShowEndScreen(false);
          } else {
            setActiveIndex(prev => Math.max(prev - 1, 0));
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.body.style.overflow === 'hidden') return;
      
      const nextKey = isPortrait ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isPortrait ? 'ArrowLeft' : 'ArrowUp';

      if (e.key === nextKey || e.key === 'ArrowDown') {
        if (showWelcome) {
          setShowWelcome(false);
        } else if (!showEndScreen) {
          if (activeIndex >= items.length - 1) {
            setShowEndScreen(true);
          } else {
            setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
          }
        }
      } else if (e.key === prevKey || e.key === 'ArrowUp') {
        if (showEndScreen) {
          setShowEndScreen(false);
        } else if (!showWelcome) {
          setActiveIndex(prev => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, activeIndex, showEndScreen, showWelcome, isPortrait]);

  // Dynamic status bar and body background color syncing for notch devices
  useEffect(() => {
    let themeColor = theme === 'dark' ? '#020617' : '#e0f2fe';
    
    if (theme === 'light' && !showWelcome && !showEndScreen) {
      const type = items[activeIndex]?.type;
      if (type === 'education') themeColor = '#e0f2fe';
      else if (type === 'internship') themeColor = '#e0e7ff';
      else if (type === 'project') themeColor = '#f3e8ff';
      else if (type === 'exchange') themeColor = '#ffe4e6';
      else if (type === 'volunteer') themeColor = '#fef3c7';
      else themeColor = '#e0f2fe';
    }

    // Update iOS Safari / Chrome top status bar theme-color
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', themeColor);
    } catch (e) {
      console.error(e);
    }

    // Set html and body inline styling background color to prevent margins or notches showing white
    document.documentElement.style.backgroundColor = themeColor;
    document.body.style.backgroundColor = themeColor;

    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [theme, activeIndex, items, showWelcome, showEndScreen]);

  if (loading || !data || items.length === 0) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  const handleDotsTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPortrait || items.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const pct = relativeX / rect.width;
    const targetIndex = Math.max(0, Math.min(items.length - 1, Math.floor(pct * items.length)));
    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    }
  };

  const handlePhotoDoubleClick = () => {
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '20050414') {
      setPasswordModalOpen(false);
      navigate('/admin');
    } else {
      setPasswordError(true);
    }
  };

  const currentItem = items[activeIndex];
  const currentCategory = currentItem?.categoryTitle[lang];

  // Dynamic Background Colors
  // Dynamic Background Colors
  let bgColors = ['bg-blue-400/55 dark:bg-blue-900/50', 'bg-indigo-400/55 dark:bg-indigo-900/50', 'bg-purple-400/55 dark:bg-purple-900/50'];
  if (currentItem?.type === 'education') bgColors = ['bg-blue-400/55 dark:bg-blue-900/50', 'bg-cyan-400/55 dark:bg-cyan-900/50', 'bg-sky-400/55 dark:bg-sky-900/50'];
  if (currentItem?.type === 'internship') bgColors = ['bg-indigo-400/55 dark:bg-indigo-900/50', 'bg-violet-400/55 dark:bg-violet-900/50', 'bg-purple-400/55 dark:bg-purple-900/50'];
  if (currentItem?.type === 'project') bgColors = ['bg-purple-400/55 dark:bg-purple-900/50', 'bg-fuchsia-400/55 dark:bg-fuchsia-900/50', 'bg-pink-400/55 dark:bg-pink-900/50'];
  if (currentItem?.type === 'exchange') bgColors = ['bg-rose-400/55 dark:bg-rose-900/50', 'bg-red-400/55 dark:bg-red-900/50', 'bg-orange-400/55 dark:bg-orange-900/50'];
  if (currentItem?.type === 'volunteer') bgColors = ['bg-amber-400/55 dark:bg-amber-900/50', 'bg-orange-400/55 dark:bg-orange-900/50', 'bg-yellow-400/55 dark:bg-yellow-900/50'];
  if (currentItem?.type === 'skill') bgColors = ['bg-teal-400/55 dark:bg-teal-900/50', 'bg-emerald-400/55 dark:bg-emerald-900/50', 'bg-green-400/55 dark:bg-green-900/50'];
  let categoryColorClass = 'text-blue-600 dark:text-blue-400';
  if (currentItem?.type === 'education') categoryColorClass = 'text-blue-600 dark:text-blue-400';
  if (currentItem?.type === 'internship') categoryColorClass = 'text-indigo-600 dark:text-indigo-400';
  if (currentItem?.type === 'project') categoryColorClass = 'text-purple-600 dark:text-purple-400';
  if (currentItem?.type === 'exchange') categoryColorClass = 'text-rose-600 dark:text-rose-400';
  if (currentItem?.type === 'volunteer') categoryColorClass = 'text-amber-600 dark:text-amber-400';
  if (currentItem?.type === 'skill') categoryColorClass = 'text-teal-600 dark:text-teal-400';

  return (
    <LayoutGroup>
    <div className={`relative w-full h-full ${isMobile ? '' : 'pt-20'}`}>

      {/* Dynamic Background - Dreamy, vibrant floating gradient bubbles for all viewport sizes */}
      <div className="fixed -inset-10 z-0 overflow-hidden pointer-events-none transition-colors duration-700">
        <div className={`absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] md:w-[40%] md:h-[40%] rounded-full ${bgColors[0]} blur-[70px] md:blur-3xl opacity-80 dark:opacity-65 animate-blob mix-blend-multiply dark:mix-blend-screen transition-all duration-700`}></div>
        <div className={`absolute top-[25%] right-[-20%] w-[90vw] h-[90vw] md:w-[50%] md:h-[50%] rounded-full ${bgColors[1]} blur-[80px] md:blur-3xl opacity-80 dark:opacity-65 animate-blob-delayed mix-blend-multiply dark:mix-blend-screen transition-all duration-700`}></div>
        <div className={`absolute bottom-[-15%] left-[-10%] w-[100vw] h-[100vw] md:w-[60%] md:h-[60%] rounded-full ${bgColors[2]} blur-[90px] md:blur-3xl opacity-80 dark:opacity-65 animate-blob-slow mix-blend-multiply dark:mix-blend-screen transition-all duration-700`}></div>
      </div>

      {/* Category Title */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          <div className={`absolute z-30 transition-all duration-500 ${isPortrait ? 'top-[calc(27%+env(safe-area-inset-top))] left-1/2 -translate-x-1/2' : 'top-24 right-6 md:right-10'}`}>
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentCategory}
                initial={isPortrait ? { opacity: 0, y: -10 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={isPortrait ? { opacity: 0, y: 10 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-widest drop-shadow-xl text-center md:text-right whitespace-nowrap ${categoryColorClass} ${isPortrait ? 'border-b-2 border-current/25 pb-1 px-4' : ''}`}
              >
                {currentCategory}
              </motion.h2>
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Axis: Profile Photo (Left side or top-down) */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          isPortrait ? (
            /* Portrait Top 1/3 layout (shifted up, enlarged photo and text details) */
            <div className="absolute top-[calc(1.75rem+env(safe-area-inset-top))] inset-x-4 h-[20vh] max-h-[170px] z-40 flex items-center justify-center pointer-events-auto">
              <div className="glass-card w-full max-w-[480px] h-full rounded-2xl p-4 flex items-center gap-4.5 border border-white/20 dark:border-slate-800/80 shadow-lg">
                {/* Avatar on the Left (enlarged to 96px) */}
                <motion.div
                  layoutId="hero-avatar"
                  className="w-24 h-24 rounded-full border-2 border-white/50 shadow-md cursor-pointer relative flex-shrink-0"
                  onDoubleClick={handlePhotoDoubleClick}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Breathing effect light-glow */}
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    animate={{ 
                      boxShadow: theme === 'dark'
                        ? ['0 0 10px rgba(255,255,255,0.1)', '0 0 25px rgba(255,255,255,0.3)', '0 0 10px rgba(255,255,255,0.1)']
                        : ['0 0 10px rgba(59,130,246,0.1)', '0 0 25px rgba(59,130,246,0.2)', '0 0 10px rgba(59,130,246,0.1)']
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                    <img src={data.hero.avatarUrl.startsWith('http') ? data.hero.avatarUrl : `${import.meta.env.BASE_URL}${data.hero.avatarUrl.replace(/^\.?\//, '')}`} alt={data.hero.name[lang]} className="w-full h-full object-cover" />
                  </div>
                </motion.div>
                
                {/* Info on the Right (scaled text sizes) */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <motion.h1 
                    layoutId="hero-name" 
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate"
                  >
                    {data.hero.name[lang]}
                  </motion.h1>
                  <motion.p 
                    layoutId="hero-role" 
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-extrabold truncate mt-0.5"
                  >
                    {data.hero.role[lang]}
                  </motion.p>
                  
                  {/* Contacts grid (scaled to text-[11px] and bold) */}
                  <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5 min-h-[35px]">
                    {data.hero.visibility?.email !== false && (
                      <a href={`mailto:${data.hero.email}`} className="hover:text-blue-500 truncate">📧 {data.hero.email}</a>
                    )}
                    {data.hero.visibility?.phone !== false && (
                      <span className="truncate">📞 {data.hero.phone}</span>
                    )}
                    {data.hero.visibility?.wechat !== false && (
                      <span className="truncate">💬 WC: {data.hero.wechat}</span>
                    )}
                    {data.hero.visibility?.instagram !== false && (
                      <span className="truncate">📸 IG: {data.hero.instagram}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop sidebar */
            <div className="absolute left-[10%] lg:left-[15%] top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center">
              <motion.div
                layoutId="hero-avatar"
                className="w-48 h-48 lg:w-64 lg:h-64 rounded-full border-4 border-white/50 shadow-2xl cursor-pointer relative group"
                onDoubleClick={handlePhotoDoubleClick}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={data.hero.avatarUrl.startsWith('http') ? data.hero.avatarUrl : `${import.meta.env.BASE_URL}${data.hero.avatarUrl.replace(/^\.?\//, '')}`} alt={data.hero.name[lang]} className="w-full h-full object-cover" />
                </div>
              </motion.div>
              <div className="mt-6 text-center">
                <motion.h1 
                  layoutId="hero-name" 
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-md"
                >
                  {data.hero.name[lang]}
                </motion.h1>
                <motion.p 
                  layoutId="hero-role" 
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 font-medium drop-shadow-md"
                >
                  {data.hero.role[lang]}
                </motion.p>
                
                <div className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {data.hero.visibility?.email !== false && (
                    <a href={`mailto:${data.hero.email}`} className="hover:text-blue-500 transition-colors">{data.hero.email}</a>
                  )}
                  {data.hero.visibility?.phone !== false && (
                    <span>{data.hero.phone}</span>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 text-xs opacity-70">
                    {data.hero.visibility?.wechat !== false && <span>WC: {data.hero.wechat}</span>}
                    {data.hero.visibility?.instagram !== false && <span>IG: {data.hero.instagram}</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </AnimatePresence>

      {/* Roulette Wheel - Centered on mobile, Left-offset on desktop */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute overflow-visible pointer-events-none transition-all duration-500 ${
              isPortrait 
                ? 'bottom-20 inset-x-0 h-[58vh] z-30' 
                : `inset-0 ${isMobile ? '' : (windowSize.width < 1100 ? 'left-[40%]' : 'left-[35%]')}`
            }`}
          >
            <div className={`relative w-full h-full flex items-center ${isPortrait ? 'justify-center' : 'justify-center md:justify-start'}`}>
              {items.map((item, index) => {
                const diff = index - activeIndex;
                
                // Render window optimization (+/- 1 item for portrait horizontal carousel, +/- 3 for desktop)
                if (isPortrait && Math.abs(diff) > 1) return null;
                if (!isPortrait && Math.abs(diff) > 3) return null;
    
                const currentActiveItem = items[activeIndex];
                const isSameCategory = item.type === currentActiveItem.type;
    
                const isNarrow = windowSize.width < 1100;
                const R = isPortrait ? 0 : (isMobile ? 350 : (isNarrow ? 500 : 600));
                const thetaDeg = diff * (isMobile ? 18 : (isNarrow ? 20 : 22)); 
                const thetaRad = thetaDeg * (Math.PI / 180);
    
                const xOffset = isPortrait 
                  ? diff * (windowSize.width * 0.82) 
                  : (isMobile ? 0 : R * Math.cos(thetaRad) - R);
                const yOffset = isPortrait 
                  ? 0 
                  : R * Math.sin(thetaRad);
    
                const scale = isPortrait
                  ? (diff === 0 ? 1 : 0.86)
                  : Math.max(1 - Math.abs(diff) * (isMobile ? 0.18 : 0.15), 0.7);
                const rotateX = isPortrait ? 0 : diff * -8;
                const rotateZ = isPortrait ? 0 : (isMobile ? 0 : diff * 5); 
    
                const isActive = diff === 0;
    
                let opacity = 0;
                if (isPortrait) {
                  if (diff === 0) {
                    opacity = 1;
                  } else if (Math.abs(diff) === 1) {
                    opacity = isSameCategory ? 0.45 : 0;
                  }
                } else {
                  if (isSameCategory) {
                    opacity = isActive ? 1 : Math.max(1 - Math.abs(diff) * 0.45, 0.1);
                  }
                }
    
                // Render all items for smooth opacity transitions! Pointer events disabled if hidden
                const pointerEventsClass = opacity === 0 ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer';
                // Shape based on type
                let shapeClass = 'rounded-xl border-blue-200 dark:border-blue-800 bg-white/40 dark:bg-slate-900/40';
                if (item.type === 'education') {
                  shapeClass = isPortrait
                    ? 'rounded-tr-[2rem] rounded-bl-[2rem] rounded-tl-lg rounded-br-lg border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/30'
                    : 'rounded-md border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/30';
                }
                if (item.type === 'internship') {
                  shapeClass = isPortrait 
                    ? 'rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-lg rounded-bl-lg border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/30' 
                    : 'rounded-full border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/30 px-6 sm:px-10';
                }
                if (item.type === 'project') {
                  shapeClass = isPortrait
                    ? 'rounded-tr-[1.5rem] border-t-8 border-l border-purple-500 bg-purple-50/60 dark:bg-purple-900/30'
                    : 'rounded-none border-l-8 border-purple-500 bg-purple-50/60 dark:bg-purple-900/30';
                }
                if (item.type === 'exchange') {
                  shapeClass = isPortrait
                    ? 'rounded-[2.5rem] rounded-tr-md rounded-bl-md border-rose-400 dark:border-rose-600 bg-rose-50/60 dark:bg-rose-900/30'
                    : 'rounded-3xl border-rose-400 dark:border-rose-600 bg-rose-50/60 dark:bg-rose-900/30';
                }
                if (item.type === 'volunteer') {
                  shapeClass = isPortrait
                    ? 'rounded-3xl border-dashed border-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/30'
                    : 'rounded-2xl border-dashed border-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/30';
                }
                if (item.type === 'skill') {
                  shapeClass = isPortrait
                    ? 'rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-lg rounded-bl-lg border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/30'
                    : 'rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-xl rounded-br-xl border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/30';
                }
    
                // Adaptive card width and height (compressed slightly for tighter vertical fit and narrow to avoid overlaps)
                const cardSizeClass = isPortrait 
                  ? 'w-[75vw] max-w-[310px] h-[42vh] max-h-[340px]' 
                  : 'w-full max-w-[calc(100vw-2rem)] md:max-w-2xl lg:max-w-4xl';
    
                return (
                  <motion.div
                    key={item.id}
                    className={`absolute ${cardSizeClass} px-3 md:px-6 origin-center md:origin-left ${isActive ? 'z-20 cursor-default pointer-events-auto' : `z-10 ${pointerEventsClass}`}`}
                    initial={false}
                    animate={{
                      y: yOffset,
                      x: xOffset,
                      scale,
                      opacity,
                      rotateX,
                      rotateZ,
                      z: isActive ? 50 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 28 }}
                    onClick={() => {
                      if (opacity === 0) return;
                      if (!isActive) {
                        setActiveIndex(index);
                      } else if (item.type !== 'skill') {
                        setDetailItem(item);
                      }
                    }}
                    style={{ 
                      perspective: 1200,
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div className={`relative overflow-hidden backdrop-blur-md transition-all duration-300 border ${shapeClass} ${isActive ? 'shadow-2xl scale-[1.02]' : 'hover:border-slate-400'} ${isPortrait ? 'h-full flex flex-col justify-start gap-2.5 p-5' : 'p-3.5 sm:p-6 md:p-8 flex items-center gap-3 md:gap-6'}`}>
                      {isPortrait ? (
                        /* Portrait Vertical Card Structure (tightened vertical gaps) */
                        <div className="flex-1 flex flex-col justify-start gap-2 min-w-0 h-full">
                          {/* Top Header Row inside Card */}
                          <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-1 flex-shrink-0">
                            <div className="text-xl sm:text-2xl font-black text-slate-400/80 dark:text-slate-500/60 select-none">
                              {String(item.categoryIndex).padStart(2, '0')}
                            </div>
                            {(() => {
                              let badgeColorClass = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/50';
                              if (item.type === 'education') badgeColorClass = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/50';
                              if (item.type === 'internship') badgeColorClass = 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-700/50';
                              if (item.type === 'project') badgeColorClass = 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-700/50';
                              if (item.type === 'exchange') badgeColorClass = 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/50';
                              if (item.type === 'volunteer') badgeColorClass = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/50';
                              if (item.type === 'skill') badgeColorClass = 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-700/50';
                              return (
                                <div className={`text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${badgeColorClass}`}>
                                  {item.categoryTitle[lang]}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Middle Content Section - flows naturally closely packed */}
                          <div className="min-w-0 flex flex-col justify-start overflow-y-auto scrollbar-none pr-1">
                            {renderItemContent(item, lang)}
                          </div>

                          {/* Bottom Section inside Card */}
                          {isActive && (
                            <div className="mt-2 pt-2 border-t border-slate-200/30 dark:border-slate-800/30 flex-shrink-0 flex flex-col gap-2">
                              {/* Keywords */}
                              {(item.type === 'internship' || item.type === 'project') && item.data.keywords?.[lang] && (
                                <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto scrollbar-none">
                                  {item.data.keywords[lang].map((kw: string, i: number) => {
                                    const sizes = ['text-[9px]', 'text-[10px]', 'text-[9px]'];
                                    const sz = sizes[i % sizes.length];
                                    const colorClass = item.type === 'internship'
                                      ? 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-700/50'
                                      : 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-700/50';
                                    return (
                                      <span
                                        key={i}
                                        className={`inline-block font-semibold px-1.5 py-0.5 border shadow-sm backdrop-blur-sm rounded-md whitespace-nowrap ${sz} ${colorClass}`}
                                      >
                                        {kw}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Action text */}
                              {item.type !== 'skill' && (
                                <div className="text-[10px] sm:text-xs font-semibold text-blue-500/90 dark:text-blue-400/90 flex items-center justify-end gap-1.5 animate-pulse mt-0.5">
                                  <span>{lang === 'zh' ? '点击查看详情' : 'Read more'}</span>
                                  <span className="text-xs">&rarr;</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Desktop Horizontal Card Structure */
                        <>
                          {/* Left Side Number */}
                          <div className="text-3xl sm:text-6xl md:text-7xl font-black text-slate-300/80 dark:text-slate-600/50 flex-shrink-0 w-10 sm:w-20 md:w-24 text-center select-none">
                            {String(item.categoryIndex).padStart(2, '0')}
                          </div>
        
                          {/* Right Side Content */}
                          <div className="flex-1 relative z-10 border-l-2 border-slate-200/50 dark:border-slate-700/50 pl-3 md:pl-6 min-w-0">
                            {renderItemContent(item, lang)}
                            {isActive && item.type !== 'skill' && (
                              <div className="mt-1.5 md:mt-3 flex items-center justify-between gap-3">
                                {/* Keywords inline */}
                                {(item.type === 'internship' || item.type === 'project') && item.data.keywords?.[lang] ? (
                                  <div className="flex flex-wrap gap-1 md:gap-2 flex-1 overflow-hidden" style={{ maxHeight: '3.5rem' }}>
                                    {item.data.keywords[lang].map((kw: string, i: number) => {
                                      const rot = (kw.length * 7 + i * 17) % 10 - 5;
                                      const sizes = ['text-[9px]', 'text-[10px]', 'text-[11px]', 'text-[10px]', 'text-[9px]', 'text-[11px]'];
                                      const sz = sizes[i % sizes.length];
                                      const colorClass = item.type === 'internship'
                                        ? 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-700/50'
                                        : 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-700/50';
                                      return (
                                        <span
                                          key={i}
                                          className={`inline-block font-semibold px-1.5 py-0.5 border shadow-sm backdrop-blur-sm rounded-tl-lg rounded-br-lg rounded-tr-[2px] rounded-bl-[2px] whitespace-nowrap ${sz} ${colorClass}`}
                                          style={{ transform: `rotate(${rot}deg)` }}
                                        >
                                          {kw}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : <div className="flex-1" />}
                                <div className="text-[10px] sm:text-sm font-medium text-blue-500/80 dark:text-blue-400/80 animate-pulse whitespace-nowrap flex-shrink-0">
                                  {lang === 'zh' ? '点击查看详情' : 'Read more'} &rarr;
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Navigation Buttons for Portrait Mode */}
      {isPortrait && (!showEndScreen && !showWelcome) && (
        <>
          {/* Left Arrow Button */}
          {activeIndex > 0 && (
            <button
              onClick={() => setActiveIndex(prev => Math.max(prev - 1, 0))}
              className="fixed left-3 bottom-[38%] -translate-y-1/2 z-50 w-10 h-10 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 flex items-center justify-center shadow-lg active:scale-90 transition-transform pointer-events-auto text-slate-700 dark:text-slate-200"
              aria-label="Previous Card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {/* Right Arrow Button */}
          {activeIndex < items.length - 1 && (
            <button
              onClick={() => setActiveIndex(prev => Math.min(prev + 1, items.length - 1))}
              className="fixed right-3 bottom-[38%] -translate-y-1/2 z-50 w-10 h-10 rounded-full glass-card hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 flex items-center justify-center shadow-lg active:scale-90 transition-transform pointer-events-auto text-slate-700 dark:text-slate-200"
              aria-label="Next Card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </>
      )}
    
      {/* Pagination Indicator (Far Right or Bottom Center) */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isPortrait 
              ? "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-1.5 max-w-[90vw] overflow-x-auto py-2 scrollbar-none items-center touch-none select-none"
              : "fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 md:gap-2"
            }
            onTouchStart={isPortrait ? handleDotsTouch : undefined}
            onTouchMove={isPortrait ? handleDotsTouch : undefined}
          >
            {items.map((item, index) => {
              const isNewSection = index > 0 && item.type !== items[index - 1].type;
              
              let dotColor = 'bg-blue-600 dark:bg-blue-400';
              let inactiveColor = 'bg-blue-200 dark:bg-blue-900/50';
              let hoverColor = 'hover:bg-blue-400 dark:hover:bg-blue-300';
              
              if (item.type === 'education') { dotColor = 'bg-blue-600 dark:bg-blue-400'; inactiveColor = 'bg-blue-200 dark:bg-blue-900/50'; hoverColor = 'hover:bg-blue-400'; }
              if (item.type === 'internship') { dotColor = 'bg-indigo-600 dark:bg-indigo-400'; inactiveColor = 'bg-indigo-200 dark:bg-indigo-900/50'; hoverColor = 'hover:bg-indigo-400'; }
              if (item.type === 'project') { dotColor = 'bg-purple-600 dark:bg-purple-400'; inactiveColor = 'bg-purple-200 dark:bg-purple-900/50'; hoverColor = 'hover:bg-purple-400'; }
              if (item.type === 'exchange') { dotColor = 'bg-rose-600 dark:bg-rose-400'; inactiveColor = 'bg-rose-200 dark:bg-rose-900/50'; hoverColor = 'hover:bg-rose-400'; }
              if (item.type === 'volunteer') { dotColor = 'bg-amber-600 dark:bg-amber-400'; inactiveColor = 'bg-amber-200 dark:bg-amber-900/50'; hoverColor = 'hover:bg-amber-400'; }
              if (item.type === 'skill') { dotColor = 'bg-teal-600 dark:bg-teal-400'; inactiveColor = 'bg-teal-200 dark:bg-teal-900/50'; hoverColor = 'hover:bg-teal-400'; }
    
              const activeDotClass = isPortrait 
                ? (index === activeIndex ? `w-6 h-2 ${dotColor} shadow-[0_0_15px_rgba(0,0,0,0.1)]` : `w-2 h-2 ${inactiveColor} ${hoverColor}`)
                : (index === activeIndex ? `h-8 w-2 ${dotColor} shadow-[0_0_15px_rgba(0,0,0,0.1)]` : `h-2 w-2 ${inactiveColor} ${hoverColor}`);
    
              return (
                <React.Fragment key={item.id}>
                  {isNewSection && (
                    isPortrait 
                      ? <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1 flex-shrink-0" />
                      : <div className="h-4 border-r-2 border-slate-200 dark:border-slate-800 mr-[-4px]" />
                  )}
                  <button
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-full transition-all duration-300 flex-shrink-0 ${activeDotClass}`}
                    aria-label={`Go to slide ${index + 1}`}
                    title={item.categoryTitle[lang]}
                  />
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── WELCOME SCREEN OVERLAY ─── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => setShowWelcome(false)}
          >
            {/* Darker background for welcome screen */}
            <motion.div 
              className="absolute inset-0 bg-slate-50/10 dark:bg-black/20 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8">
              <motion.div
                layoutId="hero-avatar"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  opacity: { duration: 0.8, delay: 0.2 },
                  scale: { type: 'spring', stiffness: 100, damping: 20, delay: 0.2 },
                  y: { type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }
                }}
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white dark:border-slate-700 shadow-2xl relative"
              >
                {/* Breathing effect for Welcome Screen */}
                <motion.div 
                  className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.4)]"
                  animate={{ 
                    boxShadow: [
                      '0 0 60px rgba(255,255,255,0.2)', 
                      '0 0 120px rgba(255,255,255,0.55)', 
                      '0 0 60px rgba(255,255,255,0.2)'
                    ] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                  <img
                    src={data.hero.avatarUrl.startsWith('http') ? data.hero.avatarUrl : `${import.meta.env.BASE_URL}${data.hero.avatarUrl.replace(/^\.?\//, '')}`}
                    alt={data.hero.name[lang]}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              
              <div className="text-center space-y-4">
                <motion.h1
                  layoutId="hero-name"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter"
                >
                  {data.hero.name[lang]}
                </motion.h1>
                <motion.p
                  layoutId="hero-role"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-2xl text-blue-600 dark:text-blue-400 font-bold tracking-wide"
                >
                  {data.hero.role[lang]}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12 flex flex-col items-center gap-2"
              >
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-widest uppercase">
                  {lang === 'zh' ? '点击或向下滚动进入' : 'Click or scroll to enter'}
                </p>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-slate-400 dark:text-slate-500"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── END SCREEN OVERLAY ─── */}
      <AnimatePresence>
        {showEndScreen && (
          <motion.div
            key="end-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          >
            {/* Progressively blurred background - Reduced blur for performance */}
            <motion.div
              className="absolute inset-0"
              initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
              animate={{ 
                backdropFilter: 'blur(16px)', 
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' 
              }}
              exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />

            {/* Orbiting text rings */}
            <EndScreenOrbit lang={lang} />

            {/* Center: Avatar + Name — shared layout transition from sidebar */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                layoutId="hero-avatar"
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="w-40 h-40 md:w-72 md:h-72 rounded-full border-4 border-white dark:border-slate-300 shadow-xl relative"
              >
                {/* Breathing effect on a separate layer to avoid layoutId conflicts */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{ 
                    boxShadow: theme === 'dark' ? [
                      '0 0 60px rgba(255,255,255,0.2)', 
                      '0 0 120px rgba(255,255,255,0.55)', 
                      '0 0 60px rgba(255,255,255,0.2)'
                    ] : [
                      '0 0 60px rgba(59,130,246,0.1)', 
                      '0 0 120px rgba(59,130,246,0.3)', 
                      '0 0 60px rgba(59,130,246,0.1)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                  <img
                    src={data.hero.avatarUrl.startsWith('http') ? data.hero.avatarUrl : `${import.meta.env.BASE_URL}${data.hero.avatarUrl.replace(/^\.?\//, '')}`}
                    alt={data.hero.name[lang]}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <div className="text-center">
                <motion.h1
                  layoutId="hero-name"
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest drop-shadow-2xl"
                >
                  {data.hero.name[lang]}
                </motion.h1>
                <motion.p
                  layoutId="hero-role"
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="mt-3 text-xs md:text-base text-slate-600 dark:text-white/70 font-medium tracking-widest px-6"
                >
                  {data.hero.role[lang]}
                </motion.p>
              </div>
              <motion.p
                className="text-slate-500 dark:text-white/40 text-[10px] md:text-xs tracking-widest mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                ↑ {lang === 'zh' ? '向上滚动返回' : 'Scroll up to return'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {passwordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-3xl w-full max-w-sm relative shadow-2xl"
            >
              <button
                onClick={() => { setPasswordModalOpen(false); setPasswordError(false); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4">{t('password_prompt')}</h3>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                  placeholder={t('password')}
                  className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  autoFocus
                />
                {passwordError && <p className="text-red-500 text-sm mb-4">{t('incorrect_password')}</p>}
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
                  {t('submit')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 dark:bg-black/80 backdrop-blur-xl"
            onClick={() => setDetailItem(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              className="bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl p-4 sm:p-8 md:p-10 rounded-3xl w-[96vw] md:w-[95vw] max-w-[1400px] h-auto max-h-[92vh] md:max-h-[90vh] overflow-hidden relative border border-white/20 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col text-left"
              onClick={e => e.stopPropagation()}
            >
              {/* Fixed Close Button */}
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-2.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white text-base md:text-lg z-50 shadow-md border border-slate-200/30 bg-white/80 dark:bg-slate-900/80"
              >
                ✕
              </button>

              {/* Fixed Header */}
              <div className="mb-6 pr-14 text-left border-b border-slate-200/60 dark:border-slate-800/80 pb-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    detailItem.type === 'project' 
                      ? 'bg-purple-100/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200/30' 
                      : detailItem.type === 'internship'
                      ? 'bg-indigo-100/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/30'
                      : 'bg-rose-100/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/30'
                  }`}>
                    {detailItem.type === 'project' ? (lang === 'zh' ? '科研项目' : 'Research') :
                     detailItem.type === 'internship' ? (lang === 'zh' ? '实习经历' : 'Internship') :
                     detailItem.type === 'education' ? (lang === 'zh' ? '教育背景' : 'Education') :
                     (lang === 'zh' ? '海外交流与志愿服务' : 'Exchange & Volunteer')}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black mb-1.5 text-slate-900 dark:text-white tracking-tight">
                  {detailItem.type === 'education' ? detailItem.data.institution[lang] :
                    detailItem.type === 'internship' ? detailItem.data.company[lang] : detailItem.data.name[lang]}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <span className="text-slate-850 dark:text-slate-250 font-bold">
                    {detailItem.type === 'education' ? detailItem.data.degree[lang] : detailItem.data.role[lang]}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">🗓 {detailItem.data.period}</span>
                  <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">📍 {detailItem.data.location[lang]}</span>
                </div>
              </div>

              {/* Scrollable Columns Wrapper */}
              <div className={`flex-1 overflow-y-auto grid grid-cols-1 gap-8 md:gap-10 pr-2 scrollbar-thin w-full ${
                detailItem.type === 'education' ? 'lg:grid-cols-[1fr_2fr]' : 'lg:grid-cols-[1fr_1.25fr]'
              }`}>
                
                {/* Left Column: Summary and Markdown Detail */}
                <div className="space-y-6 flex flex-col">
                  {/* Keywords if present */}
                  {detailItem.data.keywords?.[lang] && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {detailItem.data.keywords[lang].map((kw: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bullet points Summary */}
                  {detailItem.type === 'education' ? (
                    /* Education Left Column: GPA, Courses, Scholarships stacked vertically */
                    <div className="flex flex-col gap-6 flex-1">
                      {detailItem.data.gpa && (
                        <div 
                          className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-900/30 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <div>
                            <h4 className="text-base font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                              <span>📊</span>
                              <span>学业绩点 / GPA</span>
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{detailItem.data.gpa[lang]}</p>
                          </div>
                          
                          {detailItem.data.transcriptImage && (
                            <button
                              onClick={() => {
                                const src = `${import.meta.env.BASE_URL}experiences/education/${detailItem.data.id}/transcript/${detailItem.data.transcriptImage}`;
                                setLightboxImage(src);
                              }}
                              className="w-fit px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/40 hover:bg-blue-200/70 dark:hover:bg-blue-900/60 border border-blue-200/40 dark:border-blue-800/50 rounded-lg shadow-sm hover:shadow hover:scale-[1.02] transition-all flex items-center gap-1.5 group/btn"
                            >
                              <span className="text-xs group-hover/btn:scale-110 transition-transform">🔍</span>
                              <span>{lang === 'zh' ? '点击查看官方成绩单' : 'View Transcript'}</span>
                            </button>
                          )}
                        </div>
                      )}
                      
                      {detailItem.data.courses && (
                        <div 
                          className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/40 dark:border-indigo-900/30 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <div>
                            <h4 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                              <span>📚</span>
                              <span>核心课程 / Courses</span>
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{detailItem.data.courses[lang]}</p>
                          </div>
                        </div>
                      )}

                      {detailItem.data.scholarships && (
                        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/40 dark:border-amber-900/30 shadow-sm flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-base font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                              <span>🏅</span>
                              <span>奖学金 / Scholarships</span>
                            </h4>
                            <ul className="space-y-3">
                              {detailItem.data.scholarships[lang].map((s: string, i: number) => {
                                const cert = detailItem.data.scholarshipCertificates?.[i];
                                return (
                                  <li 
                                    key={i} 
                                    className="flex flex-col gap-2.5 p-3 rounded-xl border border-slate-200/10 dark:border-slate-800/10 bg-white/10 dark:bg-slate-950/10 hover:bg-amber-100/20 dark:hover:bg-amber-950/20 hover:border-amber-200/20 dark:hover:border-amber-800/15 transition-all"
                                  >
                                    <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-w-0 flex-1">
                                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                                      <span className="font-semibold text-xs md:text-sm">{s}</span>
                                    </div>
                                    {cert && (
                                      <button 
                                        onClick={() => {
                                          const src = `${import.meta.env.BASE_URL}experiences/education/${detailItem.data.id}/scholarships/${cert}`;
                                          setLightboxImage(src);
                                        }}
                                        className="w-fit px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 border border-amber-200/40 dark:border-amber-800/40 rounded-lg shadow-sm hover:shadow hover:scale-[1.01] transition-all flex items-center gap-1 shrink-0 group/btn"
                                      >
                                        <span className="group-hover/btn:translate-x-0.5 transition-transform">🔍</span>
                                        <span>{lang === 'zh' ? '点击查看证书' : 'View Cert'}</span>
                                      </button>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Bullet Points for experience types */
                    <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md">
                      <h4 className="text-base font-bold mb-4 text-slate-805 dark:text-slate-205">
                        {lang === 'zh' ? '工作要点 / Overview' : 'Key Highlights'}
                      </h4>
                      <ul className="list-none space-y-3.5 text-slate-750 dark:text-slate-250 text-sm leading-relaxed">
                        {detailItem.data.details?.[lang] && detailItem.data.details[lang].map((detail: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-blue-500 mt-1 flex-shrink-0 text-xs">◆</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Markdown Renderer Section */}
                  {detailItem.type !== 'education' && detailItem.data.hasMarkdown && (
                    <div className="mt-8 pt-8 border-t border-slate-200/60 dark:border-slate-800/80">
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span>📝</span>
                        <span>{lang === 'zh' ? '详细记录 / Detailed Process' : 'Details & Documentation'}</span>
                      </h4>
                      
                      {markdownLoading ? (
                        <div className="flex items-center gap-3 text-sm text-slate-400 py-6">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          <span>Loading details...</span>
                        </div>
                      ) : (
                        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                          {renderMarkdown(markdownContent)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Media Showcases / Education Awards */}
                <div className="space-y-8">
                  {detailItem.type === 'education' ? (
                    /* Education Right Column: Awards list */
                    detailItem.data.awards && (
                      <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-900/30 backdrop-blur-md flex flex-col justify-between h-full">
                        <div>
                          <h4 className="text-base font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                            <span>🏆</span>
                            <span>{lang === 'zh' ? '竞赛获奖 / Awards' : 'Awards & Competitions'}</span>
                          </h4>
                          <ul className="space-y-3">
                            {detailItem.data.awards[lang].map((a: string, i: number) => {
                              const cert = detailItem.data.awardCertificates?.[i];
                              return (
                                <li 
                                  key={i} 
                                  onClick={() => {
                                    if (cert) {
                                      const src = `${import.meta.env.BASE_URL}experiences/education/${detailItem.data.id}/awards/${cert}`;
                                      setLightboxImage(src);
                                    } else {
                                      setToast({
                                        message: lang === 'zh' 
                                          ? `【${a}】暂未关联本地证书文件。请在后台管理系统中指定对应的文件名！`
                                          : `"${a}" is not linked to a certificate file yet. Please specify it in the admin panel!`,
                                        type: 'info'
                                      });
                                    }
                                  }}
                                  className="group/item flex items-center justify-between gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/20 dark:border-slate-800/40 py-2.5 last:border-0 last:pb-0 cursor-pointer hover:bg-purple-100/20 dark:hover:bg-purple-950/20 px-2 rounded-lg -mx-2 transition-all"
                                >
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <span className="text-purple-500 shrink-0 text-xs mt-0.5 group-hover/item:scale-110 transition-transform">★</span>
                                    {/* Text-wrap enabled naturally as requested */}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 leading-normal break-words" title={a}>{a}</span>
                                  </div>
                                  
                                  <button
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shadow-sm border transition-all shrink-0 flex items-center gap-1 group/btn ${
                                      cert 
                                        ? 'text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-950/40 hover:bg-purple-200/70 dark:hover:bg-purple-900/60 border-purple-200/40 dark:border-purple-800/50'
                                        : 'text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-950/20 hover:bg-slate-200/50 dark:hover:bg-slate-900/40 border-slate-200/30 dark:border-slate-800/40 opacity-60 hover:opacity-100'
                                    }`}
                                    title={cert ? (lang === 'zh' ? '点击查看证书' : 'Click to view certificate') : (lang === 'zh' ? '暂无关联文件' : 'No file linked')}
                                  >
                                    <span>🔍</span>
                                    <span>
                                      {cert 
                                        ? (lang === 'zh' ? '查看证书' : 'View Cert') 
                                        : (lang === 'zh' ? '暂无证书' : 'No Cert')}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Standard experience type right column showcases */
                    <div className="space-y-8">
                      {/* Certificate adaptive showcase */}
                      {detailItem.data.showCerts !== false && detailItem.data.certificates && detailItem.data.certificates.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span>📜</span>
                            <span>{lang === 'zh' ? '获得证书 / Certificates' : 'Certificates Obtained'}</span>
                          </h4>
                          
                          {/* Grid structure adaptive to cert count */}
                          <div className={`grid gap-4 ${
                            detailItem.data.certificates.length === 1 
                              ? 'grid-cols-1' 
                              : detailItem.data.certificates.length === 2 
                              ? 'grid-cols-2' 
                              : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                          }`}>
                            {detailItem.data.certificates.slice(0, 3).map((cert: string, idx: number) => {
                              let folderType = 'projects';
                              if (detailItem.type === 'internship') folderType = 'internships';
                              if (detailItem.type === 'exchange') folderType = 'exchanges';
                              if (detailItem.type === 'volunteer') folderType = 'volunteers';
                              
                              const certSrc = `${import.meta.env.BASE_URL}experiences/${folderType}/${detailItem.data.id}/certificates/${cert}`;
                              
                              return (
                                <motion.div
                                  key={idx}
                                  onClick={() => setLightboxImage(certSrc)}
                                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 bg-slate-900 group cursor-pointer shadow-md shadow-slate-100 dark:shadow-none hover:shadow-lg transition-all"
                                  whileHover={{ y: -3, scale: 1.02 }}
                                >
                                  <img src={certSrc} alt={`Certificate ${idx + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
                                    </svg>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Experience details photo gallery with distinct animation based on type */}
                      {detailItem.data.showPhotos !== false && detailItem.data.photos && detailItem.data.photos.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span>🖼️</span>
                            <span>{lang === 'zh' ? '现场细节与过程 / Project Gallery' : 'Process & Gallery'}</span>
                          </h4>
                          
                          {/* Render type-specific layout */}
                          {(() => {
                            let folderType = 'projects';
                            if (detailItem.type === 'internship') folderType = 'internships';
                            if (detailItem.type === 'exchange') folderType = 'exchanges';
                            if (detailItem.type === 'volunteer') folderType = 'volunteers';
                            
                            const folderPath = `${import.meta.env.BASE_URL}experiences/${folderType}/${detailItem.data.id}`;
                            
                            if (detailItem.type === 'project') {
                              // Research -> 3D Rotating Wheel
                              return <Research3DCarousel photos={detailItem.data.photos} folderPath={folderPath} onPhotoClick={setLightboxImage} />;
                            } else if (detailItem.type === 'internship') {
                              // Internship -> Polaroid wall
                              return <InternshipPolaroidWall photos={detailItem.data.photos} folderPath={folderPath} onPhotoClick={setLightboxImage} />;
                            } else {
                              // Exchanges & Volunteers -> 3D Cover Flow
                              return <CoverFlowSlider photos={detailItem.data.photos} folderPath={folderPath} onPhotoClick={setLightboxImage} />;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for zooming in certificates */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-lg transition-colors"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={lightboxImage}
              alt="Zoomed certificate"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/50 text-slate-100 text-xs md:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 max-w-md text-center"
          >
            <span>🔔</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </LayoutGroup>
  );
};

// Orbiting text rings for the end screen — 6 unique rings, language-aware
function EndScreenOrbit({ lang }: { lang: 'en' | 'zh' }) {
  const { theme } = usePortfolio();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const zhTexts = [
    '求知若渴，虚心若愚  ✦  ',
    '志之所趋，无远弗届  ✦  ',
    '博观而约取，厚积而薄发  ✦  ',
    '不驰于空想，不骛于虚声  ✦  ',
    '路虽远，行则将至  ✦  ',
    '自强不息，厚德载物  ✦  ',
    '心之所向，素履以往  ✦  ',
    '每一步努力，都算数  ✦  ',
  ];

  const enTexts = [
    'Stay Hungry, Stay Foolish  ✦  ',
    'Dream big. Start small. Act now.  ✦  ',
    'Excellence is not an act, but a habit  ✦  ',
    'Be the change you wish to see  ✦  ',
    'Actions speak louder than words  ✦  ',
    'Growth begins at the edge of comfort  ✦  ',
    'Be the architect of your own destiny  ✦  ',
    'Keep going  ✦  ',
  ];

  const source = lang === 'zh' ? zhTexts : enTexts;

  // Each ring: { r: radius, text: string, dir: 1|-1, dur: seconds, fontSize, opacity, offset }
  // Combining more phrases for longer paths and adding offsets to stagger gaps
  const rings = [
    { r: 1050, dir: 1, dur: 120, fontSize: 18, opacity: 0.12, text: source[0] + source[2] + source[4] + source[6], offset: 0 },
    { r: 940, dir: -1, dur: 110, fontSize: 18, opacity: 0.15, text: source[1] + source[3] + source[5] + source[7], offset: 45 },
    { r: 840, dir: 1, dur: 100, fontSize: 17, opacity: 0.18, text: source[6] + source[7] + source[0] + source[1], offset: 90 },
    { r: 750, dir: -1, dur: 90, fontSize: 17, opacity: 0.22, text: source[2] + source[4] + source[6] + source[3], offset: 135 },
    { r: 670, dir: 1, dur: 82, fontSize: 16, opacity: 0.26, text: source[1] + source[5] + source[7] + source[4], offset: 180 },
    { r: 600, dir: -1, dur: 75, fontSize: 16, opacity: 0.30, text: source[0] + source[3] + source[5] + source[2], offset: 225 },
    { r: 540, dir: 1, dur: 68, fontSize: 15, opacity: 0.35, text: source[4] + source[1] + source[6], offset: 270 },
    { r: 485, dir: -1, dur: 60, fontSize: 15, opacity: 0.40, text: source[2] + source[6] + source[0], offset: 315 },
    { r: 435, dir: 1, dur: 52, fontSize: 14, opacity: 0.45, text: source[5] + source[7] + source[1], offset: 60 },
    { r: 390, dir: -1, dur: 45, fontSize: 14, opacity: 0.50, text: source[0] + source[4] + source[2], offset: 120 },
    { r: 350, dir: 1, dur: 40, fontSize: 13, opacity: 0.55, text: source[1] + source[3] + source[5], offset: 180 },
    { r: 315, dir: -1, dur: 35, fontSize: 13, opacity: 0.60, text: source[2] + source[5] + source[7], offset: 240 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {rings.map((ring, i) => {
        // Scale down rings for mobile
        const radius = isMobile ? ring.r * 0.6 : ring.r;
        const fontSize = isMobile ? Math.max(ring.fontSize * 0.7, 10) : ring.fontSize;
        
        const size = (radius + 20) * 2;
        const cx = radius + 20;
        const d = `M ${cx},${cx} m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`;
        const id = `orbit-ring-${i}`;
        return (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ rotate: ring.offset }}
            animate={{ rotate: ring.offset + ring.dir * 360 }}
            transition={{ duration: ring.dur, repeat: Infinity, ease: 'linear' }}
            style={{ 
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            <svg
              width={size} height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="flex-shrink-0"
              style={{ maxWidth: 'none', maxHeight: 'none' }}
            >
              <defs>
                <path id={id} d={d} />
              </defs>
              <text
                fontSize={fontSize}
                fill={theme === 'dark' ? `rgba(255,255,255,${ring.opacity})` : `rgba(15,23,42,${ring.opacity})`}
                fontFamily="'Inter', 'PingFang SC', sans-serif"
                letterSpacing="2"
              >
                <textPath href={`#${id}`}>{ring.text.repeat(isMobile ? 4 : 6)}</textPath>
              </text>
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Home;

function renderItemContent(item: CarouselItem, lang: 'en' | 'zh') {
  if (item.type === 'education') {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
          <div>
            <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.data.institution[lang]}</h4>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">{item.data.degree[lang]}</p>
          </div>
          <div className="text-left sm:text-right text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap mt-1 sm:mt-0 sm:pl-4">
            <div>{item.data.period}</div>
            <div>{item.data.location[lang]}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'internship' || item.type === 'project' || item.type === 'exchange' || item.type === 'volunteer') {
    const isInternship = item.type === 'internship';
    const isVolunteer = item.type === 'volunteer';
    const isExchange = item.type === 'exchange';
    const title = isInternship ? item.data.company[lang] : item.data.name[lang];
    const roleColor = isInternship ? 'text-indigo-600 dark:text-indigo-400' : isExchange ? 'text-rose-600 dark:text-rose-400' : isVolunteer ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400';

    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
          <div className="pr-2 min-w-0">
            <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight truncate-multiline">{title}</h4>
            <p className={`${roleColor} font-medium text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1`}>{item.data.role[lang]}</p>
          </div>
          <div className="text-left sm:text-right text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap mt-1 sm:mt-0 sm:pl-4">
            <div>{item.data.period}</div>
            <div>{item.data.location[lang]}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'skill') {
    return (
      <div>
        <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1.5 sm:mb-3 md:mb-6">{item.data.category[lang]}</h4>
        <div className="flex flex-wrap gap-1.5 md:gap-3">
          {item.data.items[lang].map((skill: string, i: number) => (
            <span key={i} className="px-2 py-1 md:px-4 md:py-2 bg-white/60 dark:bg-slate-800/60 rounded-md md:rounded-xl text-[10px] sm:text-xs md:text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ==========================================
// Custom Experience Photo Gallery Components
// ==========================================

// 1. Research Project 3D Rotating Carousel
const Research3DCarousel: React.FC<{ photos: string[], folderPath: string, onPhotoClick: (src: string) => void }> = ({ photos, folderPath, onPhotoClick }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'zh';
  const count = photos.length;
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isLocalMobile, setIsLocalMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsLocalMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adaptive layout strategy based on card count
  if (count === 1) {
    const src = `${folderPath}/photos/${photos[0]}`;
    return (
      <div className="relative w-full h-[230px] sm:h-[340px] flex items-center justify-center bg-slate-950/20 dark:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
        <div 
          className="relative w-[220px] h-[146px] sm:w-[360px] sm:h-[240px] rounded-2xl overflow-hidden border border-purple-500/25 shadow-[0_0_20px_rgba(168,85,247,0.2)] bg-slate-900 cursor-pointer hover:border-purple-400 hover:scale-[1.02] transition-all duration-300 group"
          onClick={() => onPhotoClick(src)}
        >
          <img 
            src={src} 
            alt="Project Detail" 
            className="w-full h-full object-cover select-none"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0,0,0)',
            }}
          />
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="relative w-full h-[230px] sm:h-[340px] flex items-center justify-center bg-slate-950/20 dark:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md shadow-inner px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
        <div className="flex gap-4 sm:gap-6 w-full max-w-[500px] justify-center">
          {photos.slice(0, 2).map((photo, idx) => {
            const src = `${folderPath}/photos/${photo}`;
            return (
              <div 
                key={idx}
                className="relative w-[110px] h-[73px] sm:w-[220px] sm:h-[146px] rounded-2xl overflow-hidden border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-slate-900 cursor-pointer hover:border-purple-400 hover:scale-[1.04] transition-all duration-300 group"
                onClick={() => onPhotoClick(src)}
              >
                <img 
                  src={src} 
                  alt={`Project Detail ${idx}`} 
                  className="w-full h-full object-cover select-none"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    backfaceVisibility: 'hidden',
                    transform: 'translate3d(0,0,0)',
                  }}
                />
                 <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Dynamic card and cylinder spacing based on image count to prevent clipping and overlap completely
  let cardWidth = 200;
  let cardHeight = 135;
  let radius = 240;

  if (isLocalMobile) {
    cardWidth = 120;
    cardHeight = 80;
    radius = count > 8 ? 160 : count > 5 ? 130 : count > 3 ? 100 : 80;
  } else {
    if (count <= 4) {
      cardWidth = 210;
      cardHeight = 140;
      radius = 180;
    } else if (count <= 6) {
      cardWidth = 190;
      cardHeight = 127;
      radius = 240;
    } else {
      // 7-9 images: slightly more compact width and scientifically optimal radius to fit completely inside container bounds
      cardWidth = 175;
      cardHeight = 118;
      radius = 300;
    }
  }

  // Slow continuous auto-rotation when NOT hovered
  useEffect(() => {
    if (isHovered || isTransitioning) return;
    const timer = setInterval(() => {
      setRotation(r => r + 0.12);
    }, 30);
    return () => clearInterval(timer);
  }, [isHovered, isTransitioning]);

  const handlePrev = () => {
    setIsTransitioning(true);
    const step = 360 / count;
    setRotation(r => {
      const nearestStep = Math.round(r / step) * step;
      return nearestStep + step;
    });
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    const step = 360 / count;
    setRotation(r => {
      const nearestStep = Math.round(r / step) * step;
      return nearestStep - step;
    });
    setTimeout(() => setIsTransitioning(false), 800);
  };

  // Calculate which card index is closest to the front
  const activeIdx = (Math.round(-rotation / (360 / count)) % count + count) % count;

  return (
    <div 
      className="relative w-full h-[230px] sm:h-[340px] flex items-center justify-center overflow-hidden bg-slate-950/20 dark:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md shadow-inner group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTransitioning(false);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />
      
      <div 
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          perspective: isLocalMobile ? '1200px' : '2200px',
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        <div
          className="absolute w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg) rotateX(-4deg)`,
            transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {photos.map((photo, i) => {
            const angle = (i * 360) / count;
            const src = `${folderPath}/photos/${photo}`;
            const isActiveCard = i === activeIdx;

            // Calculate distance in the circle
            const diff = Math.min(
              Math.abs(i - activeIdx),
              count - Math.abs(i - activeIdx)
            );
            const isVisible = diff <= 2;

            // Compute opacity and scale based on distance
            let opacity = 0;
            let scale = 1;
            let zIndex = 0;

            if (diff === 0) {
              opacity = 1;
              scale = 1.15;
              zIndex = 30;
            } else if (diff === 1) {
              opacity = 0.75;
              scale = 0.85;
              zIndex = 20;
            } else if (diff === 2) {
              opacity = 0.25;
              scale = 0.65;
              zIndex = 10;
            } else {
              opacity = 0;
              scale = 0.5;
              zIndex = 0;
            }

            return (
              <div
                key={i}
                className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-slate-900 cursor-pointer hover:border-purple-400 transition-all duration-500 group"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                  backfaceVisibility: 'hidden',
                  opacity,
                  zIndex,
                  pointerEvents: opacity > 0.1 ? 'auto' : 'none',
                  willChange: 'transform, opacity',
                }}
                onClick={() => {
                  if (isActiveCard) {
                    onPhotoClick(src);
                  } else {
                    setIsTransitioning(true);
                    setRotation(-angle);
                    setTimeout(() => setIsTransitioning(false), 800);
                  }
                }}
              >
                {isVisible && (
                  <img 
                    src={src} 
                    alt={`Project Detail ${i}`} 
                    className="w-full h-full object-cover select-none"
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      transform: 'translate3d(0,0,0)',
                    }}
                  />
                )}
                {isActiveCard && opacity > 0.5 && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handlePrev}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-xs text-white backdrop-blur-sm transition-colors active:scale-95"
        >
          &larr;
        </button>
        <button 
          onClick={handleNext}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-xs text-white backdrop-blur-sm transition-colors active:scale-95"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};


// 2. Internship Scattered Polaroid Photo Wall
const InternshipPolaroidWall: React.FC<{ photos: string[], folderPath: string, onPhotoClick: (src: string) => void }> = ({ photos, folderPath, onPhotoClick }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'zh';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const [isLocalMobile, setIsLocalMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsLocalMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate stable rotation/position offsets for polaroids
  const offsets = useRef(photos.map((_, idx) => {
    const rot = (idx * 47) % 16 - 8; // -8deg to 8deg
    const x = (idx * 31) % (isLocalMobile ? 16 : 30) - (isLocalMobile ? 8 : 15);   
    const y = (idx * 17) % (isLocalMobile ? 12 : 20) - (isLocalMobile ? 6 : 10);   
    return { rot, x, y };
  }));

  return (
    <div className="relative w-full h-[280px] sm:h-[420px] bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-4 sm:p-8 overflow-hidden flex items-center justify-center shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
      
      <div className="relative w-[160px] h-[200px] sm:w-[260px] sm:h-[310px]">
        {photos.map((photo, i) => {
          const src = `${folderPath}/photos/${photo}`;
          const isHovered = hoveredIdx === i;
          const { rot, x, y } = offsets.current[i] || { rot: 0, x: 0, y: 0 };
          
          return (
            <motion.div
              key={i}
              className="absolute inset-0 p-2 sm:p-3 pb-5 sm:pb-8 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-between cursor-pointer origin-center group"
              style={{
                zIndex: isHovered ? 50 : i + 10,
                x: isHovered ? 0 : x,
                y: isHovered ? 0 : y,
                rotate: isHovered ? 0 : rot,
              }}
              animate={{
                scale: isHovered ? (isLocalMobile ? 1.15 : 1.25) : 1,
                rotate: isHovered ? 0 : rot,
                x: isHovered ? 0 : x,
                y: isHovered ? 0 : y,
                boxShadow: isHovered 
                  ? '0 20px 40px rgba(0,0,0,0.25)' 
                  : '0 4px 10px rgba(0,0,0,0.08)',
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onPhotoClick(src)}
            >
              <div className="relative w-full aspect-square rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/30 dark:border-slate-800/80">
                <img src={src} alt={`Polaroid Detail ${i}`} className="w-full h-full object-cover select-none" />
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
                  </svg>
                </div>
              </div>
              <div className="text-[7px] sm:text-[9px] font-bold font-mono tracking-wider mt-1 sm:mt-2 text-slate-400 dark:text-slate-500 select-none uppercase">
                PHOTO DETAIL #{i + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


// 3. Volunteer & Exchange 3D Cover Flow Slider
const CoverFlowSlider: React.FC<{ photos: string[], folderPath: string, onPhotoClick: (src: string) => void }> = ({ photos, folderPath, onPhotoClick }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'zh';
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [isLocalMobile, setIsLocalMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsLocalMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prev = () => setActiveIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setActiveIndex(i => (i + 1) % photos.length);

  return (
    <div className="relative w-full h-[230px] sm:h-[340px] bg-slate-950/10 dark:bg-black/30 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner group">
      <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div 
        className="relative w-full max-w-[420px] h-[115px] sm:h-[170px] flex items-center justify-center"
        style={{ perspective: '800px' }}
      >
        {photos.map((photo, i) => {
          const src = `${folderPath}/photos/${photo}`;
          const diff = i - activeIndex;
          const isActive = diff === 0;
          
          let rotateY = 0;
          let translateZ = 0;
          let scale = 1;
          let translateX = 0;
          let opacity = 0;

          const txOffset = isLocalMobile ? 85 : 140;
          const farTxOffset = isLocalMobile ? 170 : 280;

          if (isActive) {
            rotateY = 0;
            translateZ = 80;
            translateX = 0;
            scale = 1.15;
            opacity = 1;
          } else if (diff === -1 || (activeIndex === 0 && i === photos.length - 1)) {
            rotateY = 32;
            translateZ = -50;
            translateX = -txOffset;
            scale = 0.85;
            opacity = 0.7;
          } else if (diff === 1 || (activeIndex === photos.length - 1 && i === 0)) {
            rotateY = -32;
            translateZ = -50;
            translateX = txOffset;
            scale = 0.85;
            opacity = 0.7;
          } else {
            opacity = 0;
            translateX = diff > 0 ? farTxOffset : -farTxOffset;
          }

          return (
            <motion.div
              key={i}
              className="absolute w-[160px] h-[115px] sm:w-[240px] sm:h-[170px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 dark:border-slate-800 shadow-2xl cursor-pointer group"
              style={{ transformStyle: 'preserve-3d', zIndex: isActive ? 30 : 10 }}
              animate={{
                x: translateX,
                rotateY,
                z: translateZ,
                scale,
                opacity,
              }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              onClick={() => {
                if (isActive) {
                  onPhotoClick(src);
                } else {
                  setActiveIndex(i);
                }
              }}
            >
              <img src={src} alt={`Cover Flow Detail ${i}`} className="w-full h-full object-cover select-none" />
              {isActive && (
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.603 10.603z" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between pointer-events-none">
        <button 
          onClick={prev}
          className="pointer-events-auto w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 hover:border-white/30 text-xs backdrop-blur-sm transition-all active:scale-90"
        >
          &larr;
        </button>
        
        <div className="flex gap-1.5">
          {photos.map((_, i) => (
            <span 
              key={i} 
              onClick={() => setActiveIndex(i)}
              className={`pointer-events-auto cursor-pointer h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 bg-rose-500' : 'w-1.5 bg-slate-400/50'}`} 
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="pointer-events-auto w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 hover:border-white/30 text-xs backdrop-blur-sm transition-all active:scale-90"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};

// ==========================================
// Custom Lightweight Markdown Parser
// ==========================================

function renderMarkdown(md: string) {
  if (!md) return null;
  
  const lines = md.split('\n');
  let listItems: string[] = [];
  const renderedElements: React.ReactNode[] = [];
  
  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-2.5 my-4 text-slate-700 dark:text-slate-300">
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# ')) {
      flushList(index);
      renderedElements.push(
        <h1 key={index} className="text-2xl font-black mt-6 mb-4 text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(index);
      renderedElements.push(
        <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-100">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(index);
      renderedElements.push(
        <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.substring(2));
    } else if (trimmed === '') {
      flushList(index);
    } else {
      flushList(index);
      renderedElements.push(
        <p key={index} className="my-3 text-slate-700 dark:text-slate-300 leading-relaxed" 
           dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed) }} />
      );
    }
  });
  
  flushList(lines.length);
  return renderedElements;
}

function parseInlineMarkdown(text: string) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded font-mono text-xs text-blue-600 dark:text-blue-400">$1</code>');
  return html;
}
