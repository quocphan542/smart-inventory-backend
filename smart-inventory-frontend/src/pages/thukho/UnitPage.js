import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ShieldAlert, Cpu } from 'lucide-react';
import unitService from '../../services/unitService';
import unitConversionService from '../../services/unitConversionService';
import productService from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/UnitPage.css'; // SỬ DỤNG CSS MỚI

const Rivet = () => <div className="rivet"></div>;

// ĐỔI TÊN COMPONENT
const UnitPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName?.toLowerCase() === 'admin';

    const [activeTab, setActiveTab] = useState('BASE_UNITS');

    const [units, setUnits] = useState([]);
    const [conversions, setConversions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [uData, cData, pData] = await Promise.all([
                unitService.getAll(),
                unitConversionService.getAll(),
                productService.getAll()
            ]);
            setUnits(uData);
            setConversions(cData);
            setProducts(pData);
        } catch (err) {
            setError(t('unit.loading'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="unit-chassis">
            <div className="console-title-stamp">{t('unit.title')}</div>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="mode-switch-board">
                <div className="tactical-segmented-switch">
                    <button 
                        className={`switch-btn ${activeTab === 'BASE_UNITS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('BASE_UNITS')}
                    >
                        {t('unit.tab_base')}
                    </button>
                    <button 
                        className={`switch-btn ${activeTab === 'CONVERSION' ? 'active' : ''}`}
                        onClick={() => setActiveTab('CONVERSION')}
                    >
                        {t('unit.tab_conv')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">{t('unit.loading')}</div>
            ) : (
                <>
                    {activeTab === 'BASE_UNITS' && (
                        <div className="hardware-panel panel-grid">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            <div className="empty-blueprint-warning" style={{justifyContent: 'flex-start'}}>
                                <ShieldAlert size={32} />
                                <span>{t('unit.readonly_msg')}</span>
                            </div>

                            <div>
                                <div className="panel-header mb-4">
                                    <Cpu className="panel-icon" size={20} />
                                    <span className="panel-title-stamp">{t('unit.active_units_title')}</span>
                                </div>
                                <div className="unit-badge-grid">
                                    {units.map(u => (
                                        <div key={u.id} className="unit-badge">
                                            <span className="unit-name">{u.unitName}</span>
                                            <span className="unit-desc">{u.description || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CONVERSION' && (
                        <div className="hardware-panel">
                            <Rivet /><Rivet /><Rivet /><Rivet />
                            
                            <div className="provisioning-well">
                                <span className="panel-title-stamp mb-4 block">{t('unit.ledger_title')}</span>
                                <div style={{overflowX: 'auto'}}>
                                    <table className="matrix-table">
                                        <thead>
                                            <tr>
                                                <th>{t('unit.col_proto_id')}</th>
                                                <th>{t('unit.col_prod')}</th>
                                                <th>{t('unit.col_logic')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {conversions.length > 0 ? conversions.map(c => (
                                                <tr key={c.id}>
                                                    <td style={{fontFamily: 'var(--font-mono)'}}>#{c.id}</td>
                                                    <td>{c.productName}</td>
                                                    <td>
                                                        <span style={{fontFamily: 'var(--font-mono)', fontWeight: 'bold'}}>{c.fromUnitName}</span>
                                                        <span style={{margin: '0 10px', color: 'var(--text-secondary)'}}> = </span>
                                                        <span className="matrix-lcd-factor">{c.factor}</span>
                                                        <span style={{margin: '0 10px', color: 'var(--text-secondary)'}}> x </span>
                                                        <span style={{fontFamily: 'var(--font-mono)', fontWeight: 'bold'}}>{c.toUnitName}</span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} style={{textAlign: 'center', opacity: 0.5}}>{t('unit.no_protocols')}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UnitPage;