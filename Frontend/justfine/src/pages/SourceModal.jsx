import React, { useState } from "react";
import '../static/ModalTransac.css';

const INITIAL_FORM_STATE={ name: "", description: "", amount: "", is_savings: false };

function SourceModal({ isOpen, onClose, onAdd }){
    const [formData, setFormData]=useState(INITIAL_FORM_STATE);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked }=e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData, amount: Number(formData.amount)/100
        };
        onAdd(payload);
        setFormData(INITIAL_FORM_STATE);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={onClose}>✕</button>
                
                <form onSubmit={handleSubmit}>
                    <input className="form-input" name="name" placeholder="Source name" value={formData.name} onChange={handleChange} required />
                    <input className="form-input" name="description" type="text" placeholder="Description" value={formData.description} onChange={handleChange} required />
                    <input className="form-input" name="amount" type="number" placeholder="Amount (₹)" value={formData.amount} onChange={handleChange} />
                    
                    <label className="checkbox-label">
                        <input name="is_savings" type="checkbox" checked={formData.is_savings} onChange={handleChange} />
                        <span className="savings-acc">Savings Account</span>
                    </label>

                    <button type="submit">Add Source</button>
                </form>
            </div>
        </div>
    );
}

export default SourceModal;