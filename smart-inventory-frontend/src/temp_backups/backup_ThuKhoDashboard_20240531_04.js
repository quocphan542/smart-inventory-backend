import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Truck, Scale, Radar, AlertTriangle, Clock } from 'lucide-react';
import '../../styles/ThuKhoDashboard.css'; // Import the new CSS

// --- Sub-components ---

const LevelMeter = ({ title, value, percentage }) => (
    <div className="level-meter-module">
        <h3 className="meter-title">{title}</h3>
        <div className="meter-well">
            <div className="meter-fill" style={{ height: `${percentage}%` }}></div>
        </div>
        <p className="meter-value">{value}</p>
    </div>
);

const AlertsLCD = () => (
    <div className="alerts-lcd">
        <div className="alert-line amber">
            <AlertTriangle size={20} />
            <span>03 PENDING DISPATCHES</span>
        </div>
        <div className="alert-line red">
            <Clock size={20} />
            <span>02 EXPIRY WARNINGS</span>
        </div>
    </div>
);

const ActionButton = ({ label, icon: Icon, path }) => {
    const navigate = useNavigate();
    return (
        <button className="action-button" onClick={() => navigate(path)}>
            <Icon size={28} className="action-button-icon" />
            <span>{label}</span>
        </button>
    );
};

const LogItem = ({ log }) => (
    <li className="log-item">
        <div className={`log-icon ${log.type}`}></div>
        <span className="log-message">{log.message}</span>
        <span className="log-time">{log.time}</span>
    </li>
);

// --- Main Component ---

export const ThuKhoDashboard = () => {
    const activityLogs = [
        { type: 'inbound', message: 'Receipt #R-7712 processed.', time: '2m' },
        { type: 'outbound', message: 'Order #SO-9821 fulfilled.', time: '15m' },
        { type: 'alert', message: 'Low stock warning for SKU: 8-BIT-MCU.', time: '1h' },
    ];

    return (
        <div className="monitoring-station-container">
            <div className="dashboard-main-grid">
                
                {/* --- Telemetry Deck (Left Side) --- */}
                <div className="telemetry-deck">
                    <div className="kpi-meter-grid">
                        <LevelMeter title="Warehouse Capacity" value="78%" percentage={78} />
                        <LevelMeter title="Order Fulfillment" value="92%" percentage={92} />
                    </div>
                    <AlertsLCD />
                </div>

                {/* --- Action Bay (Right Side) --- */}
                <div className="action-bay">
                    <div className="action-panel">
                        <h3 className="section-title">Core Operations</h3>
                        <div className="action-buttons-grid">
                            <ActionButton label="Inbound" icon={PackagePlus} path="/thukho/inbound" />
                            <ActionButton label="Outbound" icon={Truck} path="/thukho/outbound" />
                            <ActionButton label="Audit" icon={Scale} path="/thukho/stock-taking" />
                            <ActionButton label="Radar" icon={Radar} path="/thukho/stock-lookup" />
                        </div>
                    </div>
                    <div className="log-panel">
                        <h3 className="section-title">Activity Feed</h3>
                        <ul className="log-list">
                            {activityLogs.map((log, index) => (
                                <LogItem key={index} log={log} />
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};