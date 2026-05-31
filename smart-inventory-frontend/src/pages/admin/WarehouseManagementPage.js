import React, { useState, useEffect, useCallback } from 'react';
import { Factory, MapPin, Plus, Save, Layers, Settings2, ShieldAlert, Trash2, Edit2, Edit } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import warehouseLocationService from '../../services/warehouseLocationService';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/WarehouseManagementPage.css';

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
    // Để cho đẹp và nhìn gọn trong các box, ta chỉ viết hoa chữ cái của Dãy/Kệ/Tầng.
    // Lấy ký tự nhập vào, xóa khoảng trắng thừa, và viết hoa.
    const trimmed = input.trim().toUpperCase(); 
    if (!trimmed) return '';
    // Xóa tự động chèn chữ "Zone " "Shelf " "Bin " theo yêu cầu của user
    return trimmed;
};

const WarehouseManagementPage = () => {
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

    const handleToggleWarehouse = async (id) => {
        setUpdatingWarehouseId(id);
        try {
            await warehouseService.toggleStatus(id);
            setWarehouses(warehouses.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
        } catch (err) {
            setError('Failed to toggle warehouse status.');
        } finally {
            setUpdatingWarehouseId(null);
        }
    };

    const handleAddWarehouse = async (e) => {
        e.preventDefault();
        if (!newWarehouseName) {
            setError('Warehouse name is required.');
            return;
        }
        try {
            await warehouseService.create({
                warehouseName: newWarehouseName,
                address: newWarehouseAddress,
                isActive: true
            });
            setIsWarehouseModalOpen(false);
            setNewWarehouseName('');
            setNewWarehouseAddress('');
            fetchWarehouses();
        } catch (err) {
            setError('Failed to create warehouse.');
        }
    };

    const openEditWarehouseModal = (warehouse, e) => {
        e.stopPropagation(); 
        setWarehouseToEdit(warehouse);
        setEditWarehouseName(warehouse.warehouseName);
        setEditWarehouseAddress(warehouse.address || '');
        setIsEditWarehouseModalOpen(true);
    };

    const handleUpdateWarehouse = async (e) => {
        e.preventDefault();
        if (!editWarehouseName || !warehouseToEdit) {
            setError('Warehouse name is required for update.');
            return;
        }
        setIsUpdatingWarehouse(true);
        try {
            await warehouseService.update(warehouseToEdit.id, {
                warehouseName: editWarehouseName,
                address: editWarehouseAddress,
                isActive: warehouseToEdit.isActive
            });
            setIsEditWarehouseModalOpen(false);
            fetchWarehouses();
        } catch (err) {
            setError('Failed to update warehouse.');
        } finally {
            setIsUpdatingWarehouse(false);
        }
    };

    const confirmDeleteWarehouse = (warehouse, e) => {
        e.stopPropagation();
        setWarehouseToDelete(warehouse);
        setIsConfirmDeleteOpen(true);
    };

    const handleDeleteWarehouse = async () => {
        if (!warehouseToDelete) return;
        setUpdatingWarehouseId(warehouseToDelete.id);
        try {
            await warehouseService.delete(warehouseToDelete.id);
            if (activeWarehouse === warehouseToDelete.id) {
                setActiveWarehouse(null);
                setLocations([]);
            }
            fetchWarehouses();
        } catch (err) {
            setError(err.message || 'Cannot delete warehouse (might be in use).');
        } finally {
            setUpdatingWarehouseId(null);
            setIsConfirmDeleteOpen(false);
            setWarehouseToDelete(null);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (!zoneCode || !shelfCode || !binCode || !activeWarehouse) {
            setError('Zone, Shelf, and Bin are required.');
            return;
        }
        
        const formattedZone = formatCode(zoneCode, 'Zone');
        const formattedShelf = formatCode(shelfCode, 'Shelf');
        const formattedBin = formatCode(binCode, 'Bin');

        setIsCreatingLocation(true);
        try {
            await warehouseLocationService.create({
                warehouseId: activeWarehouse,
                zoneCode: `Zone ${formattedZone}`,
                shelfCode: `Shelf ${formattedShelf}`,
                binCode: `Bin ${formattedBin}`,
                description: description
            });
            setZoneCode(''); setShelfCode(''); setBinCode(''); setDescription('');
            fetchLocationsForWarehouse(activeWarehouse);
        } catch (err) {
            setError('Failed to initialize location.');
        } finally {
            setIsCreatingLocation(false);
        }
    };

    // Mở Form Sửa Vị Trí
    const openEditLocationModal = (location) => {
        setLocationToEdit(location);
        // Tách bỏ tiền tố để hiện lại vào ô input cho người dùng dễ sửa (vd: "Zone A" -> "A")
        setEditZoneCode(location.zoneCode.replace(/ZONE\s*/i, ''));
        setEditShelfCode(location.shelfCode.replace(/SHELF\s*/i, ''));
        setEditBinCode(location.binCode.replace(/BIN\s*/i, ''));
        setEditDescription(location.description || '');
        setIsEditLocationModalOpen(true);
    };

    // Thực thi Lưu sửa vị trí
    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        if (!editZoneCode || !editShelfCode || !editBinCode || !locationToEdit) {
            setError('Zone, Shelf, and Bin are required for update.');
            return;
        }
        
        const formattedZone = formatCode(editZoneCode, 'Zone');
        const formattedShelf = formatCode(editShelfCode, 'Shelf');
        const formattedBin = formatCode(editBinCode, 'Bin');

        setIsUpdatingLocation(true);
        try {
            await warehouseLocationService.update(locationToEdit.id, {
                warehouseId: activeWarehouse,
                zoneCode: `Zone ${formattedZone}`,
                shelfCode: `Shelf ${formattedShelf}`,
                binCode: `Bin ${formattedBin}`,
                description: editDescription
            });
            setIsEditLocationModalOpen(false);
            fetchLocationsForWarehouse(activeWarehouse);
        } catch (err) {
            setError('Failed to update location.');
        } finally {
            setIsUpdatingLocation(false);
        }
    };

    const confirmDeleteLocation = (location) => {
        setLocationToDelete(location);
        setIsConfirmDeleteLocationOpen(true);
    };

    const handleConfirmDeleteLocation = async () => {
        if (!locationToDelete) return;
        try {
            await warehouseLocationService.delete(locationToDelete.id);
            fetchLocationsForWarehouse(activeWarehouse);
        } catch (err) {
            setError(err.message || 'Failed to delete location.');
        } finally {
            setIsConfirmDeleteLocationOpen(false);
            setLocationToDelete(null);
        }
    };

    const selectedWarehouseData = warehouses.find(w => w.id === activeWarehouse);

    return (
        <div className="warehouse-chassis">
            <div className="console-header">
                <h1 className="console-title-stamp">WAREHOUSE & GRID COORDINATE CONSOLE</h1>
            </div>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="warehouse-layout-grid">
                {/* --- Left Panel: Warehouse Branch Control Board --- */}
                <div className="control-board-panel">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    <div className="panel-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Factory className="panel-icon" size={20} />
                            <span className="panel-title-stamp">BRANCH CONTROL BOARD</span>
                        </div>
                        <button className="tactical-btn-accent" style={{ height: 'auto', padding: '0.5rem' }} onClick={() => setIsWarehouseModalOpen(true)}>
                            <Plus size={16} />
                        </button>
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
                                <div className="module-vents">
                                    <Vent /><Vent /><Vent />
                                </div>
                                <div className="wh-info">
                                    <span className="wh-id-stamp">BR-{wh.id.toString().padStart(3, '0')}</span>
                                    <h3 className="wh-name">{wh.warehouseName}</h3>
                                    <p className="wh-address"><MapPin size={12}/> {wh.address || 'N/A'}</p>
                                </div>
                                <div className="wh-action" onClick={(e) => e.stopPropagation()}>
                                    <TacticalToggle 
                                        isActive={wh.isActive} 
                                        onToggle={() => handleToggleWarehouse(wh.id)} 
                                        isLoading={updatingWarehouseId === wh.id}
                                    />
                                    <span className="toggle-label">{wh.isActive ? 'ONLINE' : 'OFFLINE'}</span>
                                    
                                    <div style={{display: 'flex', gap: '8px', marginTop: '5px'}}>
                                        <button 
                                            className="edit-wh-btn" 
                                            title="Edit Branch"
                                            onClick={(e) => openEditWarehouseModal(wh, e)}
                                        >
                                            <Edit size={14}/>
                                        </button>
                                        <button 
                                            className="delete-btn" 
                                            style={{padding: '2px', background: 'transparent', border: 'none', color: '#828a9a', cursor: 'pointer'}} 
                                            onClick={(e) => confirmDeleteWarehouse(wh, e)}
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Right Panel: Physical Coordinate Grid & Provisioning --- */}
                <div className="coordinate-system-panel">
                    <Rivet /><Rivet /><Rivet /><Rivet />
                    
                    {/* Top sub-panel: Provisioning Form */}
                    <div className="provisioning-well">
                        <div className="panel-header mb-4">
                            <Settings2 className="panel-icon" size={20} />
                            <span className="panel-title-stamp">TACTICAL SLOT PROVISIONING</span>
                        </div>
                        <form className="provisioning-form" style={{ gridTemplateColumns: 'repeat(4, 1fr) auto' }} onSubmit={handleAddLocation}>
                            <div className="input-group-recessed">
                                <label>ZONE</label>
                                <input type="text" value={zoneCode} onChange={e => setZoneCode(e.target.value)} placeholder="e.g. A" disabled={!activeWarehouse || isCreatingLocation} />
                            </div>
                            <div className="input-group-recessed">
                                <label>SHELF</label>
                                <input type="text" value={shelfCode} onChange={e => setShelfCode(e.target.value)} placeholder="e.g. 01" disabled={!activeWarehouse || isCreatingLocation}/>
                            </div>
                            <div className="input-group-recessed">
                                <label>BIN</label>
                                <input type="text" value={binCode} onChange={e => setBinCode(e.target.value)} placeholder="e.g. 05" disabled={!activeWarehouse || isCreatingLocation}/>
                            </div>
                            <div className="input-group-recessed">
                                <label>DESCRIPTION</label>
                                <input style={{textTransform: 'none'}} type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note..." disabled={!activeWarehouse || isCreatingLocation}/>
                            </div>
                            <button type="submit" className="tactical-btn-accent" disabled={!activeWarehouse || isCreatingLocation}>
                                <Plus size={18} />
                                <span>INITIALIZE</span>
                            </button>
                        </form>
                    </div>

                    {/* Bottom sub-panel: Blueprint Grid */}
                    <div className="blueprint-well">
                        <div className="blueprint-header">
                            <Layers className="blueprint-icon" size={18} />
                            <span className="blueprint-title">PHYSICAL MATRIX: {selectedWarehouseData?.warehouseName || 'NO BRANCH SELECTED'}</span>
                        </div>
                        
                        <div className="grid-floor-map">
                            {loadingLocations ? (
                                <div className="loading-state" style={{color: 'var(--blueprint-text)'}}>SCANNING MATRIX...</div>
                            ) : locations.length > 0 ? (
                                locations.map(loc => {
                                    const mockStatus = loc.zoneCode.toUpperCase().includes('X') ? 'MAINTENANCE' : 'EMPTY';
                                    return (
                                    <div key={loc.id} className={`grid-slot status-${mockStatus.toLowerCase()}`} title={loc.description || "No description"}>
                                        
                                        <div className="slot-actions">
                                            <button className="slot-action-btn edit" onClick={() => openEditLocationModal(loc)} title="Edit Location">
                                                <Edit2 size={12}/>
                                            </button>
                                            <button className="slot-action-btn delete" onClick={() => confirmDeleteLocation(loc)} title="Delete Location">
                                                <Trash2 size={12}/>
                                            </button>
                                        </div>

                                        <div className="slot-led"></div>
                                        <div className="slot-coordinates">
                                            {/* Sửa hiển thị bỏ cụm Zone/Shelf/Bin lặp lại */}
                                            <span className="coord-zone">{loc.zoneCode.replace(/ZONE\s*/i, '')}</span>
                                            <span className="coord-divider">/</span>
                                            <span className="coord-shelf">{loc.shelfCode.replace(/SHELF\s*/i, '')}</span>
                                            <span className="coord-divider">/</span>
                                            <span className="coord-bin">{loc.binCode.replace(/BIN\s*/i, '')}</span>
                                        </div>
                                        <span className="slot-status-stamp">{mockStatus}</span>
                                        
                                        <div className="slot-desc-stamp">
                                            {loc.description || '-'}
                                        </div>
                                    </div>
                                )})
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

            {/* Modal for adding a new Warehouse */}
            <Modal isOpen={isWarehouseModalOpen} onClose={() => setIsWarehouseModalOpen(false)} title="COMMISSION NEW BRANCH">
                <form onSubmit={handleAddWarehouse} className="form-container" style={{padding: '1rem 0'}}>
                    <div className="form-group input-group-recessed" style={{marginBottom: '1rem'}}>
                        <label>BRANCH NAME</label>
                        <input style={{textTransform: 'none'}} type="text" value={newWarehouseName} onChange={e => setNewWarehouseName(e.target.value)} placeholder="e.g. KHO TRUNG TÂM" autoFocus />
                    </div>
                    <div className="form-group input-group-recessed" style={{marginBottom: '1.5rem'}}>
                        <label>PHYSICAL ADDRESS</label>
                        <input style={{textTransform: 'none'}} type="text" value={newWarehouseAddress} onChange={e => setNewWarehouseAddress(e.target.value)} placeholder="Full physical address..." />
                    </div>
                    <div className="form-actions" style={{justifyContent: 'flex-end', display: 'flex'}}>
                        <button type="submit" className="tactical-btn-accent">
                            <Save size={16} /> <span>COMMISSION</span>
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal for EDITING a Warehouse */}
            <Modal isOpen={isEditWarehouseModalOpen} onClose={() => setIsEditWarehouseModalOpen(false)} title="RE-CONFIGURE BRANCH INFO">
                <form onSubmit={handleUpdateWarehouse} className="form-container" style={{padding: '1rem 0'}}>
                    <div className="form-group input-group-recessed" style={{marginBottom: '1rem'}}>
                        <label>BRANCH NAME</label>
                        <input style={{textTransform: 'none'}} type="text" value={editWarehouseName} onChange={e => setEditWarehouseName(e.target.value)} placeholder="e.g. KHO TRUNG TÂM" autoFocus disabled={isUpdatingWarehouse} />
                    </div>
                    <div className="form-group input-group-recessed" style={{marginBottom: '1.5rem'}}>
                        <label>PHYSICAL ADDRESS</label>
                        <input style={{textTransform: 'none'}} type="text" value={editWarehouseAddress} onChange={e => setEditWarehouseAddress(e.target.value)} placeholder="Full physical address..." disabled={isUpdatingWarehouse} />
                    </div>
                    <div className="form-actions" style={{justifyContent: 'flex-end', display: 'flex'}}>
                        <button type="submit" className="tactical-btn-accent" disabled={isUpdatingWarehouse}>
                            <Save size={16} /> <span>UPDATE INFO</span>
                        </button>
                    </div>
                </form>
            </Modal>

            {/* THÊM: Modal for EDITING a Location */}
            <Modal isOpen={isEditLocationModalOpen} onClose={() => setIsEditLocationModalOpen(false)} title="RE-CONFIGURE LOCATION SLOT">
                <form onSubmit={handleUpdateLocation} className="form-container" style={{padding: '1rem 0'}}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group input-group-recessed">
                            <label>ZONE</label>
                            <input type="text" value={editZoneCode} onChange={e => setEditZoneCode(e.target.value)} placeholder="e.g. A" required disabled={isUpdatingLocation}/>
                        </div>
                        <div className="form-group input-group-recessed">
                            <label>SHELF</label>
                            <input type="text" value={editShelfCode} onChange={e => setShelfCode(e.target.value)} placeholder="e.g. 01" required disabled={isUpdatingLocation}/>
                        </div>
                        <div className="form-group input-group-recessed">
                            <label>BIN</label>
                            <input type="text" value={editBinCode} onChange={e => setEditBinCode(e.target.value)} placeholder="e.g. 05" required disabled={isUpdatingLocation}/>
                        </div>
                    </div>
                    
                    <div className="form-group input-group-recessed" style={{marginBottom: '1.5rem'}}>
                        <label>DESCRIPTION (NOTES)</label>
                        <input style={{textTransform: 'none'}} type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Optional note..." disabled={isUpdatingLocation}/>
                    </div>

                    <div className="form-actions" style={{justifyContent: 'flex-end', display: 'flex'}}>
                        <button type="submit" className="tactical-btn-accent" disabled={isUpdatingLocation}>
                            <Save size={16} /> <span>UPDATE MATRIX</span>
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Warehouse Modal */}
            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDeleteWarehouse}
                title="CONFIRM BRANCH DECOMMISSION"
                message={`Are you sure you want to permanently delete "${warehouseToDelete?.warehouseName}"? This action cannot be undone and will destroy all associated location data.`}
            />

            {/* Confirm Delete Location Modal */}
            <ConfirmModal
                isOpen={isConfirmDeleteLocationOpen}
                onClose={() => setIsConfirmDeleteLocationOpen(false)}
                onConfirm={handleConfirmDeleteLocation}
                title="CONFIRM SLOT DELETION"
                message={`Are you sure you want to remove coordinate slot [${locationToDelete?.zoneCode} / ${locationToDelete?.shelfCode} / ${locationToDelete?.binCode}]?`}
            />
        </div>
    );
};

export default WarehouseManagementPage;