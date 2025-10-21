import React, { useState, useEffect, useMemo } from 'react';
import './AddressForm.css';

const AddressForm = ({ onSave, onCancel, editingAddress }) => {
    // A memoized initial state prevents unnecessary re-renders
    const initialFormState = useMemo(() => ({
        name: 'Home',
        fullName: '',
        phone: '',
        street: '',
        area: '',
        city: 'Kathmandu',
        isDefault: false,
    }), []);

    const [formData, setFormData] = useState(initialFormState);

    // This is the key fix: This effect runs when the component loads
    // and whenever the 'editingAddress' prop changes.
    useEffect(() => {
        if (editingAddress) {
            // If we are editing, fill the form with the existing address data
            setFormData({
                name: editingAddress.name || 'Home',
                fullName: editingAddress.fullName || '',
                phone: editingAddress.phone || '',
                street: editingAddress.street || '',
                area: editingAddress.area || '',
                city: editingAddress.city || 'Kathmandu',
                isDefault: editingAddress.isDefault || false,
            });
        } else {
            // If we are adding a new address, reset the form to its initial empty state
            setFormData(initialFormState);
        }
    }, [editingAddress, initialFormState]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="address-form-container">
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Mobile Number *</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="street">Street Address / Tole *</label>
                    <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="area">Area / Locality *</label>
                        <input type="text" id="area" name="area" value={formData.area} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City / Municipality *</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-group">
                    <label>Type of Address *</label>
                    <div className="radio-group">
                        <label><input type="radio" name="name" value="Home" checked={formData.name === 'Home'} onChange={handleChange} /> Home</label>
                        <label><input type="radio" name="name" value="Work" checked={formData.name === 'Work'} onChange={handleChange} /> Work</label>
                        <label><input type="radio" name="name" value="Other" checked={formData.name === 'Other'} onChange={handleChange} /> Other</label>
                    </div>
                </div>
                 <div className="gdpr-group">
                    <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                    <label htmlFor="isDefault">Make this my default address</label>
                </div>
                <div className="form-buttons">
                    <button type="submit" className="cta-button">Save Address</button>
                    <button type="button" className="cta-button-outline" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;

