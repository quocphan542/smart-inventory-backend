import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Cpu, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext'; // IMPORT
import '../../styles/AdminDashboard.css';

// --- Helper Components for UI Elements ---
const Rivet = () => <div className="rivet"></div>;

const WidgetPanel = ({ title, children, className = '' }) => (
    <div className={`widget-panel ${className}`}>
        <Rivet /> <Rivet /> <Rivet /> <Rivet />
        <div className="widget-header">
            <span className="widget-title-stamp">{title}</span>
        </div>
        <div className="widget-content">
            {children}
        </div>
    </div>
);

const TacticalButton = ({ children, onClick, isLoading, accent = false }) => (
    <button onClick={onClick} disabled={isLoading} className={`tactical-button ${accent ? 'accent' : ''}`}>
        {isLoading ? <div className="spinner"></div> : children}
    </button>
);

const LedIndicator = ({ active }) => (
    <div className="led-bezel">
        <div className={`led-light ${active ? 'active' : ''}`}></div>
    </div>
);

export const AdminDashboard = () => {
    const { t } = useLanguage(); // SỬ DỤNG HOOK
    const [isSyncing, setIsSyncing] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalStockValuation: 0,
        pendingUserActivations: 0,
        recentLogs: [],
        latestForecast: null,
    });

    const fetchDashboardData = useCallback(async () => {
        setIsSyncing(true);
        setError('');
        try {
            // SỬA LẠI: Gọi đúng tên hàm là getDashboardStats
            const data = await dashboardService.getDashboardStats();
            setStats(data);
        } catch (err) {
            setError('Failed to fetch dashboard data.');
            console.error(err);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="dashboard-container">
            {/* --- Header --- */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">{t('dashboard.title')}</h1>
                <div className="sync-control-unit">
                    <span className="sync-label-stamp">{t('dashboard.core_data')}</span>
                    <button onClick={fetchDashboardData} disabled={isSyncing} className="sync-switch">
                        <RefreshCw size={20} className={`sync-icon ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* --- Main Grid --- */}
            <div className="dashboard-grid">
                
                {/* Financial Core */}
                <WidgetPanel title={t('dashboard.financial_core')} className="valuation-widget">
                    <p className="valuation-label">{t('dashboard.total_stock_val')}</p>
                    <p className="valuation-amount">
                        <span className="currency-symbol">$</span>
                        {(stats.totalStockValuation || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="access-indicator">
                        <ShieldCheck size={14} />
                        <span>{t('dashboard.admin_unlocked')}</span>
                    </div>
                </WidgetPanel>

                {/* Personnel Gate */}
                <WidgetPanel title={t('dashboard.rbac_gate')} className="personnel-widget">
                    <p className="personnel-metric-value">{stats.pendingUserActivations || 0}</p>
                    <p className="personnel-metric-label">{t('dashboard.pending_staff')}</p>
                    <div className="personnel-alert-system">
                        <LedIndicator active={stats.pendingUserActivations > 0} />
                        <span className="alert-status-text">{t('dashboard.system_alert')}</span>
                    </div>
                </WidgetPanel>

                {/* AI Forecast Engine */}
                <div className="crt-screen-container">
                    <div className="crt-screen-bezel">
                        <div className="crt-screen-content">
                            <div className="crt-header">
                                <p className="crt-title">{t('dashboard.ai_forecast')}</p>
                                <p className="crt-status">{t('dashboard.status')}: <span className="crt-status-ok">{t('dashboard.nominal')}</span></p>
                            </div>
                            {stats.latestForecast ? (
                                <div className="crt-telemetry">
                                    <div className="telemetry-item">
                                        <p className="telemetry-label">{t('dashboard.target_sku')}:</p>
                                        <p className="telemetry-value code">{stats.latestForecast.productName}</p>
                                    </div>
                                    <div className="telemetry-item">
                                        <p className="telemetry-label">{t('dashboard.predicted_demand')}:</p>
                                        <p className="telemetry-value numeric">{stats.latestForecast.predictedDemand} {t('dashboard.units')}</p>
                                    </div>
                                    <div className="telemetry-item">
                                        <p className="telemetry-label">{t('dashboard.confidence')}:</p>
                                        <p className="telemetry-value confidence">{stats.latestForecast.confidenceInterval}%</p>
                                    </div>
                                </div>
                            ) : <p className="no-data-crt">{t('dashboard.no_forecast')}</p>}
                            <TacticalButton accent={true}>
                                <Cpu size={16} />
                                <span>{t('dashboard.approve_order')}</span>
                            </TacticalButton>
                        </div>
                    </div>
                </div>

                {/* Audit Trail */}
                <WidgetPanel title={t('dashboard.audit_trail')} className="audit-widget">
                    <div className="audit-warning">
                        <AlertTriangle size={16} />
                        <span>{t('dashboard.audit_warning')}</span>
                    </div>
                    <div className="audit-table-well">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>{t('dashboard.log_id')}</th>
                                    <th>{t('dashboard.operator')}</th>
                                    <th>{t('dashboard.action')}</th>
                                    <th>{t('dashboard.product')}</th>
                                    <th>{t('dashboard.delta')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentLogs && stats.recentLogs.length > 0 ? (
                                    stats.recentLogs.map(log => (
                                        <tr key={log.id}>
                                            <td className="log-id">#{log.id}</td>
                                            <td className="log-op">{log.operatorUsername || 'N/A'}</td>
                                            <td className={`log-type type-${log.transactionType?.toLowerCase()}`}>
                                                {log.transactionType === 'RECEIPT' && <CheckCircle size={14} />}
                                                {log.transactionType === 'ISSUE' && <MinusCircle size={14} />}
                                                {log.transactionType === 'ADJUSTMENT' && <AlertTriangle size={14} />}
                                                <span>{log.transactionType}</span>
                                            </td>
                                            <td className="log-sku">{log.productName}</td>
                                            <td className={`log-delta ${log.quantity > 0 ? 'positive' : 'negative'}`}>
                                                {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>{t('dashboard.no_logs')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </WidgetPanel>

            </div>
        </div>
    );
};

export default AdminDashboard;