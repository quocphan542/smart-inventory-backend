import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Truck, Scale, Radar, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ThuKhoDashboard.css'; // Import the new CSS

// --- Sub-components ---

const OperatorHeader = ({ user, onLogout }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <header className="operator-header">
            <div className="operator-id">
                OPERATOR_ID: {user?.username?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="local-time">
                {time.toLocaleTimeString()}
            </div>
            <button onClick={onLogout} className="logout-trigger">
                <LogOut size={16} />
            </button>
        </header>
    );
};

const LaunchButton = ({ label, icon: Icon, path }) => {
    const navigate = useNavigate();
    return (
        <button className="module-launch-button" onClick={() => navigate(path)}>
            <Icon size={48} className="launch-button-icon" />
            <span className="launch-button-label">{label}</span>
        </button>
    );
};

const TelemetryLCD = () => (
    <div className="telemetry-lcd">
        <h3 className="telemetry-title">Active Task Telemetry</h3>
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

const HardwareLabel = ({ text }) => (
    <div className="hardware-label">{text}</div>
);

// --- Main Component ---

export const ThuKhoDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="ops-deck-container">
            <OperatorHeader user={user} onLogout={logout} />

            <div className="dashboard-main-grid">
                <div className="routing-matrix">
                    <LaunchButton label="NHẬP KHO" icon={PackagePlus} path="/thukho/inbound" />
                    <LaunchButton label="XUẤT KHO" icon={Truck} path="/thukho/outbound" />
                    <LaunchButton label="KIỂM KÊ" icon={Scale} path="/thukho/stock-taking" />
                    <LaunchButton label="TRA CỨU VỊ TRÍ" icon={Radar} path="/thukho/stock-lookup" />
                </div>
                <div className="telemetry-panel">
                    <TelemetryLCD />
                    <HardwareLabel text="FINANCIAL DATA OMITTED - LOGISTICS MODE ONLY" />
                </div>
            </div>
        </div>
    );
};