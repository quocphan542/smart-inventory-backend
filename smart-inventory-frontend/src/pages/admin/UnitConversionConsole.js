import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ShieldAlert, Cpu } from 'lucide-react';
import unitService from '../../services/unitService';
import unitConversionService from '../../services/unitConversionService';
import productService from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/UnitConversionConsole.css';

const Rivet = () => <div className="rivet"></div>;

const UnitConversionConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    // So sánh không phân biệt chữ hoa chữ thường
    const isAdmin = user?.roleName?.toLowerCase() === 'admin';

    const [activeTab, setActiveTab] = useState('BASE_UNITS');

    const [units, setUnits] = useState([]);
    const [conversions, setConversions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitDesc, setNewUnitDesc] = useState('');

    const [selectedProductId, setSelectedProductId] = useState('');
    const [fromUnitId, setFromUnitId] = useState('');
    const [toUnitId, setToUnitId] = useState('');
    const [factor, setFactor] = useState(1);

    const [isConfirmDeleteUnitOpen, setIsConfirmDeleteUnitOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [isConfirmDeleteConvOpen, setIsConfirmDeleteConvOpen] = useState(false);
    const [convToDelete, setConvToDelete] = useState(null);

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

    const handleAddUnit = async (e) => {
        e.preventDefault();
        if (!newUnitName) return;
        try {
            await unitService.create({ unitName: newUnitName, description: newUnitDesc });
            setNewUnitName('');
            setNewUnitDesc('');
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to register unit.');
        }
    };

    const confirmDeleteUnit = (unit) => {
        setUnitToDelete(unit);
        setIsConfirmDeleteUnitOpen(true);
    };

    const handleDeleteUnit = async () => {
        if (!unitToDelete) return;
        try {
            await unitService.delete(unitToDelete.id);
            fetchData();
        } catch (err) {
            setError(err.message || 'Cannot delete unit. It might be in use.');
        } finally {
            setIsConfirmDeleteUnitOpen(false);
            setUnitToDelete(null);
        }
    };

    const handleAddConversion = async (e) => {
        e.preventDefault();
        if (!selectedProductId || !fromUnitId || !toUnitId || !factor) return;
        try {
            await unitConversionService.create({
                productId: selectedProductId,
                fromUnitId: fromUnitId,
                toUnitId: toUnitId,
                factor: factor
            });
            setSelectedProductId('');
            setFromUnitId('');
            setToUnitId('');
            setFactor(1);
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to compile conversion protocol.');
        }
    };

    const confirmDeleteConv = (conv) => {
        setConvToDelete(conv);
        setIsConfirmDeleteConvOpen(true);
    };

    const handleDeleteConv = async () => {
        if (!convToDelete) return;
        try {
            await unitConversionService.delete(convToDelete.id);
            fetchData();
        } catch (err) {
            setError('Failed to purge conversion logic.');
        } finally {
            setIsConfirmDeleteConvOpen(false);
            setConvToDelete(null);
        }
    };

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
                            {isAdmin ? (
                                <div className="provisioning-well" style={{boxShadow: 'none', background: 'transparent', padding: '0'}}>
                                    <div className="panel-header mb-4">
                                        <Plus className="panel-icon" size={20} />
                                        <span className="panel-title-stamp">{t('unit.add_unit_title')}</span>
                                    </div>
                                    <form onSubmit={handleAddUnit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                        <div className="input-group-recessed">
                                            <label>{t('unit.unit_id_label')}</label>
                                            <input type="text" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} required />
                                        </div>
                                        <div className="input-group-recessed">
                                            <label>{t('unit.desc_label')}</label>
                                            <input type="text" value={newUnitDesc} onChange={e => setNewUnitDesc(e.target.value)} style={{textTransform: 'none'}} />
                                        </div>
                                        <button type="submit" className="tactical-btn-accent" style={{marginTop: '1rem'}}>
                                            {t('unit.btn_init_unit')}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="empty-blueprint-warning" style={{justifyContent: 'flex-start'}}>
                                    <ShieldAlert size={32} />
                                    <span>{t('unit.admin_req')}</span>
                                </div>
                            )}

                            <div>
                                <div className="panel-header mb-4">
                                    <Cpu className="panel-icon" size={20} />
                                    <span className="panel-title-stamp">{t('unit.active_units_title')}</span>
                                </div>
                                <div className="unit-badge-grid">
                                    {units.map(u => (
                                        <div key={u.id} className="unit-badge">
                                            {isAdmin && (
                                                <button className="slot-delete-btn" style={{position: 'absolute', top: '4px', left: '4px'}} onClick={() => confirmDeleteUnit(u)}>
                                                    <Trash2 size={12} color="#ef4444"/>
                                                </button>
                                            )}
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
                            
                            {isAdmin && (
                                <div className="logic-board-well mb-6">
                                    <span className="panel-title-stamp" style={{color: '#94a3b8'}}>{t('unit.logic_engine_title')}</span>
                                    <form className="logic-row" onSubmit={handleAddConversion}>
                                        <div className="logic-block">
                                            <span className="logic-label">{t('unit.target_prod')}</span>
                                            <select className="logic-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
                                                <option value="">{t('unit.select_prod')}</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.productName} ({p.sku})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="logic-block">
                                            <span className="logic-label">{t('unit.from_unit')}</span>
                                            <select className="logic-select" value={fromUnitId} onChange={e => setFromUnitId(e.target.value)} required>
                                                <option value="">{t('unit.select_from')}</option>
                                                {units.map(u => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                            </select>
                                        </div>

                                        <span className="logic-operator">=</span >

                                        <div className="lcd-screen">
                                            <input type="number" step="0.01" min="0.01" className="lcd-input" value={factor} onChange={e => setFactor(e.target.value)} required />
                                        </div>

                                        <span className="logic-operator">x</span >

                                        <div className="logic-block">
                                            <span className="logic-label">{t('unit.to_unit')}</span>
                                            <select className="logic-select" value={toUnitId} onChange={e => setToUnitId(e.target.value)} required>
                                                <option value="">{t('unit.select_to')}</option>
                                                {units.map(u => <option key={u.id} value={u.id}>{u.unitName}</option>)}
                                            </select>
                                        </div>

                                        <button type="submit" className="tactical-btn-accent" style={{marginLeft: 'auto'}}>
                                            {t('unit.btn_compile')}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="provisioning-well">
                                <span className="panel-title-stamp mb-4 block">{t('unit.ledger_title')}</span>
                                <div style={{overflowX: 'auto'}}>
                                    <table className="matrix-table">
                                        <thead>
                                            <tr>
                                                <th>{t('unit.col_proto_id')}</th>
                                                <th>{t('unit.col_prod')}</th>
                                                <th>{t('unit.col_logic')}</th>
                                                {isAdmin && <th>{t('unit.col_action')}</th>}
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
                                                    {isAdmin && (
                                                        <td>
                                                            <button className="slot-action-btn delete" style={{opacity: 1, position: 'static'}} onClick={() => confirmDeleteConv(c)}>
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={isAdmin ? 4 : 3} style={{textAlign: 'center', opacity: 0.5}}>{t('unit.no_protocols')}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                isOpen={isConfirmDeleteUnitOpen}
                onClose={() => setIsConfirmDeleteUnitOpen(false)}
                onConfirm={handleDeleteUnit}
                title={t('unit.confirm_del_unit_title')}
                message={`${t('unit.confirm_del_unit_msg')} "${unitToDelete?.unitName}"?`}
            />

            <ConfirmModal
                isOpen={isConfirmDeleteConvOpen}
                onClose={() => setIsConfirmDeleteConvOpen(false)}
                onConfirm={handleDeleteConv}
                title={t('unit.confirm_del_conv_title')}
                message={`${t('unit.confirm_del_conv_msg')} #${convToDelete?.productId}?`}
            />
        </div>
    );
};

export default UnitConversionConsole;