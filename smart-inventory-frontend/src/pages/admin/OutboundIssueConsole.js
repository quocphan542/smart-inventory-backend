import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Truck, Calendar, ShieldCheck, Trash2, ShieldAlert, CheckCircle2, Layers, Plus, Save, Receipt } from 'lucide-react';
import customerService from '../../services/customerService';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import issueService from '../../services/issueService';
// Giả định có inventoryStockService để lấy batch numbers và tồn kho hiện tại (cần thêm nếu chưa có)
import inventoryStockService from '../../services/inventoryStockService'; 
import { useAuth } from '../../hooks/useAuth';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/OutboundIssueConsole.css';

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const OutboundIssueConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // Master Data States (for dropdowns)
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]); // Chứa tồn kho để lấy Batch Number và SL tồn
    const [loadingData, setLoadingData] = useState(true);

    // Form Master States
    const [issueCode, setIssueCode] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 16));
    const [note, setNote] = useState('');

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
            const [custData, whData, prodData, stockData] = await Promise.all([
                customerService.getAll(),
                warehouseService.getAll(),
                productService.getAll(),
                inventoryStockService.getAll() // Lấy tất cả tồn kho để biết lô nào còn hàng
            ]);
            setCustomers(custData.filter(c => c.isActive));
            setWarehouses(whData.filter(w => w.isActive));
            setProducts(prodData.filter(p => p.isActive));
            setStocks(stockData);
            
            // Auto-generate code
            const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            setIssueCode(`IS-OUT-${randomId}`);
        } catch (err) {
            setError(t('issue.err_connect') || 'Lỗi kết nối CSDL cơ sở.');
        } finally {
            setLoadingData(false);
        }
    }, [t]);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);

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
                availableQty: 0 // Dùng để hiển thị tồn kho
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
                
                // Khi đổi sản phẩm
                if (field === 'productId') {
                    // Reset batch
                    updatedItem.batchNumber = '';
                    updatedItem.availableQty = 0;
                    
                    const selectedProd = products.find(p => p.id.toString() === value.toString());
                    if (selectedProd && selectedProd.basePrice) {
                        updatedItem.unitPrice = selectedProd.basePrice;
                    } else {
                        updatedItem.unitPrice = 0;
                    }
                }
                
                // Khi đổi Batch (dựa vào Warehouse và Product đã chọn)
                if (field === 'batchNumber') {
                    // Tìm stock tương ứng để lấy tồn kho
                    const stock = stocks.find(s => 
                        s.productId.toString() === updatedItem.productId.toString() && 
                        s.warehouseId.toString() === warehouseId.toString() &&
                        s.batchNumber === value
                    );
                    if (stock) {
                        updatedItem.availableQty = stock.quantity;
                        // Tự động chặn nếu quantity nhập vào lớn hơn tồn kho (có thể chặn lúc submit)
                    } else {
                        updatedItem.availableQty = 0;
                    }
                }
                
                return updatedItem;
            }
            return item;
        }));
    };

    // Lấy danh sách Batch khả dụng cho 1 sản phẩm tại Kho đang chọn
    const getAvailableBatches = (productId) => {
        if (!productId || !warehouseId) return [];
        return stocks.filter(s => 
            s.productId.toString() === productId.toString() && 
            s.warehouseId.toString() === warehouseId.toString() &&
            s.quantity > 0
        );
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
        if (!customerId || !warehouseId || !issuedDate) {
            setError(t('issue.err_master') || 'Vui lòng chọn Khách hàng, Kho xuất và Ngày xuất.');
            return false;
        }
        if (items.length === 0) {
            setError(t('issue.err_empty') || 'Phiếu xuất không được để trống.');
            return false;
        }
        
        // Kiểm tra chi tiết
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.productId) {
                setError(`${t('issue.err_row') || 'Dòng'} #${i+1}: ${t('issue.err_no_prod') || 'Chưa chọn sản phẩm'}`);
                return false;
            }
            if (!it.batchNumber) {
                setError(`${t('issue.err_row') || 'Dòng'} #${i+1}: ${t('issue.err_no_batch') || 'Chưa chọn Lô (Batch)'}`);
                return false;
            }
            if (it.quantity <= 0) {
                setError(`${t('issue.err_row') || 'Dòng'} #${i+1}: ${t('issue.err_qty_invalid') || 'Số lượng không hợp lệ'}`);
                return false;
            }
            if (it.quantity > it.availableQty) {
                setError(`${t('issue.err_row') || 'Dòng'} #${i+1}: ${t('issue.err_qty_exceed') || 'Số lượng xuất VƯỢT QUÁ tồn kho hiện tại của lô này!'}`);
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

    const handleFinalizeIssue = async () => {
        setIsConfirmOpen(false);
        setIsSaving(true);
        try {
            const payload = {
                issueCode,
                customerId: parseInt(customerId),
                warehouseId: parseInt(warehouseId),
                issuedDate,
                note,
                details: items.map(it => ({
                    productId: parseInt(it.productId),
                    quantity: parseFloat(it.quantity),
                    unitPrice: parseFloat(it.unitPrice),
                    batchNumber: it.batchNumber
                }))
            };

            await issueService.create(payload);
            setSuccessMsg(`${t('issue.success') || 'THÀNH CÔNG: Đã lưu phiếu xuất'} [${issueCode}].`);
            
            // Refetch stock to update available quantities
            fetchMasterData();
            
            // Reset form
            setItems([]);
            setNote('');
        } catch (err) {
            setError(err.message || t('issue.err_fatal') || 'Lỗi nghiêm trọng khi lưu phiếu xuất.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingData) return <div className="outbound-chassis"><div className="console-title-stamp">{t('issue.loading') || 'ĐANG KHỞI TẠO TRẠM XUẤT KHO...'}</div></div>;

    return (
        <div className="outbound-chassis">
            <h1 className="console-title-stamp">{t('issue.title') || 'TRẠM ĐIỀU PHỐI XUẤT KHO (OUTBOUND DISPATCH)'}</h1>

            {error && <div className="error-banner mb-4"><ShieldAlert size={18} style={{display:'inline', marginRight:'8px'}}/> {error}</div>}
            {successMsg && <div className="error-banner mb-4" style={{backgroundColor: '#064e3b', color: '#10b981', borderColor: '#047857'}}><CheckCircle2 size={18} style={{display:'inline', marginRight:'8px'}}/> {successMsg}</div>}

            <form onSubmit={confirmSubmit}>
                {/* --- Master Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    <div className="vents-container"><Vent /><Vent /><Vent /></div>
                    
                    <div className="plate-header">
                        <Truck className="plate-icon" size={20} />
                        <span className="plate-title">{t('issue.master_plate') || 'THÔNG TIN ĐIỀU PHỐI (MASTER)'}</span>
                    </div>

                    <div className="input-grid-2">
                        <div className="input-group-recessed">
                            <label>{t('issue.protocol_id') || 'MÃ PHIẾU XUẤT (AUTO)'}</label>
                            <input type="text" className="input-mono" value={issueCode} readOnly style={{color: 'var(--accent-orange)'}} />
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('issue.timestamp') || 'NGÀY XUẤT (DISPATCH DATE)'}</label>
                            <div style={{position: 'relative'}}>
                                <input type="datetime-local" className="input-mono" value={issuedDate} onChange={e => setIssuedDate(e.target.value)} required />
                                <Calendar size={16} style={{position: 'absolute', right: '12px', top: '12px', color: 'var(--text-secondary)', pointerEvents: 'none'}}/>
                            </div>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('issue.customer') || 'ĐÍCH ĐẾN (KHÁCH HÀNG)'}</label>
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                                <option value="">{t('issue.select_cust') || '-- CHỌN ĐÍCH ĐẾN --'}</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.customerName}</option>)}
                            </select>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('issue.facility') || 'KHO XUẤT (NGUỒN)'}</label>
                            <select value={warehouseId} onChange={e => {
                                setWarehouseId(e.target.value);
                                // Reset items because available batches depend on warehouse
                                setItems([]);
                            }} required>
                                <option value="">{t('issue.select_facility') || '-- CHỌN KHO XUẤT --'}</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="input-group-recessed">
                        <label>{t('issue.notes') || 'GHI CHÚ / CHỈ THỊ (NOTES)'}</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{textTransform: 'none'}} placeholder={t('issue.notes_ph') || 'Nhập chỉ thị vận chuyển...'} />
                    </div>
                </div>

                {/* --- Detail Plate --- */}
                <div className="mech-plate">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    
                    <div className="plate-header">
                        <Layers className="plate-icon" size={20} />
                        <span className="plate-title">{t('issue.detail_plate') || 'DANH SÁCH XUẤT (MANIFEST ITEMS)'}</span>
                    </div>

                    <div className="detail-table-well">
                        <table className="item-table">
                            <thead>
                                <tr>
                                    <th>{t('issue.col_product') || 'SẢN PHẨM'}</th>
                                    <th style={{width: '200px'}}>{t('issue.col_batch') || 'SỐ LÔ (CHỌN TỪ TỒN KHO)'}</th>
                                    <th style={{width: '120px'}}>{t('issue.col_qty') || 'SỐ LƯỢNG'}</th>
                                    {/* RBAC Masking for Headers */}
                                    <th style={{width: '120px'}}>{isAdmin ? (t('issue.col_price') || 'ĐƠN GIÁ') : (t('issue.col_secure') || 'BẢO MẬT')}</th>
                                    <th style={{width: '120px'}}>{isAdmin ? (t('issue.col_total') || 'THÀNH TIỀN') : (t('issue.col_secure') || 'BẢO MẬT')}</th>
                                    <th style={{width: '50px'}}>{t('issue.col_act') || 'ACT'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const selectedProd = products.find(p => p.id.toString() === item.productId.toString());
                                    const availableBatches = getAvailableBatches(item.productId);
                                    const lineTotal = (item.quantity * item.unitPrice) || 0;
                                    
                                    // Alert if quantity > available
                                    const isOverIssue = item.quantity > item.availableQty;

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <select className="cell-input cell-select" value={item.productId} onChange={e => handleItemChange(item.id, 'productId', e.target.value)} required disabled={!warehouseId}>
                                                    <option value="">{t('issue.select_item') || '- CHỌN SẢN PHẨM -'}</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.productName} [{p.sku}]</option>)}
                                                </select>
                                                {selectedProd && <div style={{fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)'}}>{t('issue.unit') || 'ĐƠN VỊ:'} {selectedProd.unitName || 'N/A'}</div>}
                                            </td>
                                            <td>
                                                <select className="cell-input cell-select" style={{fontFamily: 'var(--font-mono)'}} value={item.batchNumber} onChange={e => handleItemChange(item.id, 'batchNumber', e.target.value)} required disabled={!item.productId}>
                                                    <option value="">{t('issue.select_batch') || '- CHỌN LÔ -'}</option>
                                                    {availableBatches.map(b => (
                                                        <option key={b.batchNumber} value={b.batchNumber}>
                                                            LÔ: {b.batchNumber} (Tồn: {b.quantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" min="0.01" step="0.01" className="cell-input" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} required disabled={!item.batchNumber} />
                                                {item.batchNumber && (
                                                    <span className="stock-indicator" style={{color: isOverIssue ? 'var(--accent-orange)' : '#10b981'}}>
                                                        TỒN: {item.availableQty}
                                                    </span>
                                                )}
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
                                        <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                                            {t('issue.empty_matrix') || 'DANH SÁCH TRỐNG. VUI LÒNG THÊM SẢN PHẨM.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="action-bay">
                        <button type="button" className="tactical-btn-secondary" onClick={handleAddItem} disabled={!warehouseId}>
                            <Plus size={18}/> {t('issue.append_row') || 'THÊM DÒNG'}
                        </button>

                        <div className="summary-telemetry">
                            <div className="summary-item">
                                <span className="summary-label">{t('issue.total_qty') || 'TỔNG SỐ LƯỢNG'}</span>
                                <span className="summary-value">{totalQuantity.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">{t('issue.total_value') || 'TỔNG GIÁ TRỊ'}</span>
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
                        <Receipt size={20} />
                        {t('issue.finalize') || 'ỦY QUYỀN XUẤT KHO'}
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleFinalizeIssue}
                title={t('issue.confirm_title') || "XÁC NHẬN LỆNH XUẤT KHO"}
                message={`${t('issue.confirm_msg') || 'Bạn có chắc chắn muốn ủy quyền phiếu'} [${issueCode}]? ${t('issue.confirm_msg2') || 'Số lượng sẽ bị trừ vĩnh viễn khỏi Tồn kho.'}`}
            />
        </div>
    );
};

export default OutboundIssueConsole;