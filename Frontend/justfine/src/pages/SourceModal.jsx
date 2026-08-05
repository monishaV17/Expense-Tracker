import React, { useState, useEffect } from "react";
import '../static/ModalTransac.css';

const API_URL = "http://127.0.0.1:5000/api";

const INITIAL_FORM_STATE={ name: "", description: "", amount: "", is_savings: false, is_active: true};

function SourceModal({ isOpen, onClose, onAdd, editingSource}){
    const [formData, setFormData]=useState(INITIAL_FORM_STATE);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked }=e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(()=>{
        if(editingSource){
            setFormData({name: editingSource.name || "",
                        description: editingSource.description || "",
                        amount: editingSource.amount ? editingSource.amount : "",
                        is_savings: editingSource.is_savings || false,
                        created_at: editingSource.created_at ? editingSource.created_at.split("T")[0] : "",
                        is_active: editingSource.is_active });
        }
        else{
            setFormData(INITIAL_FORM_STATE);
        }
        setError(null);
    },[isOpen,editingSource]);

    const handleClose=(e) => {
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        setFormData(INITIAL_FORM_STATE);
        setError(null);
        onClose();
    };
    
    if(!isOpen) 
        return null;

    const handleSubmit=async (e) =>{
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload={
            name: formData.name,
            description: formData.description,
            amount: parseFloat(formData.amount || 0),
            is_savings: formData.is_savings,
            is_active: formData.is_active
        };

        try{
            const token = localStorage.getItem("token");
            const url = editingSource ? `${API_URL}/sources/${editingSource.id}`
                                         : `${API_URL}/sources`;
            const method = editingSource ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const data=await response.json();
            if (response.ok) {
                if (typeof onAdd === "function") {
                    await onAdd(); 
                }
                onClose();
            } else {
                setError(data.message || (editingSource ? "Failed to update source" : "Failed to add source"));
            }
        } catch (err) {
            setError(`Error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={onClose}>✕</button>
                
                <form onSubmit={handleSubmit}>
                    <input className="form-input" name="name" placeholder="Source name" value={formData.name} onChange={handleChange} required />
                    <input className="form-input" name="description" type="text" placeholder="Description" value={formData.description} onChange={handleChange} required />
                    <input className="form-input" name="amount" type="number" placeholder="Amount (₹)" value={formData.amount} onChange={handleChange} />
                    
                    <div className="checkbox-grp">
                    <label className="checkbox-label">
                        <input name="is_savings" type="checkbox" checked={formData.is_savings} onChange={handleChange} />
                        <span className="savings-acc">Savings Account</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}/>
                        <span className="active-src">Active Source</span>
                    </label></div>

                    <button type="submit" disabled={loading}>
                    {loading ? (editingSource  ? "Updating..." : "Adding...")
                                 : (editingSource ? "Update Source" : "Add Source")}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SourceModal;