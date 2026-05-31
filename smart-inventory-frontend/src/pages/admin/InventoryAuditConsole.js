import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Scale, Calendar, ShieldCheck, Trash2, ShieldAlert, CheckCircle2, Layers, Plus, Save, FileWarning } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import inventoryStockService from '../../services/inventoryStockService';
import adjustmentService from '../../services/adjustmentService';
import { useAuth } from '../../hooks/useAuth';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/InventoryAuditConsole.css';

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const InventoryAuditConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // Master Data States
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form Master States
    const [adjustmentCode, setAdjustmentCode] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [adjustedDate, setAdjustedDate] = useState(new Date().toISOString().slice(0, 16));
    const [reason, setReason] = useState('');

    // Form Details State (Line Items)
    const [items, setItems] = useState([]);

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchMasterData = useCallback(async () => {
        try {
            setLoadingData(true);
            const [whData, prodData, stockData] = await Promise.all([
                warehouseService.getAll(),
                productService.getAll(),
                inventoryStockService.getAll()
            ]);
            setWarehouses(whData.filter(w => w.isActive));
            setProducts(prodData.filter(p => p.isActive));
            setStocks(stockData);
            
            const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setAdjustmentCode(`ADJ-${randomId}`);
        } catch (err) {
            setError(t('adj.err_connect') || 'Failed to connect to core database.');
        } finally {
            setLoadingData(false);
        }
    }, [t]);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);

    const handleAddItem = () => {
        setItems([
            ...items, 
            { 
                id: Date.now(), 
                productId: '', 
                batchNumber: '',
                systemQty: 0,
                actualQty: 0,
            }
        ]);
    };

    const handleRemoveItem = (idToRemove) => {
        setItems(items.filter(item => item.id !== idToRemove));
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                if (field === 'productId' || field === 'batchNumber') {
                    const stock = stocks.find(s => 
                        s.productId.toString() === updatedItem.productId.toString() && 
                        s.warehouseId.toString() === warehouseId.toString() &&
                        s.batchNumber === updatedItem.batchNumber
                    );
                    updatedItem.systemQty = stock ? stock.quantity : 0;
                    updatedItem.actualQty = stock ? stock.quantity : 0; // Default actual to system
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const getAvailableBatches = (productId) => {
        if (!productId || !warehouseId) return [];
        return stocks.filter(s => 
            s.productId.toString() === productId.toString() && 
            s.warehouseId.toString() === warehouseId.toString()
        );
    };

    const { totalSurplus, totalMissing } = useMemo(() => {
        let surplus = 0;
        let missing = 0;
        items.forEach(item => {
            const diff = (parseFloat(item.actualQty) || 0) - (parseFloat(item.systemQty) || 0);
            if (diff > 0) surplus += diff;
            else missing += Math.abs(diff);
        });
        return { totalSurplus: surplus, totalMissing: missing };
    }, [items]);

    const validateForm = () => {
        if (!warehouseId || !adjustedDate || !reason) {
            setError(t('adj.err_master') || 'Warehouse, Date, and Reason are required.');
            return false;
        }
        if (items.length === 0) {
            setError(t('adj.err_empty') || 'Audit cannot be empty. Add items to the grid.');
            return false;
        }
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.productId || !it.batchNumber) {
                setError(`${t('adj.err_row') || 'Row'} #${i+1}: ${t('adj.err_no_prod_batch') || 'Product and Batch must be selected.'}`);
                return false;
            }
        }
        return true;
    };

    const confirmSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (validateForm()) {
            setIsConfirmOpen(true);
        }
    };

    const handleFinalizeAdjustment = async () => {
        setIsConfirmOpen(false);
        setIsSaving(true);
        try {
            const payload = {
                adjustmentCode,
                warehouseId: parseInt(warehouseId),
                adjustedDate,
                reason,
                details: items.map(it => ({
                    productId: parseInt(it.productId),
                    batchNumber: it.batchNumber,
                    systemQty: parseFloat(it.systemQty),
                    actualQty: parseFloat(it.actualQty),
                    diffQty: parseFloat(it.actualQty) - parseFloat(it.systemQty)
                }))
            };

            await adjustmentService.create(payload);
            setSuccessMsg(`${t('adj.success') || 'SUCCESS: Reconciliation protocol'} [${adjustmentCode}] ${t('adj.success2') || 'has been locked and submitted.'}`);
            
            // Reset form
            const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setAdjustmentCode(`ADJ-${randomId}`);
            setItems([]);
            setReason('');
            fetchMasterData(); // Refetch stock levels
        } catch (err) {
            setError(err.message || t('adj.err_fatal') || 'Fatal error during reconciliation.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingData) return <div className="audit-chassis"><div className="console-title-stamp">{t('adj.loading') || 'INITIALIZING AUDIT TERMINAL...'}</div></div>;

    return (
        <div className="audit-chassis">
            <h1 className="console-title-stamp">{t('adj.title') || 'PHYSICAL AUDIT & RECONCILIATION TERMINAL'}</h1>

            {error && <div className="error-banner mb-4"><ShieldAlert size={18} style={{display:'inline', marginRight:'8px'}}/> {error}</div>}
            {successMsg && <div className="error-banner mb-4" style={{backgroundColor: '#064e3b', color: '#10b981', borderColor: '#047857'}}><CheckCircle2 size={18} style={{display:'inline', marginRight:'8px'}}/> {successMsg}</div>}

            <form onSubmit={confirmSubmit}>
                {/* --- Master Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    <div className="vents-container"><Vent /><Vent /><Vent /></div>
                    
                    <div className="plate-header">
                        <Scale className="plate-icon" size={20} />
                        <span className="plate-title">{t('adj.master_plate') || 'AUDIT MASTER PLATE'}</span>
                    </div>

                    <div className="input-grid-2">
                        <div className="input-group-recessed">
                            <label>{t('adj.protocol_id') || 'ADJUSTMENT_CODE (AUTO)'}</label>
                            <input type="text" className="input-mono" value={adjustmentCode} readOnly style={{color: 'var(--accent-orange)'}} />
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('adj.timestamp') || 'ADJUSTED_DATE'}</label>
                            <div style={{position: 'relative'}}>
                                <input type="datetime-local" className="input-mono" value={adjustedDate} onChange={e => setAdjustedDate(e.target.value)} required />
                                <Calendar size={16} style={{position: 'absolute', right: '12px', top: '12px', color: 'var(--text-secondary)', pointerEvents: 'none'}}/>
                            </div>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('adj.facility') || 'AUDIT FACILITY (WAREHOUSE)'}</label>
                            <select value={warehouseId} onChange={e => {
                                setWarehouseId(e.target.value);
                                setItems([]); // Reset items on warehouse change
                            }} required>
                                <option value="">{t('adj.select_facility') || '-- SELECT FACILITY --'}</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('adj.reason') || 'REASON FOR ADJUSTMENT'}</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} style={{textTransform: 'none'}} placeholder={t('adj.reason_ph') || 'e.g., Annual stock take, Damage correction...'} required />
                    </div>
                </div>

                {/* --- Detail Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    
                    <div className="plate-header">
                        <Layers className="plate-icon" size={20} />
                        <span className="plate-title">{t('adj.detail_plate') || 'CALIBRATION GRID (LINE ITEMS)'}</span>
                    </div>

                    <div className="calibration-table-well">
                        <table className="item-table">
                            <thead>
                                <tr>
                                    <th>{t('adj.col_product') || 'PRODUCT'}</th>
                                    <th style={{width: '200px'}}>{t('adj.col_batch') || 'BATCH_NO'}</th>
                                    <th style={{width: '120px'}}>{t('adj.col_sys_qty') || 'SYSTEM QTY'}</th>
                                    <th style={{width: '120px'}}>{t('adj.col_actual_qty') || 'ACTUAL QTY'}</th>
                                    <th style={{width: '120px'}}>{t('adj.col_diff') || 'DIFFERENCE'}</th>
                                    <th style={{width: '50px'}}>{t('adj.col_act') || 'ACT'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const diff = (parseFloat(item.actualQty) || 0) - (parseFloat(item.systemQty) || 0);
                                    let diffClass = 'lcd-diff-neutral';
                                    if (diff > 0) diffClass = 'lcd-diff-positive';
                                    else if (diff < 0) diffClass = 'lcd-diff-negative';

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <select className="cell-input cell-select" value={item.productId} onChange={e => handleItemChange(item.id, 'productId', e.target.value)} required disabled={!warehouseId}>
                                                    <option value="">{t('adj.select_item') || '- SELECT ITEM -'}</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.productName} [{p.sku}]</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select className="cell-input cell-select" style={{fontFamily: 'var(--font-mono)'}} value={item.batchNumber} onChange={e => handleItemChange(item.id, 'batchNumber', e.target.value)} required disabled={!item.productId}>
                                                    <option value="">{t('adj.select_batch') || '- SELECT BATCH -'}</option>
                                                    {getAvailableBatches(item.productId).map(b => (
                                                        <option key={b.batchNumber} value={b.batchNumber}>
                                                            LÔ: {b.batchNumber} (Tồn: {b.quantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="lcd-readout lcd-system-qty">{item.systemQty}</div>
                                            </td>
                                            <td>
                                                <input type="number" min="0" step="1" className="lcd-actual-qty" value={item.actualQty} onChange={e => handleItemChange(item.id, 'actualQty', e.target.value)} required disabled={!item.batchNumber} />
                                            </td>
                                            <td>
                                                <div className={`lcd-readout ${diffClass}`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </div>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <button type="button" className="delete-row-btn" onClick={() => handleRemoveItem(item.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                                            {t('adj.empty_matrix') || 'CALIBRATION GRID EMPTY. ADD ITEMS TO AUDIT.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="action-bay">
                        <button type="button" className="tactical-btn-secondary" onClick={handleAddItem} disabled={!warehouseId}>
                            <Plus size={18}/> {t('adj.append_row') || 'ADD AUDIT LINE'}
                        </button>

                        <div className="summary-vault">
                            <div className="summary-item">
                                <span className="summary-label">{t('adj.total_surplus') || 'TOTAL SURPLUS'}</span>
                                <span className="summary-value surplus">+{totalSurplus.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">{t('adj.total_missing') || 'TOTAL MISSING'}</span>
                                <span className="summary-value missing">-{totalMissing.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Footer Action --- */}
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="submit" className="tactical-btn-accent" disabled={isSaving || items.length === 0}>
                        <FileWarning size={20} />
                        {t('adj.finalize') || 'LOCK & SUBMIT RECONCILIATION'}
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleFinalizeAdjustment}
                title={t('adj.confirm_title') || 'AUTHORIZE RECONCILIATION'}
                message={`${t('adj.confirm_msg') || 'Are you sure you want to submit this adjustment protocol? This action will permanently overwrite current stock levels.'}`}
            />
        </div>
    );
};

export default InventoryAuditConsole;