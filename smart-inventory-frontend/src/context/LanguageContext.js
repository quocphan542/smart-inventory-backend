import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Lấy ngôn ngữ từ localStorage nếu có, mặc định là tiếng Việt
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'vi';
    });

    // Khi ngôn ngữ thay đổi, lưu lại vào localStorage
    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
    };

    // Hàm lấy chữ từ từ điển
    // Ví dụ: t('menu.dashboard')
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Nếu không tìm thấy, trả về chính cái key đó
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    return useContext(LanguageContext);
};