import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Shield, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/RoleDropdown.css';

const RoleDropdown = ({ currentRole, onRoleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    
    // Mảng roles gốc (để gửi xuống Backend)
    // Đảm bảo các chuỗi này khớp với roleName từ Backend
    const roles = ['ADMIN', 'Thủ kho', 'Khách hàng'];

    const handleSelect = (role) => {
        onRoleChange(role); // Gọi hàm onRoleChange từ props
        setIsOpen(false);
    };

    // Xác định icon, class và nhãn hiển thị đa ngôn ngữ dựa trên role
    const getRoleStyles = (roleName) => {
        // Chuyển roleName từ Backend về dạng chuẩn để so sánh
        const normalizedRoleName = roleName ? roleName.toUpperCase() : '';

        if (normalizedRoleName === 'ADMIN') return { icon: <Shield size={14} />, class: 'admin', label: t('users.admin') };
        if (normalizedRoleName === 'THỦ KHO') return { icon: <User size={14} />, class: 'thukho', label: t('users.user') };
        if (normalizedRoleName === 'KHÁCH HÀNG') return { icon: <Users size={14} />, class: 'customer', label: t('users.customer') };
        // Mặc định nếu không khớp
        return { icon: <User size={14} />, class: 'default', label: roleName };
    };

    // Lấy style và label cho currentRole (từ database)
    const currentRoleDisplay = getRoleStyles(currentRole);

    // Sử dụng useEffect để đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.role-dropdown-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="role-dropdown-container">
            <button className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className={`role-tag-display ${currentRoleDisplay.class}`}>
                    {currentRoleDisplay.icon}
                    <span>{currentRoleDisplay.label}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {roles.map(role => {
                        const rStyle = getRoleStyles(role); // Lấy style và label cho từng option trong dropdown
                        return (
                            <div 
                                key={role} 
                                className="dropdown-item" 
                                onClick={() => handleSelect(role)} // Gửi roleName gốc (ví dụ: "ADMIN")
                            >
                                {rStyle.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RoleDropdown;