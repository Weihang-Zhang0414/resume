import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselItem {
  id: string;
  type: string;
  categoryTitle: { en: string, zh: string };
  categoryIndex: number;
  data: any;
}

const Home: React.FC = () => {
  const { data, loading } = usePortfolio();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as 'en' | 'zh';

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<CarouselItem[]>([]);
  const scrollAccumulator = useRef(0);

  // Re-added state for detail modal
  const [detailItem, setDetailItem] = useState<CarouselItem | null>(null);

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
      // If modal is open, let user scroll inside it
      if (document.body.style.overflow === 'hidden') return;

      e.preventDefault();
      scrollAccumulator.current += e.deltaY;
      const threshold = 80;

      if (Math.abs(scrollAccumulator.current) > threshold) {
        if (scrollAccumulator.current > 0) {
          setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        } else {
          setActiveIndex(prev => Math.max(prev - 1, 0));
        }
        scrollAccumulator.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [items.length]);

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
  if (currentItem?.type === 'volunteer') bgColors = ['bg-amber-400/30 dark:bg-amber-900/30', 'bg-orange-400/30 dark:bg-orange-900/30', 'bg-yellow-400/30 dark:bg-yellow-900/30'];
  if (currentItem?.type === 'skill') bgColors = ['bg-teal-400/30 dark:bg-teal-900/30', 'bg-emerald-400/30 dark:bg-emerald-900/30', 'bg-green-400/30 dark:bg-green-900/30'];

  return (
    <div className="relative w-full h-full pt-20">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full ${bgColors[0]} blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob transition-colors duration-700`}></div>
        <div className={`absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full ${bgColors[1]} blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000 transition-colors duration-700`}></div>
        <div className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full ${bgColors[2]} blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000 transition-colors duration-700`}></div>
      </div>

      {/* Category Title (Top Right) */}
      <div className="absolute top-24 right-10 z-30">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentCategory}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-wider text-right drop-shadow-lg"
          >
            {currentCategory}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Axis: Profile Photo (Left) */}
      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 z-40 flex flex-col items-center">
        <motion.div
          className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/50 shadow-[0_0_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-pointer relative group"
          onDoubleClick={handlePhotoDoubleClick}
          whileHover={{ scale: 1.05 }}
        >
          <img src={data.hero.avatarUrl} alt={data.hero.name[lang]} className="w-full h-full object-cover" />
        </motion.div>
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-md">{data.hero.name[lang]}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium drop-shadow-md">{data.hero.role[lang]}</p>
          <div className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {data.hero.visibility?.email !== false && (
              <a href={`mailto:${data.hero.email}`} className="hover:text-blue-500 transition-colors">{data.hero.email}</a>
            )}
            {data.hero.visibility?.phone !== false && (
              <span>{data.hero.phone}</span>
            )}
            {(data.hero.visibility?.wechat !== false || data.hero.visibility?.instagram !== false) && (
              <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                {data.hero.visibility?.wechat !== false && (
                  <span className="flex items-center justify-center gap-1.5"><span className="text-xs opacity-70">WeChat:</span> {data.hero.wechat}</span>
                )}
                {data.hero.visibility?.instagram !== false && (
                  <span className="flex items-center justify-center gap-1.5"><span className="text-xs opacity-70">Instagram:</span> {data.hero.instagram}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roulette Wheel (Right side) */}
      <div className="absolute left-[40%] right-0 top-0 bottom-0 overflow-visible pointer-events-none">
        <div className="relative w-full h-full flex items-center">
          {items.map((item, index) => {
            const diff = index - activeIndex;
            const currentActiveItem = items[activeIndex];
            const isSameCategory = item.type === currentActiveItem.type;

            // Calculations for true circular layout
            const R = 600; // Radius of the circle
            const thetaDeg = diff * 22; // Degrees per item
            const thetaRad = thetaDeg * (Math.PI / 180);

            // At diff=0, cos(0)=1, xOffset=0. As diff increases, cos<1, xOffset becomes negative (curves left)
            const xOffset = R * Math.cos(thetaRad) - R;
            const yOffset = R * Math.sin(thetaRad);

            const scale = Math.max(1 - Math.abs(diff) * 0.15, 0.75); // Scaled up cards!
            const rotateX = diff * -5; // Slight 3D rotation
            const rotateZ = diff * 5; // Rotate along the circle slightly

            const isActive = diff === 0;

            let opacity = 0;
            if (isSameCategory) {
              // Active item is fully opaque, others in the same category are semi-transparent
              opacity = isActive ? 1 : Math.max(1 - Math.abs(diff) * 0.4, 0.3);
            }

            // Render all items for smooth opacity transitions! Pointer events disabled if hidden
            const pointerEventsClass = opacity === 0 ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer';

            // Shape based on type
            let shapeClass = 'rounded-xl border-blue-200 dark:border-blue-800 bg-white/40 dark:bg-slate-900/40';
            if (item.type === 'education') shapeClass = 'rounded-md border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/30';
            if (item.type === 'internship') shapeClass = 'rounded-full border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/30 px-10';
            if (item.type === 'project') shapeClass = 'rounded-none border-l-8 border-purple-500 bg-purple-50/60 dark:bg-purple-900/30';
            if (item.type === 'volunteer') shapeClass = 'rounded-2xl border-dashed border-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/30';
            if (item.type === 'skill') shapeClass = 'rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-xl rounded-br-xl border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/30';

            return (
              <motion.div
                key={item.id}
                className={`absolute w-full max-w-4xl px-6 origin-left ${isActive ? 'z-20 cursor-default pointer-events-auto' : `z-10 ${pointerEventsClass}`}`}
                initial={false}
                animate={{
                  y: yOffset,
                  x: xOffset,
                  scale,
                  opacity,
                  rotateX,
                  rotateZ
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                onClick={() => {
                  if (opacity === 0) return;
                  if (!isActive) {
                    setActiveIndex(index);
                  } else if (item.type !== 'skill') {
                    // If active, open detail modal (except for skills which don't have details)
                    setDetailItem(item);
                  }
                }}
                style={{ perspective: 1000 }}
              >
                <div className={`relative overflow-hidden backdrop-blur-md p-8 border transition-all duration-300 flex items-center gap-6 ${shapeClass} ${isActive ? 'shadow-2xl scale-[1.02]' : 'hover:border-slate-400'}`}>
                  {/* Left Side Number */}
                  <div className="text-6xl sm:text-7xl font-black text-slate-300/80 dark:text-slate-600/50 flex-shrink-0 w-20 sm:w-24 text-center select-none">
                    {String(item.categoryIndex).padStart(2, '0')}
                  </div>

                  {/* Right Side Content */}
                  <div className="flex-1 relative z-10 border-l-2 border-slate-200/50 dark:border-slate-700/50 pl-6">
                    {renderItemContent(item, lang)}
                    {isActive && item.type !== 'skill' && (
                      <div className="mt-4 text-left text-sm font-medium text-blue-500/80 dark:text-blue-400/80 animate-pulse">
                        Click to read more &rarr;
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination Indicator (Far Right) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {items.map((item, index) => {
          const isNewSection = index > 0 && item.type !== items[index - 1].type;
          
          let dotColor = 'bg-blue-600 dark:bg-blue-400';
          let inactiveColor = 'bg-blue-200 dark:bg-blue-900/50';
          let hoverColor = 'hover:bg-blue-400 dark:hover:bg-blue-300';
          
          if (item.type === 'education') { dotColor = 'bg-blue-600 dark:bg-blue-400'; inactiveColor = 'bg-blue-200 dark:bg-blue-900/50'; hoverColor = 'hover:bg-blue-400'; }
          if (item.type === 'internship') { dotColor = 'bg-indigo-600 dark:bg-indigo-400'; inactiveColor = 'bg-indigo-200 dark:bg-indigo-900/50'; hoverColor = 'hover:bg-indigo-400'; }
          if (item.type === 'project') { dotColor = 'bg-purple-600 dark:bg-purple-400'; inactiveColor = 'bg-purple-200 dark:bg-purple-900/50'; hoverColor = 'hover:bg-purple-400'; }
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
      </div>

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
  );
};

// Helper function to render different types of content ONLY main info
function renderItemContent(item: CarouselItem, lang: 'en' | 'zh') {
  if (item.type === 'education') {
    return (
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.data.institution[lang]}</h4>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mt-1">{item.data.degree[lang]}</p>
          </div>
          <div className="text-right text-sm text-slate-500 font-medium whitespace-nowrap pl-4">
            <div>{item.data.period}</div>
            <div>{item.data.location[lang]}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'internship' || item.type === 'project' || item.type === 'volunteer') {
    const isInternship = item.type === 'internship';
    const isVolunteer = item.type === 'volunteer';
    const title = isInternship ? item.data.company[lang] : item.data.name[lang];
    const roleColor = isInternship ? 'text-indigo-600 dark:text-indigo-400' : isVolunteer ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400';

    return (
      <div>
        <div className="flex justify-between items-start">
          <div className="pr-4">
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{title}</h4>
            <p className={`${roleColor} font-medium text-lg mt-2`}>{item.data.role[lang]}</p>
          </div>
          <div className="text-right text-sm text-slate-500 font-medium whitespace-nowrap pl-4">
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
        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{item.data.category[lang]}</h4>
        <div className="flex flex-wrap gap-3">
          {item.data.items[lang].map((skill: string, i: number) => (
            <span key={i} className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default Home;
