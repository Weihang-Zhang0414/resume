import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "language": "Language",
      "home": "Home",
      "admin": "Admin Dashboard",
      "education": "Education",
      "internships": "Internship Experience",
      "projects": "Research & Projects",
      "skills": "Other Skills",
      "close": "Close",
      "save": "Save Changes",
      "saving": "Saving...",
      "saved": "Saved Successfully!",
      "password_prompt": "Please enter the admin password",
      "password": "Password",
      "submit": "Submit",
      "cancel": "Cancel",
      "incorrect_password": "Incorrect password"
    }
  },
  zh: {
    translation: {
      "language": "语言",
      "home": "首页",
      "admin": "管理后台",
      "education": "教育背景",
      "internships": "实习经历",
      "projects": "科研与项目",
      "skills": "其他技能",
      "close": "关闭",
      "save": "保存修改",
      "saving": "保存中...",
      "saved": "保存成功！",
      "password_prompt": "请输入管理员密码",
      "password": "密码",
      "submit": "提交",
      "cancel": "取消",
      "incorrect_password": "密码错误"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
