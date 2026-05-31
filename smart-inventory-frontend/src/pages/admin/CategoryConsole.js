import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, FolderTree, Edit3, Trash2, Plus, ShieldAlert } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/CategoryConsole.css';

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

// Helper function to remove accents from a string
const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const CategoryConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form Data
    const [currentCategory, setCurrentCategory] = useState(null); 
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [catIsActive, setCatIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

    // Handlers
    const handleToggleStatus = async (id) => {
        if (!isAdmin) return;
        try {
            await categoryService.toggleStatus(id);
            setCategories(categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        } catch (err) {
            setError('Failed to toggle status.');
        }
    };

    const openCreateModal = () => {
        setCurrentCategory(null);
        setCatName('');
        setCatDesc('');
        setCatIsActive(true);
        setIsFormModalOpen(true);
    };

    const openEditModal = (cat) => {
        setCurrentCategory(cat);
        setCatName(cat.categoryName);
        setCatDesc(cat.description || '');
        setCatIsActive(cat.isActive);
        setIsFormModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!catName.trim()) {
            setError('Category Name is required.');
            return;
        }

        setIsSaving(true);
        try {
            if (currentCategory) {
                await categoryService.update(currentCategory.id, {
                    categoryName: catName,
                    description: catDesc,
                    isActive: catIsActive
                });
            } else {
                await categoryService.create({
                    categoryName: catName,
                    description: catDesc,
                    isActive: catIsActive
                });
            }
            setIsFormModalOpen(false);
            fetchCategories();
        } catch (err) {
            setError('Failed to save category parameters.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = (cat) => {
        setCurrentCategory(cat);
        setIsConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!currentCategory) return;
        try {
            await categoryService.delete(currentCategory.id);
            fetchCategories();
        } catch (err) {
            setError('Cannot delete category. It might be referenced by active products.');
        } finally {
            setIsConfirmModalOpen(false);
            setCurrentCategory(null);
        }
    };

    return (
        <div className="category-chassis">
            <h1 className="console-title-stamp">{t('category.title')}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* --- Taxonomy Search Bay --- */}
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
                {isAdmin ? (
                    <button className="tactical-btn-accent" onClick={openCreateModal}>
                        <Plus size={18} />
                        {t('category.btn_init_cat')}
                    </button>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                        <ShieldAlert size={20}/> <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700}}>{t('category.read_only')}</span>
                    </div>
                )}
            </div>

            {/* --- Category Module Grid --- */}
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
                                        onToggle={() => handleToggleStatus(cat.id)}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="action-buttons">
                                    <button 
                                        className={`icon-btn ${!isAdmin ? 'locked' : ''}`} 
                                        onClick={() => isAdmin && openEditModal(cat)}
                                        title={isAdmin ? t('category.edit_title') : "Locked"}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button 
                                        className={`icon-btn ${!isAdmin ? 'locked' : ''}`} 
                                        onClick={() => isAdmin && confirmDelete(cat)}
                                        title={isAdmin ? t('category.delete_title') : "Locked"}
                                    >
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

            {/* --- Tactile Entry Module --- */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={t('category.modal_title')}>
                <form onSubmit={handleSave} style={{padding: '1rem 0'}}>
                    <div className="input-group-recessed">
                        <label>{t('category.cat_name')}</label>
                        <input 
                            type="text" 
                            className="input-uppercase" 
                            value={catName} 
                            onChange={(e) => setCatName(e.target.value)} 
                            placeholder={t('category.cat_name_ph')}
                            required
                            disabled={isSaving}
                        />
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('category.desc_param')}</label>
                        <textarea 
                            value={catDesc} 
                            onChange={(e) => setCatDesc(e.target.value)} 
                            placeholder={t('category.desc_param_ph')}
                            rows={3}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="input-group-recessed" style={{flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
                        <label>{t('category.status')}</label>
                        <TacticalToggle 
                            isActive={catIsActive} 
                            onToggle={() => setCatIsActive(!catIsActive)}
                            disabled={isSaving}
                        />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                        <button type="submit" className="tactical-btn-accent" disabled={isSaving}>
                            <FolderTree size={16} /> 
                            {currentCategory ? t('category.btn_update') : t('category.btn_init_cat')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- Confirm Delete Modal --- */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={t('category.confirm_del_title')}
                message={`${t('category.confirm_del_msg')} "${currentCategory?.categoryName}".`}
            />
        </div>
    );
};

export default CategoryConsole;