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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Re-added state for detail modal
  const [detailItem, setDetailItem] = useState<CarouselItem | null>(null);

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
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (document.body.style.overflow === 'hidden') return;
      const touchEnd = e.changedTouches[0].clientY;
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
      
      if (e.key === 'ArrowDown') {
        if (showWelcome) {
          setShowWelcome(false);
        } else if (!showEndScreen) {
          if (activeIndex >= items.length - 1) {
            setShowEndScreen(true);
          } else {
            setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
          }
        }
      } else if (e.key === 'ArrowUp') {
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
  }, [items.length, activeIndex, showEndScreen, showWelcome]);

  // Lock body scroll when modal opens
  useEffect(() => {
    if (detailItem || passwordModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [detailItem, passwordModalOpen]);

  if (loading || !data || items.length === 0) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

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
  let bgColors = ['bg-blue-400/30 dark:bg-blue-900/30', 'bg-indigo-400/30 dark:bg-indigo-900/30', 'bg-purple-400/30 dark:bg-purple-900/30'];
  if (currentItem?.type === 'education') bgColors = ['bg-blue-400/30 dark:bg-blue-900/30', 'bg-cyan-400/30 dark:bg-cyan-900/30', 'bg-sky-400/30 dark:bg-sky-900/30'];
  if (currentItem?.type === 'internship') bgColors = ['bg-indigo-400/30 dark:bg-indigo-900/30', 'bg-violet-400/30 dark:bg-violet-900/30', 'bg-purple-400/30 dark:bg-purple-900/30'];
  if (currentItem?.type === 'project') bgColors = ['bg-purple-400/30 dark:bg-purple-900/30', 'bg-fuchsia-400/30 dark:bg-fuchsia-900/30', 'bg-pink-400/30 dark:bg-pink-900/30'];
  if (currentItem?.type === 'exchange') bgColors = ['bg-rose-400/30 dark:bg-rose-900/30', 'bg-red-400/30 dark:bg-red-900/30', 'bg-orange-400/30 dark:bg-orange-900/30'];
  if (currentItem?.type === 'volunteer') bgColors = ['bg-amber-400/30 dark:bg-amber-900/30', 'bg-orange-400/30 dark:bg-orange-900/30', 'bg-yellow-400/30 dark:bg-yellow-900/30'];
  if (currentItem?.type === 'skill') bgColors = ['bg-teal-400/30 dark:bg-teal-900/30', 'bg-emerald-400/30 dark:bg-emerald-900/30', 'bg-green-400/30 dark:bg-green-900/30'];

  return (
    <LayoutGroup>
    <div className={`relative w-full h-full ${isMobile ? '' : 'pt-20'}`}>

      {/* Dynamic Background - Simplified for mobile performance */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full ${bgColors[0]} ${isMobile ? 'blur-2xl opacity-50' : 'blur-3xl animate-blob'} mix-blend-multiply dark:mix-blend-screen transition-colors duration-700`}></div>
        <div className={`absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full ${bgColors[1]} ${isMobile ? 'blur-2xl opacity-50' : 'blur-3xl animate-blob animation-delay-2000'} mix-blend-multiply dark:mix-blend-screen transition-colors duration-700`}></div>
        <div className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full ${bgColors[2]} ${isMobile ? 'blur-2xl opacity-50' : 'blur-3xl animate-blob animation-delay-4000'} mix-blend-multiply dark:mix-blend-screen transition-colors duration-700`}></div>
      </div>

      {/* Category Title */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          <div className="absolute top-24 right-6 md:right-10 z-30">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-wider text-right drop-shadow-xl"
              >
                {currentCategory}
              </motion.h2>
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Axis: Profile Photo (Left side) */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
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
        )}
      </AnimatePresence>

      {/* Roulette Wheel - Centered on mobile, Left-offset on desktop */}
      <AnimatePresence>
        {(!showEndScreen && !showWelcome) && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 overflow-visible pointer-events-none transition-all duration-500 ${isMobile ? '' : (windowSize.width < 1100 ? 'left-[40%]' : 'left-[35%]')}`}
          >
            <div className="relative w-full h-full flex items-center justify-center md:justify-start">
              {items.map((item, index) => {
            const diff = index - activeIndex;
            
            // Render window optimization (+/- 3 items for maximum mobile FPS)
            if (Math.abs(diff) > 3) return null;

            const currentActiveItem = items[activeIndex];
            const isSameCategory = item.type === currentActiveItem.type;

            const isNarrow = windowSize.width < 1100;
            const R = isMobile ? 350 : (isNarrow ? 500 : 600);
            const thetaDeg = diff * (isMobile ? 18 : (isNarrow ? 20 : 22)); 
            const thetaRad = thetaDeg * (Math.PI / 180);

            const xOffset = isMobile ? 0 : R * Math.cos(thetaRad) - R;
            const yOffset = R * Math.sin(thetaRad);

            const scale = Math.max(1 - Math.abs(diff) * (isMobile ? 0.18 : 0.15), 0.7); 
            const rotateX = diff * -8;
            const rotateZ = isMobile ? 0 : diff * 5; 

            const isActive = diff === 0;

            let opacity = 0;
            if (isSameCategory) {
              opacity = isActive ? 1 : Math.max(1 - Math.abs(diff) * 0.45, 0.1);
            }

            // Render all items for smooth opacity transitions! Pointer events disabled if hidden
            const pointerEventsClass = opacity === 0 ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer';

            // Shape based on type
            let shapeClass = 'rounded-xl border-blue-200 dark:border-blue-800 bg-white/40 dark:bg-slate-900/40';
            if (item.type === 'education') shapeClass = 'rounded-md border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/30';
            if (item.type === 'internship') shapeClass = 'rounded-full border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/30 px-10';
            if (item.type === 'project') shapeClass = 'rounded-none border-l-8 border-purple-500 bg-purple-50/60 dark:bg-purple-900/30';
            if (item.type === 'exchange') shapeClass = 'rounded-3xl border-rose-400 dark:border-rose-600 bg-rose-50/60 dark:bg-rose-900/30';
            if (item.type === 'volunteer') shapeClass = 'rounded-2xl border-dashed border-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/30';
            if (item.type === 'skill') shapeClass = 'rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-xl rounded-br-xl border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/30';

            // Adaptive max-width based on screen width
            const cardMaxWidth = isMobile 
              ? 'max-w-[calc(100vw-2rem)]' 
              : (windowSize.width < 1100 ? 'max-w-2xl' : 'max-w-4xl');

            return (
              <motion.div
                key={item.id}
                className={`absolute w-full ${cardMaxWidth} px-4 md:px-6 origin-center md:origin-left ${isActive ? 'z-20 cursor-default pointer-events-auto' : `z-10 ${pointerEventsClass}`}`}
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
                <div className={`relative overflow-hidden backdrop-blur-md p-4 sm:p-6 md:p-8 border transition-all duration-300 flex items-center gap-4 md:gap-6 ${shapeClass} ${isActive ? 'shadow-2xl scale-[1.02]' : 'hover:border-slate-400'}`}>
                  {/* Left Side Number */}
                  <div className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-300/80 dark:text-slate-600/50 flex-shrink-0 w-12 sm:w-20 md:w-24 text-center select-none">
                    {String(item.categoryIndex).padStart(2, '0')}
                  </div>

                  {/* Right Side Content */}
                  <div className="flex-1 relative z-10 border-l-2 border-slate-200/50 dark:border-slate-700/50 pl-4 md:pl-6">
                    {renderItemContent(item, lang)}
                    {isActive && item.type !== 'skill' && (
                      <div className="mt-2 md:mt-3 flex items-center justify-between gap-3">
                        {/* Keywords inline */}
                        {(item.type === 'internship' || item.type === 'project') && item.data.keywords?.[lang] ? (
                          <div className="flex flex-wrap gap-1.5 md:gap-2 flex-1 overflow-hidden" style={{ maxHeight: '3.5rem' }}>
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
                        <div className="text-xs sm:text-sm font-medium text-blue-500/80 dark:text-blue-400/80 animate-pulse whitespace-nowrap flex-shrink-0">
                          Click to read more &rarr;
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Pagination Indicator (Far Right) */}
  <AnimatePresence>
    {(!showEndScreen && !showWelcome) && (
      <motion.div 
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 md:gap-2"
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

          return (
            <React.Fragment key={item.id}>
              {isNewSection && <div className="h-4 border-r-2 border-slate-200 dark:border-slate-800 mr-[-4px]" />} {/* Gap between sections */}
              <button
                onClick={() => setActiveIndex(index)}
                className={`w-2 rounded-full transition-all duration-300 ${index === activeIndex
                  ? `h-8 ${dotColor} shadow-[0_0_15px_rgba(0,0,0,0.1)]`
                  : `h-2 ${inactiveColor} ${hoverColor}`
                  }`}
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-400/20 dark:bg-black/60 backdrop-blur-xl"
            onClick={() => setDetailItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-y-auto relative border border-white dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors text-lg"
              >
                ✕
              </button>

              {/* Header */}
              <div className="mb-8 pr-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-4xl font-bold mb-2">
                  {detailItem.type === 'education' ? detailItem.data.institution[lang] :
                    detailItem.type === 'internship' ? detailItem.data.company[lang] : detailItem.data.name[lang]}
                </h2>
                <h3 className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
                  {detailItem.type === 'education' ? detailItem.data.degree[lang] : detailItem.data.role[lang]}
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                  <span>🗓 {detailItem.data.period}</span>
                  <span>📍 {detailItem.data.location[lang]}</span>
                </div>
              </div>

              {/* Education: Structured Sections */}
              {detailItem.type === 'education' ? (
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2.8fr] gap-8 items-start">
                  {/* Left Column: GPA, Courses, Scholarships */}
                  <div className="space-y-6">
                    {/* GPA */}
                    {detailItem.data.gpa && (
                      <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">📊</span>
                          <h4 className="text-base font-bold text-blue-700 dark:text-blue-300">
                            {lang === 'zh' ? '学业绩点' : 'Academic Performance'}
                          </h4>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                          {detailItem.data.gpa[lang]}
                        </p>
                      </div>
                    )}

                    {/* Core Courses */}
                    {detailItem.data.courses && (
                      <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">📚</span>
                          <h4 className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                            {lang === 'zh' ? '核心课程及成绩' : 'Core Courses & Grades'}
                          </h4>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                          {detailItem.data.courses[lang]}
                        </p>
                      </div>
                    )}

                    {/* Scholarships */}
                    {detailItem.data.scholarships && (
                      <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">🏅</span>
                          <h4 className="text-base font-bold text-amber-700 dark:text-amber-300">
                            {lang === 'zh' ? '奖学金' : 'Scholarships'}
                          </h4>
                        </div>
                        <ul className="space-y-2">
                          {detailItem.data.scholarships[lang].map((s: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              <span className="text-amber-500 mt-0.5 flex-shrink-0">◆</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Awards */}
                  <div className="space-y-6">
                    {/* Awards */}
                    {detailItem.data.awards && (
                      <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">🏆</span>
                          <h4 className="text-base font-bold text-purple-700 dark:text-purple-300">
                            {lang === 'zh' ? '竞赛获奖' : 'Competitions & Awards'}
                          </h4>
                        </div>
                        <ul className="space-y-3">
                          {detailItem.data.awards[lang].map((a: string, i: number) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-b border-slate-200/50 dark:border-slate-700/50 pb-2 last:border-0 last:pb-0">
                              <span className="text-purple-500 mt-0.5 flex-shrink-0">★</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Non-education: standard bullet list */
                <div className="space-y-4">
                  <h4 className="text-lg font-bold">{lang === 'zh' ? '工作内容' : 'Details'}</h4>
                  <ul className="list-disc list-inside space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {detailItem.data.details[lang].map((detail: string, i: number) => (
                      <li key={i} className="pl-2">{detail}</li>
                    ))}
                  </ul>
                </div>
              )}

            </motion.div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{item.data.institution[lang]}</h4>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-base sm:text-lg mt-1">{item.data.degree[lang]}</p>
          </div>
          <div className="text-left sm:text-right text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap mt-2 sm:mt-0 sm:pl-4">
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
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="pr-4">
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{title}</h4>
            <p className={`${roleColor} font-medium text-base sm:text-lg mt-1 md:mt-2`}>{item.data.role[lang]}</p>
          </div>
          <div className="text-left sm:text-right text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap mt-2 sm:mt-0 sm:pl-4">
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
        <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 md:mb-6">{item.data.category[lang]}</h4>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {item.data.items[lang].map((skill: string, i: number) => (
            <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg md:rounded-xl text-xs md:text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
