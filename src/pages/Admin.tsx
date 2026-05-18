import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';

const Admin: React.FC = () => {
  const { data, loading, saveData } = usePortfolio();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('hero');

  useEffect(() => {
    if (data) {
      setFormData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  if (loading || !formData) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    const success = await saveData(formData);
    setSaving(false);
    if (success) {
      setSaveMessage(t('saved'));
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Error saving data');
    }
  };

  const updateField = (path: (string | number)[], value: any) => {
    const newData = { ...formData };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setFormData(newData);
  };

  const moveItem = (key: string, index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData[key].length - 1) return;
    
    const newArray = [...formData[key]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newArray[index];
    newArray[index] = newArray[targetIndex];
    newArray[targetIndex] = temp;
    
    updateField([key], newArray);
  };

  const renderToggle = (path: (string | number)[], label: string) => {
    let value: any = formData;
    for (const p of path) {
      if (value === undefined) break;
      value = value[p];
    }
    if (value === undefined) value = true;

    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <button
          onClick={() => updateField(path, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>
    );
  };

  const renderExperienceDirectoryBanner = (key: string, item: any, itemPath: (string | number)[]) => {
    if (!item || !item.id) return null;
    
    let folderType = 'projects';
    if (key === 'internships') folderType = 'internships';
    if (key === 'exchanges') folderType = 'exchanges';
    if (key === 'volunteers') folderType = 'volunteers';
    
    const relativeFolderPath = `public/experiences/${folderType}/${item.id}`;
    const photoCount = item.photos?.length || 0;
    const certCount = item.certificates?.length || 0;
    
    return (
      <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">📂 资源目录 / Local Directory</h4>
            <code className="text-xs text-slate-500 dark:text-slate-400 select-all block mt-1 break-all">
              {relativeFolderPath}/
            </code>
          </div>
          <div className="flex items-center gap-2">
            {renderToggle([...itemPath, 'showCerts'], '启用证书模块 / Show Certificates')}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">🖼️ 项目照片 / Photos:</span>
            <span className={`font-bold ${photoCount > 0 ? 'text-green-500 font-extrabold' : 'text-slate-400'}`}>
              {photoCount} 张/pcs (1-9)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">📜 证书 / Certificates:</span>
            <span className={`font-bold ${certCount > 0 ? 'text-green-500 font-extrabold' : 'text-slate-400'}`}>
              {certCount} 张/pcs (1-3)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">📝 Markdown 详情 / MD:</span>
            <span className={`font-bold ${item.hasMarkdown ? 'text-green-500' : 'text-red-500 font-extrabold'}`}>
              {item.hasMarkdown ? '已就绪 / Ready' : '无 / None'}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
          * 请在本地将经历照片放入 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{relativeFolderPath}/photos/</code> 目录，证书放入 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{relativeFolderPath}/certificates/</code> 目录，并在 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">details.md</code> 中编写 Markdown 详情。保存后前台会自动加载！
        </p>
      </div>
    );
  };

  const renderTextField = (path: (string | number)[], label: string, isTextarea = false) => {
    let value = formData;
    for (const p of path) {
      if (value === undefined) return null;
      value = value[p];
    }
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{label}</label>
        {isTextarea ? (
          <textarea 
            className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            rows={3}
            onChange={e => updateField(path, e.target.value)}
          />
        ) : (
          <input 
            type="text"
            className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={e => updateField(path, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderSelectField = (path: (string | number)[], label: string, options: {value: string, label: string}[]) => {
    let value = formData;
    for (const p of path) {
      if (value === undefined) return null;
      value = value[p];
    }
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">{label}</label>
        <select 
          className="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={e => updateField(path, e.target.value)}
        >
          {options.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{opt.label}</option>)}
        </select>
      </div>
    );
  };

  const renderStringArrayField = (path: (string | number)[], label: string) => {
    let array = formData;
    for (const p of path) array = array[p];

    return (
      <div className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
        <label className="block text-sm font-bold mb-3">{label}</label>
        {array.map((item: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm"
              value={item}
              rows={2}
              onChange={e => {
                const newArray = [...array];
                newArray[index] = e.target.value;
                updateField(path, newArray);
              }}
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  if (index === 0) return;
                  const newArray = [...array];
                  const temp = newArray[index];
                  newArray[index] = newArray[index - 1];
                  newArray[index - 1] = temp;
                  updateField(path, newArray);
                }}
                className={`p-1.5 rounded-lg ${index === 0 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                title="Move Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (index === array.length - 1) return;
                  const newArray = [...array];
                  const temp = newArray[index];
                  newArray[index] = newArray[index + 1];
                  newArray[index + 1] = temp;
                  updateField(path, newArray);
                }}
                className={`p-1.5 rounded-lg ${index === array.length - 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                title="Move Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const newArray = array.filter((_: any, i: number) => i !== index);
                  updateField(path, newArray);
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg h-fit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => updateField(path, [...array, ""])}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
    );
  };

  const renderArraySection = (
    key: string, 
    title: string, 
    emptyTemplate: any,
    renderItem: (itemPath: (string | number)[], index: number) => React.ReactNode
  ) => {
    const isExpanded = expandedSection === key;
    return (
      <div className="glass-card rounded-2xl overflow-hidden mb-6">
        <button 
          className="w-full p-6 flex justify-between items-center bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
          onClick={() => setExpandedSection(isExpanded ? null : key)}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {isExpanded && (
          <div className="p-6 pt-0 space-y-6 mt-4">
            {formData[key].map((_: any, index: number) => (
              <div key={index} className="relative p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/20 dark:bg-slate-900/20">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => moveItem(key, index, 'up')}
                    className={`p-2 rounded-lg ${index === 0 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="Move Up"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => moveItem(key, index, 'down')}
                    className={`p-2 rounded-lg ${index === formData[key].length - 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="Move Down"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const newArray = formData[key].filter((_: any, i: number) => i !== index);
                      updateField([key], newArray);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="pr-32">
                  {renderItem([key, index], index)}
                </div>
              </div>
            ))}
            <button
              onClick={() => updateField([key], [...formData[key], JSON.parse(JSON.stringify(emptyTemplate))])}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex justify-center items-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-500 transition-colors font-medium"
            >
              <Plus /> Add New Entry to {title}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 pt-10 px-4 md:px-0 max-w-4xl mx-auto h-full overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-700 pb-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-50 p-4 rounded-b-2xl">
        <h1 className="text-3xl font-bold">{t('admin')}</h1>
        <div className="flex items-center gap-4">
          {saveMessage && <span className="text-green-500 font-medium">{saveMessage}</span>}
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('home')}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 font-bold"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Global Settings Section */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <button 
            className="w-full p-6 flex justify-between items-center bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
            onClick={() => setExpandedSection(expandedSection === 'settings' ? null : 'settings')}
          >
            <h2 className="text-xl font-bold">Global Settings (全局设置)</h2>
            {expandedSection === 'settings' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSection === 'settings' && (
            <div className="p-6 grid md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">Sound Effects (音效)</h3>
                {formData.settings && renderSelectField(['settings', 'cardSound'], 'Card Flip Sound (卡片翻页)', [
                  { value: 'none', label: '🔇 Mute (静音)' },
                  { value: 'wood', label: '🪵 Wood (木质)' },
                  { value: 'clock', label: '⏱️ Clock / Mechanical (机械)' },
                  { value: 'typewriter', label: '⌨️ Typewriter (打字机)' },
                  { value: 'paper', label: '📄 Paper (纸张摩擦)' },
                  { value: 'water', label: '💧 Water (水滴)' },
                  { value: 'bubble', label: '🫧 Bubble (泡泡)' },
                  { value: 'click', label: '🖱️ Light Click (轻巧按键)' },
                  { value: 'scifi', label: '🛸 Sci-Fi (科幻)' },
                  { value: 'chime', label: '🔔 Chime (轻灵风铃)' }
                ])}
                {formData.settings && renderSelectField(['settings', 'sectionSound'], 'Section Transition Sound (板块切换)', [
                  { value: 'none', label: '🔇 Mute (静音)' },
                  { value: 'wood', label: '🪵 Wood (木质)' },
                  { value: 'clock', label: '⏱️ Clock / Mechanical (机械)' },
                  { value: 'typewriter', label: '⌨️ Typewriter (打字机)' },
                  { value: 'paper', label: '📄 Paper (纸张摩擦)' },
                  { value: 'water', label: '💧 Water (水滴)' },
                  { value: 'bubble', label: '🫧 Bubble (泡泡)' },
                  { value: 'click', label: '🖱️ Light Click (轻巧按键)' },
                  { value: 'scifi', label: '🛸 Sci-Fi (科幻)' },
                  { value: 'chime', label: '🔔 Chime (轻灵风铃)' }
                ])}
              </div>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          <button 
            className="w-full p-6 flex justify-between items-center bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
            onClick={() => setExpandedSection(expandedSection === 'hero' ? null : 'hero')}
          >
            <h2 className="text-xl font-bold">Hero Profile</h2>
            {expandedSection === 'hero' ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSection === 'hero' && (
            <div className="p-6 grid md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-4">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-2">English</h3>
                {renderTextField(['hero', 'name', 'en'], 'Name')}
                {renderTextField(['hero', 'role', 'en'], 'Role')}
                {renderTextField(['hero', 'intro', 'en'], 'Intro', true)}
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-700 pb-2">Chinese (中文)</h3>
                {renderTextField(['hero', 'name', 'zh'], '姓名')}
                {renderTextField(['hero', 'role', 'zh'], '角色')}
                {renderTextField(['hero', 'intro', 'zh'], '简介', true)}
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                {renderTextField(['hero', 'email'], 'Email')}
                {renderTextField(['hero', 'phone'], 'Phone')}
                {renderTextField(['hero', 'wechat'], 'WeChat')}
                {renderTextField(['hero', 'instagram'], 'Instagram')}
                {renderTextField(['hero', 'avatarUrl'], 'Avatar URL / Path')}
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {renderToggle(['hero', 'visibility', 'email'], 'Show Email')}
                  {renderToggle(['hero', 'visibility', 'phone'], 'Show Phone')}
                  {renderToggle(['hero', 'visibility', 'wechat'], 'Show WeChat')}
                  {renderToggle(['hero', 'visibility', 'instagram'], 'Show Insta')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        {renderArraySection(
          'education', 
          'Education 背景',
          { id: `edu-${Date.now()}`, institution: { en: '', zh: '' }, degree: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, gpa: { en: '', zh: '' }, courses: { en: '', zh: '' }, scholarships: { en: [], zh: [] }, awards: { en: [], zh: [] } },
          (path) => (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                  {renderTextField([...path, 'institution', 'en'], 'Institution')}
                  {renderTextField([...path, 'degree', 'en'], 'Degree')}
                  {renderTextField([...path, 'location', 'en'], 'Location')}
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                  {renderTextField([...path, 'institution', 'zh'], '学校名称')}
                  {renderTextField([...path, 'degree', 'zh'], '学位/专业')}
                  {renderTextField([...path, 'location', 'zh'], '地点')}
                </div>
                <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {renderTextField([...path, 'period'], 'Period (e.g. 2023.09 - 2027.06)')}
                </div>
              </div>

              {/* GPA */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">📊 Academic Performance (GPA)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {renderTextField([...path, 'gpa', 'en'], 'GPA (EN)', true)}
                  {renderTextField([...path, 'gpa', 'zh'], '学业绩点 (ZH)', true)}
                </div>
              </div>

              {/* Core Courses */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10">
                <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">📚 Core Courses & Grades</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {renderTextField([...path, 'courses', 'en'], 'Courses (EN)', true)}
                  {renderTextField([...path, 'courses', 'zh'], '核心课程 (ZH)', true)}
                </div>
              </div>

              {/* Scholarships */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
                <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-3">🏅 Scholarships</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {renderStringArrayField([...path, 'scholarships', 'en'], 'Scholarships (EN)')}
                  {renderStringArrayField([...path, 'scholarships', 'zh'], '奖学金 (ZH)')}
                </div>
              </div>

              {/* Awards */}
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/10">
                <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">🏆 Competitions & Awards</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {renderStringArrayField([...path, 'awards', 'en'], 'Awards (EN)')}
                  {renderStringArrayField([...path, 'awards', 'zh'], '竞赛获奖 (ZH)')}
                </div>
              </div>
            </div>
          )
        )}


        {/* Internships */}
        {renderArraySection(
          'internships', 
          'Internship Experience 实习经历',
          { id: `int-${Date.now()}`, company: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] }, keywords: { en: [], zh: [] } },
          (path, index) => {
            const item = formData.internships[index];
            return (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                    {renderTextField([...path, 'company', 'en'], 'Company')}
                    {renderTextField([...path, 'role', 'en'], 'Role')}
                    {renderTextField([...path, 'location', 'en'], 'Location')}
                    {renderStringArrayField([...path, 'keywords', 'en'], 'Keywords')}
                    {renderStringArrayField([...path, 'details', 'en'], 'Bullet Points')}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                    {renderTextField([...path, 'company', 'zh'], '公司名称')}
                    {renderTextField([...path, 'role', 'zh'], '职位')}
                    {renderTextField([...path, 'location', 'zh'], '地点')}
                    {renderStringArrayField([...path, 'keywords', 'zh'], '关键字')}
                    {renderStringArrayField([...path, 'details', 'zh'], '详细描述')}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  {renderTextField([...path, 'period'], 'Period (e.g. 2025.07 - 2025.08)')}
                </div>
                {renderExperienceDirectoryBanner('internships', item, path)}
              </div>
            );
          }
        )}

        {/* Projects */}
        {renderArraySection(
          'projects', 
          'Research & Projects 科研经历',
          { id: `proj-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] }, keywords: { en: [], zh: [] } },
          (path, index) => {
            const item = formData.projects[index];
            return (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                    {renderTextField([...path, 'name', 'en'], 'Project Name')}
                    {renderTextField([...path, 'role', 'en'], 'Role/Title')}
                    {renderTextField([...path, 'location', 'en'], 'Location')}
                    {renderStringArrayField([...path, 'keywords', 'en'], 'Keywords')}
                    {renderStringArrayField([...path, 'details', 'en'], 'Bullet Points')}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                    {renderTextField([...path, 'name', 'zh'], '项目名称')}
                    {renderTextField([...path, 'role', 'zh'], '角色')}
                    {renderTextField([...path, 'location', 'zh'], '地点')}
                    {renderStringArrayField([...path, 'keywords', 'zh'], '关键字')}
                    {renderStringArrayField([...path, 'details', 'zh'], '详细描述')}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  {renderTextField([...path, 'period'], 'Period')}
                </div>
                {renderExperienceDirectoryBanner('projects', item, path)}
              </div>
            );
          }
        )}

        {/* Exchanges */}
        {renderArraySection(
          'exchanges', 
          'Exchange Experience 海外交流经历',
          { id: `exc-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] } },
          (path, index) => {
            const item = formData.exchanges[index];
            return (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                    {renderTextField([...path, 'name', 'en'], 'Program Name')}
                    {renderTextField([...path, 'role', 'en'], 'Role')}
                    {renderTextField([...path, 'location', 'en'], 'Location')}
                    {renderStringArrayField([...path, 'details', 'en'], 'Bullet Points')}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                    {renderTextField([...path, 'name', 'zh'], '项目名称')}
                    {renderTextField([...path, 'role', 'zh'], '角色')}
                    {renderTextField([...path, 'location', 'zh'], '地点')}
                    {renderStringArrayField([...path, 'details', 'zh'], '详细描述')}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  {renderTextField([...path, 'period'], 'Period')}
                </div>
                {renderExperienceDirectoryBanner('exchanges', item, path)}
              </div>
            );
          }
        )}

        {/* Volunteers */}
        {renderArraySection(
          'volunteers', 
          'Volunteer Experience 志愿服务经历',
          { id: `vol-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] } },
          (path, index) => {
            const item = formData.volunteers[index];
            return (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                    {renderTextField([...path, 'name', 'en'], 'Activity Name')}
                    {renderTextField([...path, 'role', 'en'], 'Role')}
                    {renderTextField([...path, 'location', 'en'], 'Location')}
                    {renderStringArrayField([...path, 'details', 'en'], 'Bullet Points')}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                    {renderTextField([...path, 'name', 'zh'], '活动名称')}
                    {renderTextField([...path, 'role', 'zh'], '角色/职责')}
                    {renderTextField([...path, 'location', 'zh'], '地点')}
                    {renderStringArrayField([...path, 'details', 'zh'], '详细描述')}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  {renderTextField([...path, 'period'], 'Period')}
                </div>
                {renderExperienceDirectoryBanner('volunteers', item, path)}
              </div>
            );
          }
        )}

        {/* Skills */}
        {renderArraySection(
          'skills', 
          'Skills 技能',
          { category: { en: '', zh: '' }, items: { en: [], zh: [] } },
          (path) => (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">English</h3>
                {renderTextField([...path, 'category', 'en'], 'Category Name')}
                {renderStringArrayField([...path, 'items', 'en'], 'Skills List')}
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Chinese (中文)</h3>
                {renderTextField([...path, 'category', 'zh'], '分类名称')}
                {renderStringArrayField([...path, 'items', 'zh'], '技能列表')}
              </div>
            </div>
          )
        )}

      </div>
    </motion.div>
  );
};

export default Admin;
