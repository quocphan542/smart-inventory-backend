import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Map, Phone, Mail, MapPin, Edit3, Trash2, Send, ShieldAlert } from 'lucide-react';
import customerService from '../../services/customerService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/CustomerConsole.css';

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

const CustomerConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // State
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form Data
    const [currentCustomer, setCurrentCustomer] = useState(null); // null = create
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custEmail, setCustEmail] = useState('');
    const [custAddress, setCustAddress] = useState('');
    const [custIsActive, setCustIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (err) {
            setError('Failed to load dispatch directory.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Filtering (SỬA LẠI ĐỂ TÌM KIẾM CÓ DẤU HOẶC KHÔNG DẤU)
    const filteredCustomers = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return customers;

        const normalizedSearchTerm = removeAccents(term).toLowerCase();

        return customers.filter(c => {
            const normalizedName = c.customerName ? removeAccents(c.customerName).toLowerCase() : '';
            const normalizedPhone = c.phone ? removeAccents(c.phone).toLowerCase() : '';
            
            return normalizedName.includes(normalizedSearchTerm) || normalizedPhone.includes(normalizedSearchTerm);
        });
    }, [customers, searchTerm]);

    // Handlers
    const handleToggleStatus = async (id) => {
        if (!isAdmin) return;
        try {
            await customerService.toggleStatus(id);
            setCustomers(customers.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        } catch (err) {
            setError('Failed to switch route status.');
        }
    };

    const openCreateModal = () => {
        setCurrentCustomer(null);
        setCustName(''); setCustPhone(''); setCustEmail(''); 
        setCustAddress(''); setCustIsActive(true);
        setIsFormModalOpen(true);
    };

    const openEditModal = (cust) => {
        setCurrentCustomer(cust);
        setCustName(cust.customerName || '');
        setCustPhone(cust.phone || '');
        setCustEmail(cust.email || '');
        setCustAddress(cust.address || '');
        setCustIsActive(cust.isActive);
        setIsFormModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!custName.trim()) {
            setError('Customer Name is required.'); return;
        }

        setIsSaving(true);
        const payload = {
            customerName: custName,
            phone: custPhone,
            email: custEmail,
            address: custAddress,
            isActive: custIsActive
        };

        try {
            if (currentCustomer) {
                await customerService.update(currentCustomer.id, payload);
            } else {
                await customerService.create(payload);
            }
            setIsFormModalOpen(false);
            fetchCustomers();
        } catch (err) {
            setError('Failed to update routing target.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = (cust) => {
        setCurrentCustomer(cust);
        setIsConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        if (!currentCustomer) return;
        try {
            await customerService.delete(currentCustomer.id);
            fetchCustomers();
        } catch (err) {
            setError('Cannot purge target. Active outbound issues exist.');
        } finally {
            setIsConfirmModalOpen(false);
            setCurrentCustomer(null);
        }
    };

    return (
        <div className="customer-chassis">
            <h1 className="console-title-stamp">{t('customer.title')}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* --- Search Bay --- */}
            <div className="search-bay">
                <div className="search-input-recess">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('customer.search_ph')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isAdmin ? (
                    <button className="tactical-btn-accent" onClick={openCreateModal}>
                        <Send size={18} />
                        {t('customer.btn_init_cust')}
                    </button>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                        <ShieldAlert size={20}/> <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700}}>{t('customer.read_only')}</span>
                    </div>
                )}
            </div>

            {/* --- Customer Matrix Grid --- */}
            {loading ? (
                <div className="loading-state">{t('customer.loading')}</div>
            ) : (
                <div className="customer-grid">
                    {filteredCustomers.map(cust => (
                        <div key={cust.id} className="customer-plate">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            <div className="vents-container">
                                <Vent /><Vent /><Vent />
                            </div>

                            <div className="cust-header">
                                <span className="cust-id-stamp">{t('customer.route_id')} #{cust.id.toString().padStart(4, '0')}</span>
                                <h2 className="cust-name">{cust.customerName}</h2>
                            </div>

                            <div className="routing-well">
                                <div className="routing-row">
                                    <Phone size={14} className="icon-box"/> 
                                    <span className="mono-val">{cust.phone || t('customer.no_comm')}</span>
                                </div>
                                <div className="routing-row">
                                    <Mail size={14} className="icon-box"/> 
                                    <span className="mono-val">{cust.email || t('customer.no_data')}</span>
                                </div>
                                {/* ĐÃ SỬA LẠI: Thêm min-height hoặc padding để nội dung address nhiều dòng không bị lỗi */}
                                <div className="routing-row" style={{alignItems: 'flex-start', minHeight: '3rem'}}>
                                    <MapPin size={14} className="icon-box" style={{marginTop: '4px', minWidth: '14px'}}/> 
                                    <span className="address-val">{cust.address || t('customer.unknown_coord')}</span>
                                </div>
                            </div>

                            <div className="cust-footer">
                                <div className="status-module">
                                    <LedIndicator active={cust.isActive} />
                                    <TacticalToggle 
                                        isActive={cust.isActive} 
                                        onToggle={() => handleToggleStatus(cust.id)}
                                        disabled={!isAdmin}
                                    />
                                    <span className="toggle-label">{cust.isActive ? t('customer.active') : t('customer.closed')}</span>
                                </div>
                                {isAdmin && (
                                    <div className="action-buttons">
                                        <button className="icon-btn" onClick={() => openEditModal(cust)} title={t('customer.edit_title')}>
                                            <Edit3 size={16} />
                                        </button>
                                        <button className="icon-btn" onClick={() => confirmDelete(cust)} title={t('customer.delete_title')}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {filteredCustomers.length === 0 && (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}}>
                            {t('customer.no_custs')}
                        </div>
                    )}
                </div>
            )}

            {/* --- Tactile Entry Module --- */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={t('customer.modal_title')}>
                <form onSubmit={handleSave} style={{padding: '1rem 0'}}>
                    <div className="input-group-recessed">
                        <label>{t('customer.target_name')}</label>
                        <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)} required disabled={isSaving} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group-recessed">
                            <label>{t('customer.phone')}</label>
                            <input type="text" className="input-mono" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="input-group-recessed">
                            <label>{t('customer.email')}</label>
                            <input type="email" className="input-mono" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} disabled={isSaving}/>
                        </div>
                    </div>

                    <div className="input-group-recessed">
                        <label>{t('customer.address')}</label>
                        <textarea value={custAddress} onChange={(e) => setCustAddress(e.target.value)} rows={3} disabled={isSaving}/>
                    </div>

                    <div className="input-group-recessed" style={{flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
                        <label>{t('customer.status')}</label>
                        <TacticalToggle isActive={custIsActive} onToggle={() => setCustIsActive(!custIsActive)} disabled={isSaving} />
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                        <button type="submit" className="tactical-btn-accent" disabled={isSaving}>
                            <Map size={16} /> 
                            {currentCustomer ? t('customer.btn_update') : t('customer.btn_init_cust')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- Confirm Delete Modal --- */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title={t('customer.confirm_del_title')}
                message={`${t('customer.confirm_del_msg')} "${currentCustomer?.customerName}".`}
            />
        </div>
    );
};

export default CustomerConsole;