import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Cpu, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/ThuKhoDashboard.css'; // Sửa lại đường dẫn CSS

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

// Đổi tên component
export const ThuKhoDashboard = () => {
    const { t } = useLanguage();
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
            <div className="dashboard-header">
                <h1 className="dashboard-title">OPERATOR DASHBOARD</h1>
                <div className="sync-control-unit">
                    <span className="sync-label-stamp">CORE DATA</span>
                    <button onClick={fetchDashboardData} disabled={isSyncing} className="sync-switch">
                        <RefreshCw size={20} className={`sync-icon ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="dashboard-grid">
                
                {/* Tinh giản: Ẩn các thông tin tài chính */}
                {/* <WidgetPanel title="FINANCIAL CORE" className="valuation-widget"> ... </WidgetPanel> */}

                <WidgetPanel title="PENDING TASKS" className="personnel-widget">
                    <p className="personnel-metric-value">{stats.pendingUserActivations || 0}</p>
                    <p className="personnel-metric-label">PENDING ACTIVATIONS</p>
                    <div className="personnel-alert-system">
                        <LedIndicator active={stats.pendingUserActivations > 0} />
                        <span className="alert-status-text">SYSTEM ALERT</span>
                    </div>
                </WidgetPanel>

                {/* Tinh giản: Ẩn AI Forecast */}
                {/* <div className="crt-screen-container"> ... </div> */}

                <WidgetPanel title="AUDIT TRAIL" className="audit-widget">
                    <div className="audit-table-well">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>LOG ID</th>
                                    <th>OPERATOR</th>
                                    <th>ACTION</th>
                                    <th>PRODUCT</th>
                                    <th>DELTA</th>
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
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>No recent logs.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </WidgetPanel>

            </div>
        </div>
    );
};

export default ThuKhoDashboard;