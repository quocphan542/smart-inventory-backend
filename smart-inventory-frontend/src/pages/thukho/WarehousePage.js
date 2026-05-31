import React, { useState, useEffect, useCallback } from 'react';
import { Factory, MapPin, Plus, Save, Layers, Settings2, ShieldAlert, Trash2, Edit2, Edit } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import warehouseLocationService from '../../services/warehouseLocationService';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/WarehousePage.css'; // SỬ DỤNG CSS MỚI

// --- Helper Components ---
const Rivet = () => <div className="rivet"></div>;
const Vent = () => <div className="vent-slot"></div>;

const TacticalToggle = ({ isActive, onToggle, isLoading }) => (
    <button 
        className={`tactical-toggle ${isActive ? 'active' : ''}`} 
        onClick={onToggle}
        disabled={isLoading}
    >
        <div className="toggle-nub"></div>
    </button>
);

const formatCode = (input, prefix) => {
    const trimmed = input.trim().toUpperCase(); 
    if (!trimmed) return '';
    return trimmed;
};

// ĐỔI TÊN COMPONENT
const WarehousePage = () => {
    // State for Warehouses
    const [warehouses, setWarehouses] = useState([]);
    const [activeWarehouse, setActiveWarehouse] = useState(null);
    const [loadingWarehouses, setLoadingWarehouses] = useState(true);
    const [updatingWarehouseId, setUpdatingWarehouseId] = useState(null);

    // State for Locations
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    
    // State for Provisioning Panel (Create Location)
    const [zoneCode, setZoneCode] = useState('');
    const [shelfCode, setShelfCode] = useState('');
    const [binCode, setBinCode] = useState('');
    const [description, setDescription] = useState(''); 
    const [isCreatingLocation, setIsCreatingLocation] = useState(false);

    // State for Edit Location Modal
    const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState(null);
    const [editZoneCode, setEditZoneCode] = useState('');
    const [editShelfCode, setEditShelfCode] = useState('');
    const [editBinCode, setEditBinCode] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    
    // State for Edit Warehouse Modal
    const [isEditWarehouseModalOpen, setIsEditWarehouseModalOpen] = useState(false);
    const [warehouseToEdit, setWarehouseToEdit] = useState(null);
    const [editWarehouseName, setEditWarehouseName] = useState('');
    const [editWarehouseAddress, setEditWarehouseAddress] = useState('');
    const [isUpdatingWarehouse, setIsUpdatingWarehouse] = useState(false);

    // State for Modals & Error
    const [error, setError] = useState('');
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [newWarehouseName, setNewWarehouseName] = useState('');
    const [newWarehouseAddress, setNewWarehouseAddress] = useState('');
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    
    // State for Confirm Delete Location Modal
    const [isConfirmDeleteLocationOpen, setIsConfirmDeleteLocationOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);

    const fetchWarehouses = useCallback(async () => {
        try {
            setLoadingWarehouses(true);
            const data = await warehouseService.getAll();
            setWarehouses(data);
            if (data.length > 0 && !activeWarehouse) {
                setActiveWarehouse(data[0].id);
            }
        } catch (err) {
            setError('Failed to fetch warehouses.');
            console.error(err);
        } finally {
            setLoadingWarehouses(false);
        }
    }, [activeWarehouse]);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const fetchLocationsForWarehouse = useCallback(async (warehouseId) => {
        if (!warehouseId) return;
        try {
            setLoadingLocations(true);
            const data = await warehouseLocationService.getByWarehouseId(warehouseId);
            setLocations(data);
        } catch (err) {
            setError('Failed to fetch locations for this warehouse.');
            console.error(err);
        } finally {
            setLoadingLocations(false);
        }
    }, []);

    useEffect(() => {
        if (activeWarehouse) {
            fetchLocationsForWarehouse(activeWarehouse);
        }
    }, [activeWarehouse, fetchLocationsForWarehouse]);

    // --- Tinh giản: Thủ kho không có quyền thay đổi trạng thái kho ---
    // const handleToggleWarehouse = ...

    // --- Tinh giản: Thủ kho không có quyền thêm kho mới ---
    // const handleAddWarehouse = ...

    // --- Tinh giản: Thủ kho không có quyền sửa kho ---
    // const openEditWarehouseModal = ...
    // const handleUpdateWarehouse = ...

    // --- Tinh giản: Thủ kho không có quyền xóa kho ---
    // const confirmDeleteWarehouse = ...
    // const handleDeleteWarehouse = ...

    // --- Tinh giản: Thủ kho không có quyền thêm vị trí ---
    // const handleAddLocation = ...

    // --- Tinh giản: Thủ kho không có quyền sửa vị trí ---
    // const openEditLocationModal = ...
    // const handleUpdateLocation = ...

    // --- Tinh giản: Thủ kho không có quyền xóa vị trí ---
    // const confirmDeleteLocation = ...
    // const handleConfirmDeleteLocation = ...

    const selectedWarehouseData = warehouses.find(w => w.id === activeWarehouse);

    return (
        <div className="warehouse-chassis">
            <div className="console-header">
                <h1 className="console-title-stamp">WAREHOUSE GRID COORDINATE</h1>
            </div>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="warehouse-layout-grid">
                <div className="control-board-panel">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    <div className="panel-header">
                        <Factory className="panel-icon" size={20} />
                        <span className="panel-title-stamp">BRANCH CONTROL BOARD</span>
                    </div>
                    
                    <div className="warehouse-list">
                        {loadingWarehouses ? (
                            <div className="loading-state">LOADING BRANCHES...</div>
                        ) : warehouses.map(wh => (
                            <div 
                                key={wh.id} 
                                className={`warehouse-module ${activeWarehouse === wh.id ? 'selected' : ''}`}
                                onClick={() => setActiveWarehouse(wh.id)}
                            >
                                <div className="wh-info">
                                    <span className="wh-id-stamp">BR-{wh.id.toString().padStart(3, '0')}</span>
                                    <h3 className="wh-name">{wh.warehouseName}</h3>
                                    <p className="wh-address"><MapPin size={12}/> {wh.address || 'N/A'}</p>
                                </div>
                                <div className="wh-action">
                                    {/* Tinh giản: Chỉ hiển thị trạng thái, không cho phép thay đổi */}
                                    <span className={`toggle-label ${wh.isActive ? 'active' : ''}`}>{wh.isActive ? 'ONLINE' : 'OFFLINE'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="coordinate-system-panel">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    
                    {/* Tinh giản: Ẩn form thêm vị trí */}

                    <div className="blueprint-well" style={{height: '100%'}}>
                        <div className="blueprint-header">
                            <Layers className="blueprint-icon" size={18} />
                            <span className="blueprint-title">PHYSICAL MATRIX: {selectedWarehouseData?.warehouseName || 'NO BRANCH SELECTED'}</span>
                        </div>
                        
                        <div className="grid-floor-map">
                            {loadingLocations ? (
                                <div className="loading-state" style={{color: 'var(--blueprint-text)'}}>SCANNING MATRIX...</div>
                            ) : locations.length > 0 ? (
                                locations.map(loc => (
                                    <div key={loc.id} className="grid-slot" title={loc.description || "No description"}>
                                        <div className="slot-coordinates">
                                            <span className="coord-zone">{loc.zoneCode.replace(/ZONE\s*/i, '')}</span>
                                            <span className="coord-divider">/</span>
                                            <span className="coord-shelf">{loc.shelfCode.replace(/SHELF\s*/i, '')}</span>
                                            <span className="coord-divider">/</span>
                                            <span className="coord-bin">{loc.binCode.replace(/BIN\s*/i, '')}</span>
                                        </div>
                                        <div className="slot-desc-stamp">
                                            {loc.description || '-'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-blueprint-warning">
                                    <ShieldAlert size={32} />
                                    <span>NO LOCATIONS MAPPED IN THIS SECTOR</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehousePage;