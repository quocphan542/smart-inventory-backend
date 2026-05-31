import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css'; // Import the new CSS
import logo from '../assets/logo.svg'; // Import the logo

// --- Helper Components for UI Elements ---
const CornerBolt = ({ position }) => <div className={`corner-bolt ${position}`}></div>;

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, error, isLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    };

    return (
        <div className="login-chassis">
            <div className="logo-container">
                <img src={logo} alt="Smart Inventory Logo" />
            </div>
            <div className="auth-module">
                <CornerBolt position="top-left" />
                <CornerBolt position="top-right" />
                <CornerBolt position="bottom-left" />
                <CornerBolt position="bottom-right" />

                <div className="lcd-header">
                    <h1 className="lcd-text">COMMERCE & LOGISTICS</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-well-group">
                        <input
                            type="text"
                            id="username"
                            className="input-well"
                            placeholder="AGENT_ID / USERNAME"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <div className="input-focus-led"></div>
                    </div>

                    <div className="input-well-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="input-well"
                            placeholder="PASSCODE"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <div className="input-focus-led"></div>
                    </div>

                    <div className="password-toggle-container">
                        <span className="toggle-label">DECRYPT PASSCODE</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <button type="submit" className={`auth-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        {isLoading ? 'AUTHENTICATING...' : 'INITIALIZE ACCESS'}
                    </button>

                    {error && <p className="error-message">** {error} **</p>}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;