import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Truck, Edit3, Trash2, ShieldAlert, Phone, Mail, MapPin, Hash, Activity } from 'lucide-react';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/SupplierConsole.css';

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

const SupplierConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // State
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form Data
    const [currentSupplier, setCurrentSupplier] = useState(null); // null = create
    const [supName, setSupName] = useState('');
    const [supTaxCode, setSupTaxCode] = useState('');
    const [supPhone, setSupPhone] = useState('');
    const [supEmail, setSupEmail] = useState('');
    const [supAddress, setSupAddress] = useState('');
    const [supLeadTime, setSupLeadTime] = useState(1);
    const [supScore, setSupScore] = useState(10.0);
    const [supIsActive, setSupIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supplierService.getAll();
            const mappedData = data.map(s => ({
                ...s,
                leadTimeDays: s.leadTimeDays || Math.floor(Math.random() * 30) + 1, 
                reliabilityScore: s.reliabilityScore || (Math.random() * 5 + 5).toFixed(1) 
            }));
            setSuppliers(mappedData);
        } catch (err) {
            setError(t('supplier.loading'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // Filtering (SỬA LẠI ĐỂ TÌM KIẾM CÓ DẤU HOẶC KHÔNG DẤU)
    const filteredSuppliers = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return suppliers;

        const normalizedSearchTerm = removeAccents(term).toLowerCase();

        return suppliers.filter(s => {
            const normalizedName = s.supplierName ? removeAccents(s.supplierName).toLowerCase() : '';
            const normalizedTaxCode = s.taxCode ? removeAccents(s.taxCode).toLowerCase() : '';
            
            return normalizedName.includes(normalizedSearchTerm) || normalizedTaxCode.includes(normalizedSearchTerm);
        });
    }, [suppliers, searchTerm]);

    // Handlers
    const handleToggleStatus = async (id) => {
        if (!isAdmin) return;
        try {
            await supplierService.toggleStatus(id);
            setSuppliers(suppliers.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
        } catch (err) {
            setError('Failed to switch vendor status.');
        }
    };

    const openCreateModal = () => {
        setCurrentSupplier(null);
        setSupName(''); setSupTaxCode(''); setSupPhone(''); setSupEmail(''); 
        setSupAddress(''); setSupLeadTime(7); setSupScore(10.0); setSupIsActive(true);
        setIsFormModalOpen(true);
    };

    const openEditModal = (sup) => {
        setCurrentSupplier(sup);
        setSupName(sup.supplierName || '');
        setSupTaxCode(sup.taxCode || '');
        setSupPhone(sup.phone || '');
        setSupEmail(sup.email || '');
        setSupAddress(sup.address || '');
        setSupLeadTime(sup.leadTimeDays || 7);
        setSupScore(sup.reliabilityScore || 10.0);
        setSupIsActive(sup.isActive);
        setIsFormModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!supName.trim()) {
            setError('Supplier Name is required.'); return;
        }

        setIsSaving(true);
        const payload = {
            supplierName: supName,
            taxCode: supTaxCode,
            phone: supPhone,
            email: supEmail,
            address: supAddress,
            leadTimeDays: parseInt(supLeadTime),
            reliabilityScore: parseFloat(supScore),
            isActive: supIsActive
        };

        try {
            if (currentSupplier) {
                await supplierService.update(currentSupplier.id, payload);
            } else {
                await supplierService.create(payload);
            }
            setIsFormModalOpen(false);
            fetchSuppliers();
        } catch (err) {
            setError('Failed to update vendor logic.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = (sup) => {
        setCurrentSupplier(sup);
        setIsConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!currentSupplier) return;
        try {
            await supplierService.delete(currentSupplier.id);
            fetchSuppliers();
        } catch (err) {
            setError('Cannot purge vendor. Active receipt records exist.');
        } finally {
            setIsConfirmModalOpen(false);
            setCurrentSupplier(null);
        }
    };

    const getScoreColorClass = (score) => {
        const num = parseFloat(score);
        if (num >= 8.0) return 'val-score-green';
        if (num >= 5.0) return 'val-score-yellow';
        return 'val-score-red';
    };

    return (
        <div className="supplier-chassis">
            <h1 className="console-title-stamp">{t('supplier.title')}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* --- Search Bay --- */}
            <div className="search-bay">
                <div className="search-input-recess">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('supplier.search_ph')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin ? (
                    <button className="tactical-btn-accent" onClick={openCreateModal}>
                        <Truck size={18} />
                        {t('supplier.btn_init_sup')}
                    </button>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                        <ShieldAlert size={20}/> <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700}}>{t('supplier.read_only')}</span>
                    </div>
                )}
            </div>

            {/* --- Vendor Matrix Grid --- */}
            {loading ? (
                <div className="loading-state">{t('supplier.loading')}</div>
            ) : (
                <div className="supplier-grid">
                    {filteredSuppliers.map(sup => (
                        <div key={sup.id} className="supplier-card">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            <div className="vents-container">
                                <Vent /><Vent /><Vent /><Vent />
                            </div>

                            <div className="sup-header">
                                <h2 className="sup-name">{sup.supplierName}</h2>
                                {sup.taxCode && (
                                    <div className="tax-stamp">
                                        <Hash size={10} style={{display:'inline', marginRight:'2px'}}/> 
                                        {sup.taxCode}
                                    </div>
                                )}
                            </div>

                            <div className="sup-contact-well">
                                <div className="contact-row">
                                    <Phone size={14}/> <span className="mono-val">{sup.phone || t('supplier.no_comm')}</span>
                                </div>
                                <div className="contact-row">
                                    <Mail size={14}/> <span className="mono-val" style={{fontSize: '0.75rem'}}>{sup.email || t('supplier.no_data')}</span>
                                </div>
                                <div className="contact-row">
                                    <MapPin size={14}/> <span style={{lineHeight: 1.2}}>{sup.address || t('supplier.unknown_coord')}</span>
                                </div>
                            </div>

                            <div className="telemetry-well">
                                <div className="tel-module">
                                    <span className="tel-label">{t('supplier.delay')}</span>
                                    <span className="tel-value val-leadtime">{sup.leadTimeDays} D</span>
                                </div>
                                <Activity color="#4b5563" size={24} />
                                <div className="tel-module">
                                    <span className="tel-label">{t('supplier.score')}</span>
                                    <span className={`tel-value ${getScoreColorClass(sup.reliabilityScore)}`}>
                                        {parseFloat(sup.reliabilityScore).toFixed(1)}/10
                                    </span>
                                </div>
                            </div>

                            <div className="sup-footer">
                                <div className="status-module">
                                    <LedIndicator active={sup.isActive} />
                                    <TacticalToggle 
                                        isActive={sup.isActive} 
                                        onToggle={() => handleToggleStatus(sup.id)}
                                        disabled={!isAdmin}
                                    />
                                    <span className="toggle-label" style={{marginLeft: '8px'}}>{sup.isActive ? t('supplier.online') : t('supplier.offline')}</span>
                                </div>
                                {isAdmin && (
                                    <div className="action-buttons">
                                        <button className="icon-btn" onClick={() => openEditModal(sup)} title={t('supplier.edit_title')}>
                                            <Edit3 size={16} />
                                        </button>
                                        <button className="icon-btn" onClick={() => confirmDelete(sup)} title={t('supplier.delete_title')}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {filteredSuppliers.length === 0 && (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                            {t('supplier.no_sups')}
                        </div>
                    )}
                </div>
            )}

            {/* --- Tactile Entry Module --- */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={t('supplier.modal_title')}>
                <form onSubmit={handleSave} style={{padding: '1rem 0'}}>
                    <div className="input-group-recessed">
                        <label>{t('supplier.sup_name')}</label>
                        <input type="text" value={supName} onChange={(e) => setSupName(e.target.value)} required disabled={isSaving} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group-recessed">
                            <label>{t('supplier.tax_id')}</label>
                            <input type="text" className="input-mono" value={supTaxCode} onChange={(e) => setSupTaxCode(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('supplier.phone')}</label>
                            <input type="text" className="input-mono" value={supPhone} onChange={(e) => setSupPhone(e.target.value)} disabled={isSaving}/>
                        </div>
                    </div>

                    <div className="input-group-recessed">
                        <label>{t('supplier.email')}</label>
                        <input type="email" className="input-mono" value={supEmail} onChange={(e) => setSupEmail(e.target.value)} disabled={isSaving}/>
                    </div>

                    <div className="input-group-recessed">
                        <label>{t('supplier.address')}</label>
                        <textarea value={supAddress} onChange={(e) => setSupAddress(e.target.value)} rows={2} disabled={isSaving}/>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group-recessed">
                            <label>{t('supplier.lead_time')}</label>
                            <input type="number" min="0" className="input-mono" value={supLeadTime} onChange={(e) => setSupLeadTime(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('supplier.reliab')}</label>
                            <input type="number" step="0.1" min="0" max="10" className="input-mono" value={supScore} onChange={(e) => setSupScore(e.target.value)} disabled={isSaving}/>
                        </div>
                    </div>

                    <div className="input-group-recessed" style={{flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
                        <label>{t('supplier.status')}</label>
                        <TacticalToggle isActive={supIsActive} onToggle={() => setSupIsActive(!supIsActive)} disabled={isSaving} />
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                        <button type="submit" className="tactical-btn-accent" disabled={isSaving}>
                            <Truck size={16} /> 
                            {currentSupplier ? t('supplier.btn_update') : t('supplier.btn_init_sup')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- Confirm Delete Modal --- */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={t('supplier.confirm_del_title')}
                message={`${t('supplier.confirm_del_msg')} "${currentSupplier?.supplierName}".`}
            />
        </div>
    );
};

export default SupplierConsole;