import React, { useEffect, useState, useCallback, useMemo } from 'react';
import productService from '../../services/productService';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { Search, Plus, Edit3, Trash2, Package, ShieldAlert } from 'lucide-react';
import '../../styles/ProductList.css'; // Sử dụng CSS mới

const Rivet = () => <div className="rivet"></div>;

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

export const ProductList = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const isAdmin = user?.roleName === 'ADMIN';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (err) {
            setError(t('product.loading_error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return products;

        const normalizedSearchTerm = removeAccents(term).toLowerCase();

        return products.filter(p => {
            const nameMatch = p.productName ? removeAccents(p.productName).toLowerCase().includes(normalizedSearchTerm) : false;
            const skuMatch = p.sku ? removeAccents(p.sku).toLowerCase().includes(normalizedSearchTerm) : false;
            return nameMatch || skuMatch;
        });
    }, [products, searchTerm]);

    const handleOpenFormModalForCreate = () => {
        setProductToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenFormModalForEdit = (product) => {
        setProductToEdit(product);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setProductToEdit(null);
    };

    const handleSave = () => {
        handleCloseFormModal();
        fetchProducts();
    };

    const handleOpenConfirmModal = (product) => {
        setProductToDelete(product);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await productService.delete(productToDelete.id);
            fetchProducts();
        } catch (err) {
            setError(t('product.delete_error'));
        } finally {
            handleCloseConfirmModal();
        }
    };

    return (
        <div className="product-chassis">
            <h1 className="console-title-stamp">{t('product.title')}</h1>
            
            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="action-bay">
                <div className="search-input-recess">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('product.search_ph')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin && (
                    <button className="tactical-btn-accent" onClick={handleOpenFormModalForCreate}>
                        <Plus size={18} />
                        {t('product.add_new')}
                    </button>
                )}
            </div>

            <div className="product-grid">
                {loading ? (
                    <div className="loading-state">{t('product.loading')}</div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            <div className="product-image-bay">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.productName} className="product-image" />
                                ) : (
                                    <Package size={48} className="image-placeholder" />
                                )}
                            </div>
                            <div className="product-info-plate">
                                <div className="product-header">
                                    <span className="sku-stamp">{product.sku}</span>
                                    <h2 className="product-name">{product.productName}</h2>
                                </div>
                                <div className="spec-well">
                                    <div className="spec-item">
                                        <span className="spec-label">{t('product.col_cat')}</span>
                                        <span className="spec-value">{product.categoryName || 'N/A'}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">{t('product.col_unit')}</span>
                                        <span className="spec-value">{product.baseUnitName || 'N/A'}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">{t('product.min_stock')}</span>
                                        <span className="spec-value">{product.minimumStock || 0}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">{t('product.base_price')}</span>
                                        <span className="spec-value price">${(product.basePrice || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="product-footer">
                                    <div className="status-module">
                                        <LedIndicator active={product.isActive} />
                                        <span className="toggle-label" style={{fontSize: '0.7rem'}}>{product.isActive ? t('product.active') : t('product.inactive')}</span>
                                    </div>
                                    {isAdmin && (
                                        <div className="action-buttons">
                                            <button className="icon-btn" title={t('common.edit')} onClick={() => handleOpenFormModalForEdit(product)}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="icon-btn" title={t('common.delete')} onClick={() => handleOpenConfirmModal(product)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                        {t('product.no_data')}
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isFormModalOpen} 
                onClose={handleCloseFormModal} 
                title={productToEdit ? t('product.edit_title') : t('product.add_title')}
            >
                <ProductForm 
                    onSave={handleSave} 
                    productToEdit={productToEdit} 
                />
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmDelete}
                title={t('product.confirm_del_title')}
                message={`${t('product.confirm_del_msg')} "${productToDelete?.productName}"?`}
            />
        </div>
    );
};