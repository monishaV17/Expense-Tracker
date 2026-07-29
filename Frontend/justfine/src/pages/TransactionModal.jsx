import React, { useState, useEffect } from "react";
import '../static/ModalTransac.css';

const API_URL = "http://127.0.0.1:5000/api";

function TransactionModal({ isOpen, onClose, onAdd, initialType, editingTransaction}) {
    const transactionTypes=[
        { id: "income", name: "Income" },
        { id: "expense", name: "Expense" },
        { id: "transfer", name: "Transfer" },
        { id: "debt_in", name: "Debt In" },
        { id: "debt_out", name: "Debt Out" },
        { id: "adjustment", name: "Adjustments" }
    ];

    const categories=[
        { id: "food", name: "Food & Dining" },
        { id: "transport", name: "Transport" },
        { id: "shopping", name: "Shopping" },
        { id: "bills", name: "Bills & Utilities" },
        { id: "entertainment", name: "Entertainment" },
        { id: "healthcare", name: "Healthcare" },
        { id: "salary", name: "Salary" },
        { id: "side_gig", name: "Side Gig" },
        { id: "tithe", name: "Tithe" },
        { id: "others", name: "Others" }
    ];

    const sources=[
        { id: "cash", name: "Cash" },
        { id: "bank", name: "Bank" },
        { id: "card", name: "Credit Card" },
        { id: "savings", name: "Savings" }
    ];

    const [formData, setFormData]=useState({
        amount: "",
        txn_type: "expense",
        category_id: "",
        source_id: "",
        description: "",
        created_at: ""
    });
    
    const[loading, setLoading]=useState(false);
    const[error, setError]=useState(null);
    const[message,setMessage]=useState("");

    const showMessage=(text) => {
        setMessage(text);
        setTimeout(() => {
        setMessage("");
        }, 2000);
    }

   useEffect(()=>{
    if(isOpen){
        if(editingTransaction){
            setFormData({
                amount: editingTransaction.amount || "",
                txn_type: editingTransaction.txn_type || "expense",
                category_id: editingTransaction.category_id || "",
                source_id: editingTransaction.source_id || "",
                description: editingTransaction.description || "",
                created_at: editingTransaction.created_at || "",
            });
        }
        else{
            setFormData({
                amount: "",
                txn_type: initialType || "expense",
                category_id: "",
                source_id: "",
                description:"",
                created_at: "",
            });
        }
        setError(null);
    }
   },[isOpen,editingTransaction,initialType]);

    const handleClose=(e) => {
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        setFormData({ amount: "", txn_type: "expense", category_id: "", source_id: "", description: "", created_at: "" });
        setError(null);
        if(typeof onClose === "function"){
            onClose();
        }
    };

    if(!isOpen){
        return null;
    }

    const handleSubmit=async (e) =>{
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload={
            amount: parseFloat(formData.amount),
            txn_type: formData.txn_type,
            category_id: formData.category_id,
            source_id: formData.source_id,
            description: formData.description,
            created_at: formData.created_at
        };

        try{
            const token=localStorage.getItem("token");
            const url=editingTransaction ? `${API_URL}/transactions/${editingTransaction.id}`
                                         : `${API_URL}/transactions`;
            const method=editingTransaction ? "PUT" : "POST";

            const response=await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data=await response.json();
            if(response.ok) {
                if(typeof onAdd === "function"){
                    onAdd(data);
                }
                showMessage(data.message || (editingTransaction ? "Transaction updated successfully" 
                            : "Transaction addedd successfully"));
                setTimeout(() => {
                    handleClose();
                }, 1200);
            } else{
                setError(data.message || "Failed to add transaction");
            }
        } catch(err){
            setError(`Error occurred: ${err.message}`);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={handleClose}>✕</button>

                {error && <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
                {message && <div className="message">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <input 
                        type="number" 
                        step="0.01"
                        placeholder="₹ Amount" 
                        value={formData.amount} 
                        onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                        required 
                    />

                    <select 
                        value={formData.txn_type}
                        onChange={e => setFormData({ ...formData, txn_type: e.target.value })} 
                        required 
                    >
                        <option value="">Select Type</option>
                        {transactionTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>

                    <select 
                        value={formData.category_id} 
                        onChange={e => setFormData({ ...formData, category_id: e.target.value })} 
                        required 
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    <select 
                        value={formData.source_id}
                        onChange={e => setFormData({ ...formData, source_id: e.target.value })} 
                        required 
                    >
                        <option value="">Select Source</option>
                        {sources.map((source) => (
                            <option key={source.id} value={source.id}>{source.name}</option>
                        ))}
                    </select>

                    <input 
                        type="date" 
                        value={formData.created_at} 
                        onChange={e => setFormData({ ...formData, created_at: e.target.value })} 
                        required 
                    />

                    <input 
                        type="text" 
                        placeholder="Description" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TransactionModal;