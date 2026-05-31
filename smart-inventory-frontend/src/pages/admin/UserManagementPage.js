import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, UserPlus, SlidersHorizontal, Trash2 } from 'lucide-react';
import userService from '../../services/userService';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';
import RoleDropdown from '../../components/RoleDropdown';
import ConfirmModal from '../../components/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/UserManagementPage.css';

// --- Helper Components for UI Elements ---
const Rivet = () => <div className="rivet"></div>;

const TacticalToggle = ({ isActive, onToggle, isLoading }) => (
    <button 
        className={`tactical-toggle ${isActive ? 'active' : ''}`} 
        onClick={onToggle}
        disabled={isLoading}
    >
        <div className="toggle-nub"></div>
    </button>
);

const LedIndicator = ({ active }) => (
    <div className={`led-bezel ${active ? 'active' : ''}`}>
        <div className="led-light"></div>
    </div>
);

// --- Main Component ---

const UserManagementPage = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleStatus = async (userId) => {
        setUpdatingId(userId);
        try {
            await userService.toggleStatus(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            setError('Failed to update user status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleChangeRole = async (userId, newRoleName) => {
        setUpdatingId(userId);
        let roleId = 2;
        if (newRoleName === 'Admin') roleId = 1;
        if (newRoleName === 'User') roleId = 2; 
        if (newRoleName === 'Customer') roleId = 3;

        try {
            await userService.changeRole(userId, roleId);
            setUsers(users.map(u => u.id === userId ? { ...u, roleName: newRoleName, roleId: roleId } : u));
        } catch (err) {
            setError('Failed to change user role.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setUpdatingId(userToDelete.id);
        try {
            await userService.delete(userToDelete.id);
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to delete user.');
        } finally {
            setUpdatingId(null);
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSaveUser = () => {
        setIsFormModalOpen(false);
        fetchUsers();
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => roleFilter === 'ALL' || user.roleName === roleFilter)
            .filter(user => {
                const term = searchTerm.toLowerCase();
                return (
                    user.fullName?.toLowerCase().includes(term) ||
                    user.email?.toLowerCase().includes(term) ||
                    user.username.toLowerCase().includes(term)
                );
            });
    }, [users, searchTerm, roleFilter]);

    return (
        <div className="page-chassis">
            <div className="console-header">
                <h1 className="console-title-stamp">{t('users.title')}</h1>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="filter-panel-well">
                <div className="search-input-recess">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('users.search_placeholder')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-toggle-group">
                    <SlidersHorizontal size={20} className="filter-icon" />
                    <span className="filter-label-stamp">{t('users.filter_role')}</span>
                    <button onClick={() => setRoleFilter('ALL')} className={`toggle-button ${roleFilter === 'ALL' ? 'active' : ''}`}>{t('users.all')}</button>
                    <button onClick={() => setRoleFilter('Admin')} className={`toggle-button ${roleFilter === 'Admin' ? 'active' : ''}`}>{t('users.admin')}</button>
                    <button onClick={() => setRoleFilter('User')} className={`toggle-button ${roleFilter === 'User' ? 'active' : ''}`}>{t('users.user')}</button>
                    <button onClick={() => setRoleFilter('Customer')} className={`toggle-button ${roleFilter === 'Customer' ? 'active' : ''}`}>{t('users.customer')}</button>
                </div>
            </div>

            <div className="operator-grid-panel">
                <Rivet /><Rivet /><Rivet /><Rivet />
                <div className="grid-header">
                    <span className="grid-title-stamp">{t('users.directory')} ({filteredUsers.length} {t('users.results')})</span>
                    <button className="register-operator-btn" onClick={() => setIsFormModalOpen(true)}>
                        <UserPlus size={16} />
                        <span>{t('users.register_btn')}</span>
                    </button>
                </div>
                <div className="table-well">
                    {loading ? (
                        <div className="loading-state">{t('users.loading')}</div>
                    ) : (
                        <table className="operator-table">
                            <thead>
                                <tr>
                                    <th>{t('users.col_status')}</th>
                                    <th>{t('users.col_id')}</th>
                                    <th>{t('users.col_name')}</th>
                                    <th>{t('users.col_email')}</th>
                                    <th>{t('users.col_role')}</th>
                                    <th>{t('users.col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className={updatingId === user.id ? 'row-loading' : ''}>
                                        <td>
                                            <div className="status-cell">
                                                <LedIndicator active={user.isActive} />
                                            </div>
                                        </td>
                                        <td className="id-stamp">#{user.id}</td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="full-name">{user.fullName || 'N/A'}</span>
                                                <span className="username-stamp">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="email-cell">{user.email || 'N/A'}</td>
                                        <td>
                                            <RoleDropdown 
                                                currentRole={user.roleName}
                                                onRoleChange={(newRole) => handleChangeRole(user.id, newRole)}
                                            />
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <TacticalToggle 
                                                    isActive={user.isActive} 
                                                    onToggle={() => handleToggleStatus(user.id)}
                                                    isLoading={updatingId === user.id}
                                                />
                                                <button className="delete-btn" title={t('common.delete')} onClick={() => handleOpenDeleteModal(user)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={t('users.modal_register_title')}>
                <UserForm onSave={handleSaveUser} />
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('users.confirm_del_title')}
                message={`${t('users.confirm_del_msg')} "${userToDelete?.username}"? ${t('users.confirm_del_msg2')}`}
            />
        </div>
    );
};

export default UserManagementPage;