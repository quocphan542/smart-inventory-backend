import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Calendar, ShieldCheck, Trash2, ShieldAlert, CheckCircle2, Layers, Plus, Save } from 'lucide-react';
import supplierService from '../../services/supplierService';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import receiptService from '../../services/receiptService';
import { useAuth } from '../../hooks/useAuth';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/InboundReceiptConsole.css';

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const InboundReceiptConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // Master Data States (for dropdowns)
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form Master States
    const [receiptCode, setReceiptCode] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 16));
    const [note, setNote] = useState('');

    // Form Details State (Line Items)
    const [items, setItems] = useState([]);

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [supData, whData, prodData] = await Promise.all([
                    supplierService.getAll(),
                    warehouseService.getAll(),
                    productService.getAll()
                ]);
                setSuppliers(supData.filter(s => s.isActive));
                setWarehouses(whData.filter(w => w.isActive));
                setProducts(prodData.filter(p => p.isActive));
                
                // Auto-generate code
                const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                setReceiptCode(`RC-IN-${randomId}`);
            } catch (err) {
                setError('Lỗi kết nối CSDL cơ sở.');
            } finally {
                setLoadingData(false);
            }
        };
        fetchMasterData();
    }, []);

    // Handlers for Items
    const handleAddItem = () => {
        setItems([
            ...items, 
            { 
                id: Date.now(), 
                productId: '', 
                quantity: 1, 
                unitPrice: 0, 
                batchNumber: '', 
                expiryDate: '' 
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
                // If product changes, auto-fill unitPrice from product base price
                if (field === 'productId') {
                    const selectedProd = products.find(p => p.id.toString() === value.toString());
                    if (selectedProd && selectedProd.basePrice) {
                        updatedItem.unitPrice = selectedProd.basePrice;
                    } else {
                        updatedItem.unitPrice = 0;
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };

    // Computations
    const { totalQuantity, totalValue } = useMemo(() => {
        let q = 0;
        let v = 0;
        items.forEach(item => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            q += qty;
            v += qty * price;
        });
        return { totalQuantity: q, totalValue: v };
    }, [items]);

    // Validation & Submit
    const validateForm = () => {
        if (!supplierId || !warehouseId || !receivedDate) {
            setError('Vui lòng chọn Nhà Cung Cấp, Kho Bãi và Ngày nhập.');
            return false;
        }
        if (items.length === 0) {
            setError('Phiếu nhập không được để trống. Vui lòng thêm sản phẩm.');
            return false;
        }
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.productId || it.quantity <= 0) {
                setError(`Sản phẩm dòng #${i+1} chưa được chọn hoặc số lượng không hợp lệ.`);
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

    const handleFinalizeReceipt = async () => {
        setIsConfirmOpen(false);
        setIsSaving(true);
        try {
            const payload = {
                receiptCode,
                supplierId: parseInt(supplierId),
                warehouseId: parseInt(warehouseId),
                receivedDate,
                note,
                details: items.map(it => ({
                    productId: parseInt(it.productId),
                    quantity: parseFloat(it.quantity),
                    unitPrice: parseFloat(it.unitPrice),
                    batchNumber: it.batchNumber,
                    expiryDate: it.expiryDate || null
                }))
            };

            await receiptService.create(payload);
            setSuccessMsg(`THÀNH CÔNG: Đã lưu phiếu nhập [${receiptCode}].`);
            
            // Reset form
            const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setReceiptCode(`RC-IN-${randomId}`);
            setItems([]);
            setNote('');
        } catch (err) {
            setError(err.message || 'Lỗi nghiêm trọng khi lưu phiếu nhập.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingData) return <div className="inbound-chassis"><div className="console-title-stamp">ĐANG KHỞI TẠO HỆ THỐNG...</div></div>;

    return (
        <div className="inbound-chassis">
            <h1 className="console-title-stamp">{t('receipt.title')}</h1>

            {error && <div className="error-banner mb-4"><ShieldAlert size={18} style={{display:'inline', marginRight:'8px'}}/> {error}</div>}
            {successMsg && <div className="error-banner mb-4" style={{backgroundColor: '#064e3b', color: '#10b981', borderColor: '#047857'}}><CheckCircle2 size={18} style={{display:'inline', marginRight:'8px'}}/> {successMsg}</div>}

            <form onSubmit={confirmSubmit}>
                {/* --- Master Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    <div className="vents-container"><Vent /><Vent /><Vent /></div>
                    
                    <div className="plate-header">
                        <PackagePlus className="plate-icon" size={20} />
                        <span className="plate-title">{t('receipt.master_plate')}</span>
                    </div>

                    <div className="input-grid-2">
                        <div className="input-group-recessed">
                            <label>{t('receipt.protocol_id')}</label>
                            <input type="text" className="input-mono" value={receiptCode} readOnly style={{color: 'var(--accent-orange)'}} />
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('receipt.timestamp')}</label>
                            <div style={{position: 'relative'}}>
                                <input type="datetime-local" className="input-mono" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} required />
                                <Calendar size={16} style={{position: 'absolute', right: '12px', top: '12px', color: 'var(--text-secondary)', pointerEvents: 'none'}}/>
                            </div>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('receipt.vendor')}</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                                <option value="">{t('receipt.select_vendor')}</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
                            </select>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('receipt.facility')}</label>
                            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
                                <option value="">{t('receipt.select_facility')}</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('receipt.notes')}</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{textTransform: 'none'}} placeholder={t('receipt.notes_ph')} />
                    </div>
                </div>

                {/* --- Detail Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    
                    <div className="plate-header">
                        <Layers className="plate-icon" size={20} />
                        <span className="plate-title">{t('receipt.detail_plate')}</span>
                    </div>

                    <div className="detail-table-well">
                        <table className="item-table">
                            <thead>
                                <tr>
                                    <th>{t('receipt.col_product')}</th>
                                    <th style={{width: '100px'}}>{t('receipt.col_qty')}</th>
                                    <th style={{width: '150px'}}>{t('receipt.col_batch')}</th>
                                    <th style={{width: '150px'}}>{t('receipt.col_expiry')}</th>
                                    {/* RBAC Masking for Headers */}
                                    <th style={{width: '120px'}}>{isAdmin ? t('receipt.col_price') : t('receipt.col_secure')}</th>
                                    <th style={{width: '120px'}}>{isAdmin ? t('receipt.col_total') : t('receipt.col_secure')}</th>
                                    <th style={{width: '50px'}}>{t('receipt.col_act')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const selectedProd = products.find(p => p.id.toString() === item.productId.toString());
                                    const lineTotal = (item.quantity * item.unitPrice) || 0;
                                    
                                    // Simulated expiry logic: if within 30 days, alert
                                    const isExpiringSoon = item.expiryDate && (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) < 30;

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <select className="cell-input cell-select" value={item.productId} onChange={e => handleItemChange(item.id, 'productId', e.target.value)} required>
                                                    <option value="">{t('receipt.select_item')}</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.productName} [{p.sku}]</option>)}
                                                </select>
                                                {selectedProd && <div style={{fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)'}}>{t('receipt.unit')} {selectedProd.unitName || 'N/A'}</div>}
                                            </td>
                                            <td>
                                                <input type="number" min="0.01" step="0.01" className="cell-input" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} required />
                                            </td>
                                            <td>
                                                <input type="text" className="cell-input" value={item.batchNumber} onChange={e => handleItemChange(item.id, 'batchNumber', e.target.value)} placeholder={t('receipt.batch_ph')} />
                                            </td>
                                            <td style={{position: 'relative'}}>
                                                <input type="date" className="cell-input" value={item.expiryDate} onChange={e => handleItemChange(item.id, 'expiryDate', e.target.value)} />
                                                {isExpiringSoon && <div style={{position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-orange)', boxShadow: '0 0 5px var(--accent-orange)', animation: 'pulse 1s infinite'}}></div>}
                                            </td>
                                            
                                            {/* RBAC Logic for Financial Data */}
                                            <td>
                                                {isAdmin ? (
                                                    <div className="lcd-amber">
                                                        <span style={{fontSize:'0.7rem'}}>$</span>
                                                        <input type="number" min="0" step="0.01" className="cell-input" style={{background: 'transparent', boxShadow: 'none', color: 'inherit', padding: 0, textAlign: 'right'}} value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} />
                                                    </div>
                                                ) : (
                                                    <div className="lcd-locked"><ShieldCheck size={14}/> ***</div>
                                                )}
                                            </td>
                                            <td>
                                                {isAdmin ? (
                                                    <div className="lcd-amber" style={{justifyContent: 'flex-end'}}>
                                                        <span style={{fontSize:'0.7rem'}}>$</span> {lineTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                    </div>
                                                ) : (
                                                    <div className="lcd-locked"><ShieldCheck size={14}/> ***</div>
                                                )}
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
                                        <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                                            {t('receipt.empty_matrix')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="action-bay">
                        <button type="button" className="tactical-btn-secondary" onClick={handleAddItem}>
                            <Plus size={18}/> {t('receipt.append_row')}
                        </button>

                        <div className="summary-telemetry">
                            <div className="summary-item">
                                <span className="summary-label">{t('receipt.total_qty')}</span>
                                <span className="summary-value">{totalQuantity.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">{t('receipt.total_value')}</span>
                                {isAdmin ? (
                                    <span className="summary-value">${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                ) : (
                                    <span className="summary-value" style={{color: '#636e72', textShadow: 'none'}}>***</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Footer Action --- */}
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="submit" className="tactical-btn-accent" disabled={isSaving || items.length === 0}>
                        <Save size={20} />
                        {t('receipt.finalize')}
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleFinalizeReceipt}
                title={t('receipt.confirm_title')}
                message={`${t('receipt.confirm_msg')} [${receiptCode}] ${t('receipt.confirm_msg2')}`}
            />
        </div>
    );
};

export default InboundReceiptConsole;