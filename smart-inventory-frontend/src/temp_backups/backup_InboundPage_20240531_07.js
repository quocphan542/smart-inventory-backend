import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import '../../styles/InboundPage.css'; // Import the new CSS

// --- Mock Data & Services ---
const MOCK_PRODUCTS = {
    'STM32F103C8T6': { name: 'MCU STM32 "Blue Pill"', sku: 'STM32F103C8T6' },
    'RASPI-4B-8GB': { name: 'Raspberry Pi 4 Model B 8GB', sku: 'RASPI-4B-8GB' },
};

// --- Sub-components ---
const ScannerBay = ({ onScan, ...props }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onScan(e.target.value);
            e.target.value = '';
        }
    };
    return (
        <div className="scanner-bay">
            <input
                type="text"
                className="scanner-input-well"
                placeholder="WAITING FOR SCANNER..."
                onKeyDown={handleKeyDown}
                {...props}
            />
        </div>
    );
};

const ProductDisplay = ({ product }) => (
    <div className="product-id-card">
        <div className="product-image-placeholder"></div>
        <p className="product-name">{product.name}</p>
        <p className="product-sku">{product.sku}</p>
    </div>
);

const DataEntry = ({ onAdd, onQuantityChange, quantity }) => (
    <div className="data-entry-module">
        <div className="data-input-group">
            <label className="data-label">Quantity</label>
            <div className="quantity-control">
                <button className="heavy-duty-btn btn-adjust" onClick={() => onQuantityChange(q => Math.max(1, q - 1))}>
                    <Minus size={24} />
                </button>
                <span className="quantity-display">{quantity}</span>
                <button className="heavy-duty-btn btn-adjust" onClick={() => onQuantityChange(q => q + 1)}>
                    <Plus size={24} />
                </button>
            </div>
        </div>
        <button className="heavy-duty-btn btn-finalize" onClick={onAdd}>
            Add to Receipt
        </button>
    </div>
);

const ReceiptList = ({ items, onRemove }) => (
    <div className="receipt-list-panel">
        <h2 className="section-title">Current Inbound Receipt</h2>
        <div className="receipt-list-container">
            <ul>
                {items.map((item, index) => (
                    <li key={index} className="receipt-item">
                        <span className="name">{item.name}</span>
                        <span className="sku">{item.sku}</span>
                        <span className="qty">x {item.quantity}</span>
                        <button className="btn-remove" onClick={() => onRemove(index)}>
                            <X size={18} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
        <div className="receipt-footer">
            <button className="heavy-duty-btn btn-complete">
                Complete & Submit Receipt
            </button>
        </div>
    </div>
);

const InboundPage = () => {
    const [scannedProduct, setScannedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [receiptItems, setReceiptItems] = useState([]);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (scannerRef.current) {
            scannerRef.current.focus();
        }
    }, []);

    const handleScan = (sku) => {
        const product = MOCK_PRODUCTS[sku.toUpperCase()];
        if (product) {
            setScannedProduct(product);
            setQuantity(1); // Reset quantity on new scan
        } else {
            setScannedProduct(null);
            // Here you could add a visual/audio error signal
        }
    };

    const handleAddItem = () => {
        if (!scannedProduct) return;
        setReceiptItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.sku === scannedProduct.sku);
            if (existingItemIndex > -1) {
                // Update quantity if item already exists
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            }
            // Add new item
            return [...prevItems, { ...scannedProduct, quantity }];
        });
        setScannedProduct(null); // Clear product display after adding
    };

    const handleRemoveItem = (index) => {
        setReceiptItems(prevItems => prevItems.filter((_, i) => i !== index));
    };

    return (
        <div className="inbound-page-chassis">
            <h1 className="page-title-stamp">Staff Inbound Operations</h1>
            <ScannerBay onScan={handleScan} ref={scannerRef} />
            
            <div className="inbound-main-grid">
                <div className="product-data-column">
                    {scannedProduct && (
                        <>
                            <ProductDisplay product={scannedProduct} />
                            <DataEntry onAdd={handleAddItem} onQuantityChange={setQuantity} quantity={quantity} />
                        </>
                    )}
                </div>
                <div className="receipt-list-container-wrapper">
                    <ReceiptList items={receiptItems} onRemove={handleRemoveItem} />
                </div>
            </div>
        </div>
    );
};

export default InboundPage;