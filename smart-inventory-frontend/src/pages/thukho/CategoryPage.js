import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, FolderTree, Edit3, Trash2, Plus, ShieldAlert } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/CategoryPage.css'; // SỬ DỤNG CSS MỚI

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const TacticalToggle = ({ isActive, onToggle, disabled }) => (
    <button 
        className={`tactical-toggle ${isActive ? 'active' : ''}`} 
        onClick={onToggle}
        disabled={disabled}
        type="button"
    >
        <div className="toggle-nub"></div>
    </button>
);

const LedIndicator = ({ active }) => (
    <div className={`led-bezel ${active ? 'active' : ''}`}>
        <div className="led-light"></div>
    </div>
);

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ĐỔI TÊN COMPONENT
const CategoryPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Data
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            setError('Failed to load category taxonomy.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Filtering
    const filteredCategories = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return categories;

        const normalizedSearchTerm = removeAccents(term).toLowerCase();

        return categories.filter(cat => {
            const normalizedCatName = cat.categoryName ? removeAccents(cat.categoryName).toLowerCase() : '';
            const nameMatch = normalizedCatName.includes(normalizedSearchTerm);
            const idMatch = cat.id.toString().includes(term);
            return nameMatch || idMatch;
        });
    }, [categories, searchTerm]);

    return (
        <div className="category-chassis">
            <h1 className="console-title-stamp">{t('category.title')}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="search-bay">
                <div className="search-input-recess">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('category.search_ph')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                    <ShieldAlert size={20}/> <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700}}>{t('category.read_only')}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">{t('category.loading')}</div>
            ) : (
                <div className="category-grid">
                    {filteredCategories.map(cat => (
                        <div key={cat.id} className="category-card">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            <div className="vents-container">
                                <Vent /><Vent /><Vent />
                            </div>

                            <span className="cat-lcd-badge">ID: {cat.id.toString().padStart(4, '0')}</span>
                            
                            <h2 className="cat-name-stamp">{cat.categoryName}</h2>
                            
                            <div className="cat-desc-well">
                                {cat.description || <span style={{opacity: 0.5, fontStyle: 'italic'}}>{t('category.no_desc')}</span>}
                            </div>

                            <div className="cat-footer">
                                <div className="status-module">
                                    <LedIndicator active={cat.isActive} />
                                    <TacticalToggle 
                                        isActive={cat.isActive} 
                                        onToggle={() => {}}
                                        disabled={true}
                                    />
                                </div>
                                <div className="action-buttons">
                                    <button className="icon-btn locked" title="Locked">
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="icon-btn locked" title="Locked">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredCategories.length === 0 && (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                            {t('category.no_cats')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;