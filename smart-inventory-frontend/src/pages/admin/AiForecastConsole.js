import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, Cpu, Target, ShieldAlert, Fingerprint, Search } from 'lucide-react';
import aiDemandService from '../../services/aiDemandService';
import productService from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/AiForecastConsole.css';

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const TacticalButton = ({ children, onClick, isLoading, accent = false, secondary = false }) => (
    <button onClick={onClick} disabled={isLoading} className={`tactical-button ${accent ? 'accent' : ''} ${secondary ? 'secondary' : ''}`}>
        {isLoading ? <div className="spinner"></div> : children}
    </button>
);

const AiForecastConsole = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.roleName === 'ADMIN';

    // Data States
    const [forecasts, setForecasts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter/Selection State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [forecastData, productData] = await Promise.all([
                aiDemandService.getAll(),
                productService.getAll()
            ]);
            setForecasts(forecastData || []);
            setProducts(productData.filter(p => p.isActive) || []);
            if (forecastData && forecastData.length > 0) {
                setSelectedProductId(forecastData[0].productId);
            }
        } catch (err) {
            setError(t('forecast.err_connect') || 'Failed to connect to Cognitive Engine.');
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [fetchData]);

    const activeForecast = forecasts.find(f => f.productId.toString() === selectedProductId.toString());

    const getConfidenceGauge = (score) => {
        const num = parseFloat(score);
        if (num >= 90) return { class: 'high', label: 'HIGH' };
        if (num >= 70) return { class: 'medium', label: 'MEDIUM' };
        return { class: 'low', label: 'LOW (OVERRIDE RECOMMENDED)' };
    };

    const confidence = activeForecast ? getConfidenceGauge(activeForecast.confidenceInterval) : { class: 'low', label: 'N/A' };

    return (
        <div className="forecast-chassis">
            <h1 className="console-title-stamp">{t('forecast.title') || 'COGNITIVE PREDICTIVE ENGINE'}</h1>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="terminal-housing">
                <Rivet /><Rivet /><Rivet /><Rivet />

                {/* --- Engine Status Header --- */}
                <div className="engine-header">
                    <div className="engine-status">
                        <div className="engine-led"></div>
                        <span className="engine-label">{t('forecast.core_active') || 'AI_CORE_ACTIVE'}</span>
                    </div>
                    <span className="timestamp">{currentTime.toLocaleTimeString()}</span>
                </div>

                {/* --- Product Selector --- */}
                <div className="input-group-recessed" style={{marginBottom: '2rem'}}>
                    <label>{t('forecast.select_product') || 'SELECT TARGET SKU FOR ANALYSIS'}</label>
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={loading}>
                        <option value="">{t('forecast.select_prompt') || '-- SCANNING TARGETS --'}</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.productName} [{p.sku}]</option>)}
                    </select>
                </div>

                {/* --- CRT Screen --- */}
                <div className="crt-screen-bezel">
                    <div className="crt-screen-content">
                        {loading ? (
                            <div className="loading-state" style={{color: 'var(--crt-text)'}}>{t('forecast.loading') || 'AWAITING TELEMETRY...'}</div>
                        ) : activeForecast ? (
                            <div className="crt-grid">
                                <div className="telemetry-block">
                                    <p className="telemetry-label">{t('forecast.target_date') || 'FORECAST_DATE'}</p>
                                    <p className="telemetry-value medium">{new Date(activeForecast.forecastDate).toLocaleDateString()}</p>
                                    
                                    <p className="telemetry-label" style={{marginTop: '1rem'}}>{t('forecast.confidence_interval') || 'CONFIDENCE_INTERVAL'}</p>
                                    <p className={`telemetry-value medium ${confidence.class}`}>{confidence.label}</p>
                                    <div className="confidence-gauge">
                                        <div className={`gauge-bar ${confidence.class}`} style={{width: `${activeForecast.confidenceInterval}%`}}></div>
                                    </div>
                                </div>
                                <div className="telemetry-block" style={{alignItems: 'flex-end'}}>
                                    <p className="telemetry-label">{t('forecast.predicted_demand') || 'PREDICTED_DEMAND'}</p>
                                    <p className="telemetry-value large">
                                        {activeForecast.predictedDemand.toLocaleString()} 
                                        <span style={{fontSize: '1.5rem', opacity: 0.7, marginLeft: '8px'}}>{t('forecast.units') || 'UNITS'}</span>
                                    </p>
                                    <div className="visualizer">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className="viz-bar" style={{height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s`}}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-data-crt">
                                <ShieldAlert size={48} />
                                <p>{t('forecast.no_data') || 'NO PREDICTIVE DATA FOR SELECTED TARGET'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Decision Board --- */}
                <div className="decision-board">
                    <div className="caution-stripes"></div>
                    <TacticalButton accent={true} disabled={!activeForecast}>
                        <Cpu size={18} />
                        <span>{t('forecast.approve_btn') || 'APPROVE AI RECOMMENDATION'}</span>
                    </TacticalButton>
                    <TacticalButton secondary={true} disabled={!activeForecast}>
                        <ShieldAlert size={18} />
                        <span>{t('forecast.override_btn') || 'MANUAL OVERRIDE'}</span>
                    </TacticalButton>
                </div>

                <div className="clearance-badge">
                    <Fingerprint size={14} />
                    <span>{t('forecast.clearance') || 'CLEARANCE: ADMIN ONLY'}</span>
                </div>
            </div>
        </div>
    );
};

export default AiForecastConsole;