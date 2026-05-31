import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Form.css'; 

const UserForm = ({ onSave }) => {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roleId, setRoleId] = useState('2'); // Mặc định là Thủ kho (2)

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password || !fullName || !roleId) {
            setError('Username, Password, Full Name, and Role are required.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        const userData = {
            username,
            password,
            roleId: parseInt(roleId), // Gửi roleId thay vì roleName
            fullName,
            email,
            phone,
            isActive: true
        };

        try {
            await authService.register(userData);
            onSave();
        } catch (err) {
            const errorMessage = err.message || 'Registration failed. The username might already exist.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            {error && <div className="form-error-banner">{error}</div>}
            
            <div className="form-group">
                <label htmlFor="username">{t('users.form_username')}</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} placeholder="e.g., new_staff_01" />
            </div>
            <div className="form-group">
                <label htmlFor="password">{t('users.form_pass')}</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
                <label htmlFor="fullName">{t('users.form_fullname')}</label>
                <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
                <label htmlFor="email">{t('users.form_email')}</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
                <label htmlFor="phone">{t('users.form_phone')}</label>
                <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
                <label htmlFor="roleId">{t('users.form_role')}</label>
                <select id="roleId" value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={loading}>
                    <option value="2">{t('users.user')}</option>
                    <option value="1">{t('users.admin')}</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="submit" className="form-submit-btn" disabled={loading}>
                    {loading ? t('users.btn_registering') : t('users.btn_register')}
                </button>
            </div>
        </form>
    );
};

export default UserForm;