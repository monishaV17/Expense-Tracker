import React, { useState, useEffect } from "react";
import '../static/ModalTransac.css';

const API_URL = "http://127.0.0.1:5000/api"

const INITIAL_FORM_STATE = {
    person_name: "",
    debt_type: "i_owe",
    amount: "",
    paid_amount: "",
    description: "",
    due_date: "",
    emoji: "👤",
    emi_amount: "",
    emi_frequency: "",
    emi_day: "",
    total_emis: ""
};

function DebtsModal({ isOpen, onClose, onAdd, editingDebts }) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(()=>{
        if(editingDebts){
            setFormData({person_name: editingDebts.person_name || "",
                        debt_type: editingDebts.debt_type || "i_owe",
                        amount: editingDebts.amount ? editingDebts.amount / 100 : "",
                        paid_amount: editingDebts.paid_amount ? editingDebts.paid_amount / 100 : "",
                        description: editingDebts.description || "",
                        due_date: editingDebts.due_date || "",
                        emoji: editingDebts.emoji || "👤",
                        emi_amount: editingDebts.emi_amount ? editingDebts.emi_amount / 100 : "",
                        emi_frequency: editingDebts.emi_frequency || "",
                        emi_day: editingDebts.emi_day || "",
                        total_emis: editingDebts.total_emis || ""});
        }
        else{
            setFormData(INITIAL_FORM_STATE);
        }
        setError(null);
    },[isOpen,editingDebts]);

    if(!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload={
                        person_name: formData.person_name,
                        debt_type: formData.debt_type,
                        amount: parseFloat(formData.amount || 0) * 100,
                        paid_amount: parseFloat(formData.paid_amount || 0) * 100,
                        description: formData.description,
                        due_date: formData.due_date,
                        emoji: formData.emoji,
                        emi_amount: formData.emi_amount ? parseFloat(formData.emi_amount) * 100 : null,
                        emi_frequency: formData.emi_frequency || null,
                        emi_day: formData.emi_day ? parseInt(formData.emi_day) : null,
                        total_emis: formData.total_emis ? parseInt(formData.total_emis) : null,
                    };

        try{
            const token = localStorage.getItem("token");
            const url = editingDebts ? `${API_URL}/debts/${editingDebts.id}`
                                         : `${API_URL}/debts`;
            const method = editingDebts ? "PUT" : "POST";

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
                setError(data.message || (editingDebts ? "Failed to update debt" : "Failed to add debt"));
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
                    <input className="form-input" name="person_name" placeholder="Name (e.g., Rahul, HDFC)" 
                        value={formData.person_name} onChange={handleChange} required />

                    <select className="form-input" name="debt_type" value={formData.debt_type} onChange={handleChange}>
                        <option value="i_owe">I OWE</option>
                        <option value="lent_to">LENT TO</option>
                    </select>

                    <input className="form-input" name="amount" type="number" placeholder="Total Amount (₹)" 
                        value={formData.amount} onChange={handleChange} required />

                    <input className="form-input" name="paid_amount" type="number" placeholder="Already Paid / Returned (₹)" 
                        value={formData.paid_amount} onChange={handleChange} />

                    <input className="form-input" type="date" name="due_date" value={formData.due_date} onChange={handleChange}/>

                    <select className="form-input" name="emoji" value={formData.emoji} onChange={handleChange}>
                        <option value="👤">👤 Person</option>
                        <option value="🏦">🏦 Bank</option>
                        <option value="💳">💳 Credit Card</option>
                    </select>

                    <input className="form-input" name="description" type="text" placeholder="Description (e.g., Personal Loan)" 
                        value={formData.description} onChange={handleChange} />

                    <label className="checkbox-label">
                        <input type="checkbox" name="is_emi" checked={formData.is_emi} onChange={handleChange}/>This is an EMI loan
                    </label>

                    {formData.is_emi && (
                        <>
                         <h4>EMI Details</h4>
                         <input className="form-input" type="number" name="emi_amount" placeholder="EMI Amount (₹)" value={formData.emi_amount} 
                            onChange={handleChange}/>
                        <select className="form-input" name="emi_frequency" value={formData.emi_frequency}
                            onChange={handleChange}>
                            <option value="">Frequency</option>
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <inpu className="form-input" type="number" name="emi_day" placeholder="EMI Day" value={formData.emi_day}
                            onChange={handleChange}/>
                        <input className="form-input" type="number" name="total_emis" placeholder="Total EMIs" value={formData.total_emis}
                            onChange={handleChange}/>
                        </>
                    )}

                    <button type="submit" disabled={loading}>
                    {loading ? (editingDebts  ? "Updating..." : "Adding...")
                                 : (editingDebts ? "Update Debt" : "Add Debt")}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DebtsModal;