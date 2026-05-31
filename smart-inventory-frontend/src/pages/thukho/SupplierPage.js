import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Truck, Edit3, Trash2, ShieldAlert, Phone, Mail, MapPin, Hash, Activity } from 'lucide-react';
import supplierService from '../../services/supplierService';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/SupplierPage.css'; // SỬ DỤNG CSS MỚI

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
export const SupplierPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                    <ShieldAlert size={20}/> <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700}}>{t('supplier.read_only')}</span>
                </div>
            </div>

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
                                        onToggle={() => {}}
                                        disabled={true}
                                    />
                                    <span className="toggle-label" style={{marginLeft: '8px'}}>{sup.isActive ? t('supplier.online') : t('supplier.offline')}</span>
                                </div>
                                {/* Tinh giản: Ẩn nút sửa/xóa */}
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
        </div>
    );
};

export default SupplierPage;