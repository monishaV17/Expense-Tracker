import React, {useState,useEffect} from "react";
import '../static/ModalTransac.css';

function TransactionModal({isOpen, onClose, onAdd, initialType}){

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

    const [formData,setFormData]=useState({
        amount: "",
        txn_type: "expense",
        category_id: "",
        source_id: "",
        description: "",
        date: ""
    });

    useEffect(()=>{
        if(isOpen) {
          setFormData((prev)=>({
            ...prev,
            txn_type: initialType,
          }));
        }
      }, [isOpen, initialType]);

    const handleClose=(e)=>{
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        setFormData({ amount:"", txn_type: "expense", category_id:"", source_id:"", description:"", date:"" });
        if(typeof onClose === "function"){
            onClose();
        }
    };

    if(!isOpen){
        return null;
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        onAdd({ ...formData, id: Date.now() });
        setFormData({amount: "",txn_type:"expense",category_id: "",source_id: "",description: "",date: ""});
        if(typeof onClose === "function"){
            onClose();
        }
    }

    return (
        
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-content" onClick={(e)=> e.stopPropagation()}>
                    <button type="button" className="close-btn" onClick={handleClose}>✕</button>
                <form onSubmit={handleSubmit}>
                    <input type="number" placeholder="₹ Amount" value={formData.amount} 
                    onChange={e=> setFormData({...formData,amount: e.target.value})} required />

                    <select value={formData.txn_type}
                    onChange={e=> setFormData({...formData,txn_type: e.target.value})} required >
                    <option value="">Select Type</option>
                    {transactionTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                    </select>

                    <select placeholder="Category" value={formData.category_id} 
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

                    <input type="date" value={formData.date} 
                    onChange={e=> setFormData({...formData,date: e.target.value})} required />

                    <input type="text" placeholder="Description" value={formData.description} 
                    onChange={e=> setFormData({...formData,description: e.target.value})} />

                    <button type="submit">Add Transaction</button>
                </form>
                </div>
            </div>
    )
}

export default TransactionModal;