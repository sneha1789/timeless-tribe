// src/components/Modals/AddressSelectionModal.jsx

import React from 'react';
import './AddressSelectionModal.css'; // We will create/update this file next

const AddressSelectionModal = ({
    addresses,
    selectedAddress,
    onSelectAddress,
    onAddNewAddress,
    onClose
}) => {
    return (
        <div className="address-selection-modal-overlay" onClick={onClose}>
            <div className="address-selection-modal-content" onClick={e => e.stopPropagation()}>
                <span className="address-selection-close" onClick={onClose}>&times;</span>
                <h2>Select Delivery Address</h2>
                <div className="address-selection-list">
                    {addresses.length === 0 ? (
                        <p className="address-selection-empty-message">No addresses saved yet.</p>
                    ) : (
                        addresses.map(address => (
                            <div
                                key={address._id}
                                className={`address-selection-card ${selectedAddress?._id === address._id ? 'selected' : ''}`}
                                onClick={() => onSelectAddress(address)}
                            >
                                <div className="address-selection-card-header">
                                    <span className="address-selection-type">{address.name}</span>
                                    {address.isDefault && <span className="address-selection-default-badge">DEFAULT</span>}
                                </div>
                                <div className="address-selection-details">
                                    <strong>{address.fullName}</strong>
                                    <p>{address.street}, {address.area}, {address.city}</p>
                                    <p>Phone: {address.phone}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button className="btn-add-new-address-modal" onClick={onAddNewAddress}>
                    <i className="fa-solid fa-plus"></i> Add New Address
                </button>
            </div>
        </div>
    );
};

export default AddressSelectionModal;