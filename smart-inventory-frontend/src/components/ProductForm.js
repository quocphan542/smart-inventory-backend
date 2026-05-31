import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import unitService from '../services/unitService';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Form.css';

const ProductForm = ({ onSave, productToEdit }) => {
    const { t } = useLanguage();
    const [sku, setSku] = useState('');
    const [productName, setProductName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [minimumStock, setMinimumStock] = useState(0);
    const [basePrice, setBasePrice] = useState(0);
    const [categoryId, setCategoryId] = useState('');
    const [baseUnitId, setBaseUnitId] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, uns] = await Promise.all([
                    categoryService.getAll(),
                    unitService.getAll()
                ]);
                setCategories(cats);
                setUnits(uns);
            } catch (err) {
                setError(t('product.loading_error'));
            }
        };
        fetchData();

        if (productToEdit) {
            setSku(productToEdit.sku || '');
            setProductName(productToEdit.productName || '');
            setImageUrl(productToEdit.imageUrl || '');
            setMinimumStock(productToEdit.minimumStock || 0);
            setBasePrice(productToEdit.basePrice || 0);
            setCategoryId(productToEdit.categoryId || '');
            setBaseUnitId(productToEdit.baseUnitId || '');
            setIsActive(productToEdit.isActive !== null ? productToEdit.isActive : true);
        }
    }, [productToEdit, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sku || !productName || !categoryId || !baseUnitId) {
            setError(t('product.req_fields'));
            return;
        }

        setLoading(true);
        setError('');

        const productData = { 
            sku, 
            productName, 
            imageUrl,
            minimumStock: parseInt(minimumStock) || 0,
            basePrice: parseFloat(basePrice) || 0,
            categoryId: parseInt(categoryId), 
            baseUnitId: parseInt(baseUnitId),
            isActive
        };

        try {
            if (productToEdit) {
                await productService.update(productToEdit.id, productData);
            } else {
                await productService.create(productData);
            }
            onSave();
        } catch (err) {
            setError(t('product.save_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            {error && <div className="form-error-banner">{error}</div>}
            
            <div className="form-group">
                <label htmlFor="sku">{t('product.col_sku')}</label>
                <input id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} disabled={loading} placeholder="e.g: SP001" />
            </div>

            <div className="form-group">
                <label htmlFor="productName">{t('product.col_name')}</label>
                <input id="productName" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} disabled={loading} placeholder="e.g: Mechanical Keyboard" />
            </div>

            <div className="form-group">
                <label htmlFor="imageUrl">URL</label>
                <input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={loading} placeholder="https://example.com/image.png" />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                    <label htmlFor="minimumStock">{t('product.min_stock')}</label>
                    <input id="minimumStock" type="number" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                    <label htmlFor="basePrice">{t('product.base_price')}</label>
                    <input id="basePrice" type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} disabled={loading} />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="category">{t('product.col_cat')}</label>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loading}>
                    <option value="">-- Select --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="unit">{t('product.col_unit')}</label>
                <select id="unit" value={baseUnitId} onChange={(e) => setBaseUnitId(e.target.value)} disabled={loading}>
                    <option value="">-- Select --</option>
                    {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.unitName}</option>
                    ))}
                </select>
            </div>

            <div className="form-group form-group-inline">
                <label htmlFor="isActive">{t('product.active')}</label>
                <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={loading} />
            </div>

            <div className="form-actions">
                <button type="submit" className="form-submit-btn" disabled={loading}>
                    {loading ? '...' : t('common.confirm')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;