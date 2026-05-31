import React from 'react';
import Modal from './Modal';
import { useLanguage } from '../context/LanguageContext';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { t } = useLanguage();

    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="confirm-modal-container">
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;