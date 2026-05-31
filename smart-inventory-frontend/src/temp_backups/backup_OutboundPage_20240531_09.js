import React, { useState, useEffect, useRef } from 'react';
import { MapPin, PackageCheck, Package, CheckCircle2, Circle } from 'lucide-react';
import '../../styles/OutboundPage.css'; // Import the new CSS

// --- Mock Data & Services ---
const MOCK_PICKING_LIST = {
    'SO-9821': [
        { id: 1, name: 'Raspberry Pi 4 Model B 8GB', sku: 'RASPI-4B-8GB', location: 'A-01-03', quantity: 5, picked: 0 },
        { id: 2, name: 'MCU STM32 "Blue Pill"', sku: 'STM32F103C8T6', location: 'B-04-01', quantity: 10, picked: 0 },
        { id: 3, name: 'Jumper Wires M-M 20cm', sku: 'JMP-MM-20', location: 'C-02-08', quantity: 2, picked: 0 },
    ]
};

// --- Sub-components ---
const OrderInput = ({ onOrderLoad }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onOrderLoad(e.target.value);
        }
    };
    return (
        <input
            type="text"
            className="order-input-well"
            placeholder="Enter Issue Note #"
            onKeyDown={handleKeyDown}
        />
    );
};

const PickingList = ({ items }) => (
    <div className="picking-list-screen">
        <h2 className="picking-list-title">Picking List</h2>
        <ul>
            {items.map(item => (
                <li key={item.id} className="task-row">
                    <div className={`task-status-led ${item.picked >= item.quantity ? 'picked' : 'pending'}`}></div>
                    <div className="task-product-name">{item.name}</div>
                    <div className="task-details">
                        <span className="task-location"><MapPin size={16} /> {item.location}</span>
                        <span className="task-quantity">{item.picked} / {item.quantity}</span>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const ConfirmationScanner = ({ onScan }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onScan(e.target.value);
            e.target.value = '';
        }
    };
    return (
        <div className="confirmation-scanner-bay">
            <h3 className="scanner-label">Scan to Verify</h3>
            <input
                type="text"
                className="scanner-well"
                placeholder="SCAN SKU..."
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

const DispatchSummary = ({ items }) => {
    const totalPicked = items.reduce((sum, item) => sum + item.picked, 0);
    const itemsRemaining = items.filter(item => item.picked < item.quantity).length;

    return (
        <div className="dispatch-summary-panel">
            <div className="summary-line">
                <span className="summary-label">Total Units Picked:</span>
                <span className="summary-value">{totalPicked}</span>
            </div>
            <div className="summary-line">
                <span className="summary-label">Line Items Remaining:</span>
                <span className="summary-value">{itemsRemaining}</span>
            </div>
        </div>
    );
};

const OutboundPage = () => {
    const [pickingList, setPickingList] = useState([]);
    const [issueNote, setIssueNote] = useState('');

    const handleOrderLoad = (note) => {
        const list = MOCK_PICKING_LIST[note.toUpperCase()];
        if (list) {
            setPickingList(list);
            setIssueNote(note.toUpperCase());
        } else {
            setPickingList([]);
            setIssueNote('');
        }
    };

    const handleScan = (sku) => {
        setPickingList(prevList => {
            const newList = [...prevList];
            const itemIndex = newList.findIndex(item => item.sku === sku.toUpperCase() && item.picked < item.quantity);
            if (itemIndex > -1) {
                newList[itemIndex].picked += 1;
            }
            return newList;
        });
    };

    return (
        <div className="outbound-page-chassis">
            <h1 className="page-title-stamp">Outbound Dispatch</h1>
            <OrderInput onOrderLoad={handleOrderLoad} />
            
            {pickingList.length > 0 && (
                <div className="outbound-main-grid">
                    <PickingList items={pickingList} />
                    <div className="right-column">
                        <ConfirmationScanner onScan={handleScan} />
                        <DispatchSummary items={pickingList} />
                        <button className="btn-complete-dispatch">
                            Complete Dispatch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutboundPage;