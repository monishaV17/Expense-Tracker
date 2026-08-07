import {useEffect, useState, useCallback} from "react";
import '../static/budget.css';
import BudgetModal from "./BudgetModal";
import { fetchBudgets, deleteBudgets } from "../api/budget";
import { fetchSources } from "../api/sources";

const categories = [
    { id: "1", name: "Food" },
    { id: "2", name: "Shopping" },
    { id: "3", name: "Transport" },
    { id: "4", name: "Bills" },
    { id: "5", name: "Entertainment" }
];

function Budgets(){
    const [budgets,setBudgets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [error, setError] = useState(null);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);

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


    const loadBudgets = useCallback(async () => {
        try{
            const data = await fetchBudgets();
            setBudgets(data);
        } catch(err){
            console.error(err);
        } finally{
            setLoading(false);
        }
    },[]);

    useEffect(() => {
        loadBudgets();
    },[loadBudgets]);

    const openAddModal = () => {
        setEditingBudget(null);
        setIsModalOpen(true);
    };

    const openEditModal = (budget) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    };


    const handleDelete = async (id) => {
        try{
            await deleteBudgets(id);
            loadBudgets();
        } catch(err){
            console.error(err);
        }
    };

    return (
        <div className="budget-page">
            <div className="budget-top">
                <h2>Plan money ahead of time</h2>
                <button className="budget-add-btn" onClick={openAddModal}>+ Add Budget</button>
            </div>
                {loading ? (
                    <div className="loading-spinner-container">
                    <div className="loading-spinner"></div>
                    </div>
                    ) 
                    : ( 
                        <ul>
                            {budgets.map((bd) => (
                            <li key={bd.id} className="budget-item">
                                <span className="bd-date">{new Date(bd.budget_date).toLocaleDateString("en-IN")}</span>
                                <span className="bd-desc">{bd.description}</span>
                                <span className="bd-source">{sources.find(s => s.id === bd.source_id)?.name}</span>
                                <span className="bd-category">{categories.find(c => c.id === bd.category_id)?.name}</span>
                                <span className="bd-amount">₹{bd.amount}</span>
                            <div className="bd-actions-group">
                            <button className="bd-action-btn" onClick={() => openEditModal(bd)}>Edit</button>
                            <button className="bd-action-btn delete" onClick={() => handleDelete(bd.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>)}

            <BudgetModal
                isOpen={isModalOpen}
                editingBudget={editingBudget}
                onClose={() => setIsModalOpen(false)}
                onAdd={loadBudgets}
            />
        </div>
    );
}

export default Budgets;