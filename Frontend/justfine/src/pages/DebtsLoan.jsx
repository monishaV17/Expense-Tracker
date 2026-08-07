import React, { useState, useEffect} from "react";
import { useOutletContext } from "react-router-dom";
import DebtsModal from "./DebtsModal"; 
import "../static/DebtsLoan.css";
import { deleteDebts } from "../api/debts";

function DebtsLoan() {
    
    const { debts, refreshDebts } = useOutletContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebts, setEditingDebts] = useState(null);

    const openEditModal = (debt)=>{
        setEditingDebts(debt);
        setIsModalOpen(true);
    };

    const handleDelete = async (DebtId)=> {
        try{
            await deleteDebts(DebtId);
            refreshDebts();
        } catch(err){
            console.error(err);
        }
    };

    return (
        <div className="debts-page">
            <div className="debts-top">
                <div>
                    <h2 className="debts-subtitle">Track who owes what</h2>
                </div>
                <button className="debts-add-btn" onClick={()=> {
                    setEditingDebts(null);
                    setIsModalOpen(true);
                }}>
                    + Add Debt
                </button>
            </div>

            <div className="debts-list">
                {debts.map((d) => {
                    const isOwe = d.debt_type === "i_owe";
                    const remaining = d.amount - d.paid_amount;
                    
                    const percentPaid = d.progress !== undefined 
                        ? d.progress : d.amount > 0 ? (d.paid_amount / d.amount) * 100 : 0;

                    return (
                        <div key={d.id} className="debt-card">
                            <div className="debt-header">
                                <div className="debt-avatar">
                                    {d.emoji}
                                </div>
                                <div className="debt-title-area">
                                    <div className="debt-name-row">
                                        <span className="debt-name">{d.person_name}</span>
                                        <span className={`badge ${isOwe ? "badge-owe" : "badge-lent"}`}>
                                            {isOwe ? "I OWE" : "LENT TO"}
                                        </span>
                                    </div>
                                    <div className="debt-description"><span>{d.description}</span>
                                    {d.due_date && ( <span className="debt-due-date">• Due {new Date(d.due_date).toLocaleDateString("en-IN")}
                                    </span>)}
                                    </div>
                                </div>
                            </div>

                            <div className="debt-metrics-grid">
                                <div className="metric-box">
                                    <span className="metric-label">{isOwe ? "TOTAL" : "LENT"}</span>
                                    <span className="metric-val text-dark">₹{(d.amount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-label">{isOwe ? "PAID" : "RETURNED"}</span>
                                    <span className="metric-val text-green">₹{(d.paid_amount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-label">{isOwe ? "REMAINING" : "PENDING"}</span>
                                    <span className="metric-val text-red">₹{(remaining).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {d.total_emis && (
                                 <div className="debt-extra-info">
                                 <span>EMI: ₹{(d.emi_amount).toLocaleString("en-IN")} / {d.emi_frequency}</span>
                                 <span>Day {d.emi_day}</span>
                                 <span>{d.emis_paid} of {d.total_emis} EMIs</span>
                                 </div>
                            )}

                            <div className="debt-progress-bar-container">
                                <div 
                                    className="debt-progress-fill" 
                                    style={{ width: `${Math.min(percentPaid, 100)}%` }}
                                ></div>
                            </div>

                            <div className="debt-footer">
                                <div className="debt-footer-left">
                                    {d.extraInfo && <span>{d.extraInfo}</span>}
                                </div>
                                <div className="debt-actions-group">
                                    <button className="action-btn" onClick={() => openEditModal(d)}>Edit</button>
                                    <button className="action-btn delete" onClick={() => handleDelete(d.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DebtsModal isOpen={isModalOpen}
                editingDebts={editingDebts}
                onClose={() => {
                setIsModalOpen(false);
                setEditingDebts(null);
                }}
                onAdd={refreshDebts}/>
        </div>
    );
}

export default DebtsLoan;