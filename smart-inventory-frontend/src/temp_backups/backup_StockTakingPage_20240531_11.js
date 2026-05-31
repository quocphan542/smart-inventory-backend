import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import adjustmentService from '../../services/adjustmentService'; // SỬ DỤNG SERVICE CHO PHIẾU KIỂM KÊ
import '../../styles/StockTakingPage.css'; // SỬ DỤNG CSS MỚI

// --- Sub-components ---

const AdjustmentModal = ({ isOpen, onClose, onSave, adjustment }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(adjustment || {});
    }, [adjustment]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{adjustment ? 'Edit Adjustment' : 'Create New Adjustment'}</h2>
                    <button className="btn-action" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Adjustment Code</label>
                        <input type="text" name="adjustmentCode" value={formData.adjustmentCode || ''} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reason</label>
                        <input type="text" name="reason" value={formData.reason || ''} onChange={handleChange} className="form-input" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="heavy-duty-btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="heavy-duty-btn" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

const StockTakingPage = () => {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdjustment, setSelectedAdjustment] = useState(null);

    const fetchAdjustments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adjustmentService.getAll();
            setAdjustments(data);
        } catch (error) {
            console.error("Failed to fetch adjustments:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdjustments();
    }, [fetchAdjustments]);

    const handleOpenCreateModal = () => {
        setSelectedAdjustment(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (adjustment) => {
        setSelectedAdjustment(adjustment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAdjustment(null);
    };

    const handleSave = async (data) => {
        try {
            const payload = { ...data }; // Customize payload as needed
            if (data.id) {
                await adjustmentService.update(data.id, payload);
            } else {
                await adjustmentService.create(payload);
            }
            fetchAdjustments();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save adjustment:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this adjustment?')) {
            try {
                await adjustmentService.delete(id);
                fetchAdjustments();
            } catch (error) {
                console.error("Failed to delete adjustment:", error);
            }
        }
    };

    return (
        <div className="crud-page-container">
            <div className="page-header">
                <h1 className="page-title">Stock Adjustments</h1>
                <button className="heavy-duty-btn" onClick={handleOpenCreateModal}>
                    <Plus size={20} />
                    <span>New Adjustment</span>
                </button>
            </div>

            <div className="data-table-panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Adjustment Code</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : (
                            adjustments.map(adj => (
                                <tr key={adj.id}>
                                    <td className="monospace">{adj.adjustmentCode}</td>
                                    <td>{adj.reason}</td>
                                    <td>{new Date(adj.adjustmentDate).toLocaleDateString()}</td>
                                    <td>{adj.status || 'COMPLETED'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-action" onClick={() => handleOpenEditModal(adj)}><Edit size={16} /></button>
                                            <button className="btn-action" onClick={() => handleDelete(adj.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdjustmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                adjustment={selectedAdjustment}
            />
        </div>
    );
};

export default StockTakingPage;