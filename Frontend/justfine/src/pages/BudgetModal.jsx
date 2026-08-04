import React, {useState, useEffect} from "react";
import '../static/ModalTransac.css';
import {fetchSources} from '../api/sources';

const API_URL = "http://127.0.0.1:5000/api";

const categories = [
    { id: "1", name: "Food" },
    { id: "2", name: "Shopping" },
    { id: "3", name: "Transport" },
    { id: "4", name: "Bills" },
    { id: "5", name: "Entertainment" }
];

const INITIAL_FORM_STATE = {amount: "",
                            category_id: "",
                            source_id: "",
                            description: "",
                            budget_date: ""};

function BudgetModal({isOpen, onClose, onAdd, editingBudget}){

    const [formData,setFormData]=useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sources, setSources] = useState([]);

    useEffect(() => {
        if (editingBudget) {
            setFormData({
                amount: editingBudget.amount,
                category_id: editingBudget.category_id || "",
                source_id: editingBudget.source_id || "",
                description: editingBudget.description || "",
                budget_date: editingBudget.budget_date ? editingBudget.budget_date.slice(0, 10) : "",
            });
        } else {
            setFormData(formData);
        }
    }, [editingBudget,isOpen]);

    const handleClose=(e)=>{
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        setFormData({ amount:"", category_id:"", source_id:"", description:"", budget_date:"" });
        if(typeof onClose === "function"){
            onClose();
        }
    };

    
    useEffect(() => {
        const loadSources = async () => {
            try {
                const data = await fetchSources();
                setSources(data);
            } catch (err) {
                console.error(err);
            }
        };
    
        loadSources();
    }, []);

    if(!isOpen){
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload={
            amount: Number(formData.amount),
            category_id: formData.category_id || "",
            source_id: formData.source_id || "",
            description: formData.description || "",
            budget_date: formData.budget_date || ""
            };

        try{
            const token = localStorage.getItem("token");
            const url = editingBudget ? `${API_URL}/budgets/${editingBudget.id}`
                                         : `${API_URL}/budgets`;
            const method = editingBudget ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if(response.ok) {
                if (typeof onAdd === "function") {
                    await onAdd(); 
                }
                onClose();
            } else {
                setError(data.message || (editingBudget ? "Failed to update budget" : "Failed to add budget"));
            }
        } catch(err) {
            setError(`Error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-content" onClick={(e)=> e.stopPropagation()}>
                    <button type="button" className="close-btn" onClick={handleClose}>✕</button>
                <form onSubmit={handleSubmit}>
                    <input type="number" placeholder="₹ Amount" value={formData.amount} 
                    onChange={e=> setFormData({...formData,amount: e.target.value})} required />

                    <select value={formData.category_id}
                    onChange={e=> setFormData({...formData,category_id: e.target.value})} required >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                    </select>

                    <select value={formData.source_id}
                    onChange={e=> setFormData({...formData,source_id: e.target.value})} required >
                    <option value="">Select Source</option>
                    {sources.map((source) => (
                        <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                    </select>

                    <input type="text" placeholder="Description" value={formData.description} 
                    onChange={e=> setFormData({...formData,description: e.target.value})} required />

                    <input type="date" value={formData.budget_date} 
                    onChange={e=> setFormData({...formData,budget_date: e.target.value})} required />

                    <button type="submit" disabled={loading}>
                    {loading ? (editingBudget  ? "Updating..." : "Adding...")
                                 : (editingBudget ? "Update Budget" : "Add Budget")}
                    </button>
                </form>
                </div>
            </div>
    )
}

export default BudgetModal;