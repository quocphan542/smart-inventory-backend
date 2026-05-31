import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, Scan, Package, ShieldCheck, Box, Tag, Zap } from 'lucide-react';
import inventoryStockService from '../../services/inventoryStockService';
import warehouseService from '../../services/warehouseService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/StockLookupPage.css'; // SỬ DỤNG CSS MỚI

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

// ĐỔI TÊN COMPONENT
const StockLookupPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // Data States
    const [allStocks, setAllStocks] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const fetchData = useCallback(async () => {
        setIsScanning(true);
        try {
            const [stockData, whData, catData] = await Promise.all([
                inventoryStockService.getAll(),
                warehouseService.getAll(),
                categoryService.getAll()
            ]);
            setAllStocks(stockData || []);
            setWarehouses(whData ? whData.filter(w => w.isActive) : []);
            setCategories(catData ? catData.filter(c => c.isActive) : []);
        } catch (err) {
            setError(t('stock.err_connect') || 'Failed to connect to radar telemetry.');
        } finally {
            setIsScanning(false);
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleScanRadar = (e) => {
        e.preventDefault();
        fetchData();
    };

    // Filtering Logic
    const filteredStocks = useMemo(() => {
        return allStocks.filter(stock => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (stock.productName && stock.productName.toLowerCase().includes(searchStr)) || 
                (stock.sku && stock.sku.toLowerCase().includes(searchStr)) ||
                (stock.batchNumber && stock.batchNumber.toLowerCase().includes(searchStr));
                
            const matchesWarehouse = selectedWarehouseId === '' || (stock.warehouseId != null && stock.warehouseId.toString() === selectedWarehouseId);
            
            const matchesCategory = selectedCategoryId === '' || (stock.categoryId != null && stock.categoryId.toString() === selectedCategoryId);

            return matchesSearch && matchesWarehouse && matchesCategory;
        });
    }, [allStocks, searchTerm, selectedWarehouseId, selectedCategoryId]);

    // Format Coordinate
    const formatCoordinate = (stock) => {
        if (!stock) return 'N/A';
        return `${stock.zoneCode || '??'}-${stock.shelfCode || '??'}-${stock.binCode || '??'}`;
    };

    return (
        <div className="locator-chassis">
            <h1 className="console-title-stamp">{t('stock.title') || 'REAL-TIME INVENTORY RADAR'}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* --- Telemetry Search Bay --- */}
            <form className="mech-plate" onSubmit={handleScanRadar} style={{paddingBottom: '2rem'}}>
                <Rivet /><Rivet /><Rivet /><Rivet />
                <div className="plate-header">
                    <Zap className="plate-icon" size={20} />
                    <span className="plate-title">{t('stock.search_plate') || 'MULTI-DIMENSIONAL SCANNER'}</span>
                </div>

                <div className="search-grid">
                    <div className="input-group-recessed">
                        <label>{t('stock.search_label') || 'SKU / PRODUCT / BATCH'}</label>
                        <input 
                            type="text" 
                            className="input-mono"
                            placeholder="e.g. CPU-001" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('stock.warehouse_label') || 'FACILITY FILTER'}</label>
                        <select value={selectedWarehouseId} onChange={(e) => setSelectedWarehouseId(e.target.value)}>
                            <option value="">{t('stock.all_facilities') || '-- ALL FACILITIES --'}</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                        </select>
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('stock.category_label') || 'CATEGORY FILTER'}</label>
                        <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                            <option value="">{t('stock.all_categories') || '-- ALL CATEGORIES --'}</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="tactical-btn-accent" disabled={isScanning}>
                        <Scan size={18} className={isScanning ? "animate-spin" : ""} />
                        <span>{isScanning ? (t('stock.scanning') || 'SCANNING...') : (t('stock.btn_scan') || 'SCAN RADAR')}</span>
                    </button>
                </div>
            </form>

            {/* --- The Physical Locator Matrix --- */}
            <div className="mech-plate" style={{padding: '1rem'}}>
                <Rivet /><Rivet /><Rivet /><Rivet />
                <div className="vents-container" style={{top: '1rem'}}><Vent /><Vent /><Vent /></div>
                
                <div className="plate-header" style={{margin: '0.5rem', marginBottom: '1.5rem', borderBottom: 'none'}}>
                    <MapPin className="plate-icon" size={20} />
                    <span className="plate-title">{t('stock.matrix_title') || 'PHYSICAL LOCATOR MATRIX'}</span>
                    <span className="matrix-count-badge">{filteredStocks.length} {t('stock.results') || 'ITEMS DETECTED'}</span>
                </div>

                <div className="matrix-table-well">
                    <table className="matrix-table">
                        <thead>
                            <tr>
                                <th>{t('stock.col_sku') || 'IDENTITY'}</th>
                                <th>{t('stock.col_name') || 'CLASSIFICATION'}</th>
                                <th>{t('stock.col_coord') || 'COORDINATE (LOC)'}</th>
                                <th>{t('stock.col_batch') || 'BATCH_NO'}</th>
                                <th>{t('stock.col_expiry') || 'EXPIRY'}</th>
                                <th style={{textAlign: 'right'}}>{t('stock.col_qty') || 'QUANTITY'}</th>
                                {/* Tinh giản: Ẩn cột giá trị tài sản đối với Thủ kho */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '3rem', opacity: 0.5}}>
                                        {t('stock.init_radar') || 'INITIALIZING RADAR...'}
                                    </td>
                                </tr>
                            ) : filteredStocks.length > 0 ? (
                                filteredStocks.map(stock => {
                                    const isLowStock = stock.quantity <= 10;
                                    const isExpiringSoon = stock.expiryDate && (new Date(stock.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) < 30;

                                    return (
                                        <tr key={`${stock.productId}-${stock.warehouseId}-${stock.locationId}-${stock.batchNumber}`}>
                                            <td>
                                                <span className="badge-sku">{stock.sku || 'N/A'}</span>
                                            </td>
                                            <td className="data-stamp">
                                                {stock.productName}
                                                <div style={{fontSize: '0.65rem', color: 'var(--text-secondary)'}}>
                                                    <Tag size={10} style={{display:'inline', marginRight:'2px'}}/> {stock.categoryName || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge-coord">{formatCoordinate(stock)}</span>
                                                <div style={{fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                                                    {stock.warehouseName || `WH-${stock.warehouseId}`}
                                                </div>
                                            </td>
                                            <td className="data-stamp">{stock.batchNumber}</td>
                                            <td>
                                                <div className="expiry-status">
                                                    <div className={`led-dot ${isExpiringSoon ? 'danger' : (stock.expiryDate ? 'safe' : '')}`}></div>
                                                    <span className="data-stamp">{stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString() : 'NO EXP'}</span>
                                                </div>
                                            </td>
                                            <td style={{textAlign: 'right'}}>
                                                <div className={`lcd-display lcd-qty ${isLowStock ? 'low-stock' : ''}`}>
                                                    {stock.quantity}
                                                </div>
                                            </td>
                                            {/* Tinh giản: Ẩn hiển thị giá trị tài sản */}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                                        {t('stock.no_data') || 'NO SIGNATURES DETECTED IN THIS SECTOR.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tinh giản: Ẩn phần tổng hợp tài sản */}
            </div>
        </div>
    );
};

export default StockLookupPage;