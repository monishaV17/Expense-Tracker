import {React, useState} from "react";

function Transactions(){

    const [Transactions,setTransactions]=useState([]);
    const [formData,setFormData]=useState(
        {amount:"",txn_type:"expense",category_id:"",source_id:"",description:"",date:""});

    return (
        
            <div className="transaction-page">
                <h2>Transactions</h2>
                <form onSubmit={handleSubmit}>
                    <button class="close-btn">&#10005;</button>
                    <input type="number" placeholder="₹ Amount" value={formData.amount} 
                    onChange={e=> setFormData({...formData,amount: e.target.value})} required />

                    <select value={formData.txn_type}
                    onChange={e=> setFormData({...formData,txn_type: e.target.value})} required />
                    <option className="income">Income</option>
                    <option className="expense">Expense</option>
                    <option className="transfer">Transfer</option>

                    <input placeholder="Category ID" value={formData.category_id} 
                    onChange={e=> setFormData({...formData,category_id: e.target.value})} required />

                    <input placeholder="Source ID" value={formData.source_id} 
                    onChange={e=> setFormData({...formData,source_id: e.target.value})} required />

                    <input type="date" value={formData.date} 
                    onChange={e=> setFormData({...formData,date: e.target.value})} required />

                    <input placeholder="Description" value={formData.description} 
                    onChange={e=> setFormData({...formData,description: e.target.value})} required />

                    <button type="submit">Add Transaction</button>
                </form>

                <ul>
                    {Transactions.map(tx => (
                        <li key={tx.id}>
                            {tx.date} - {tx.txn_type} - ₹{tx.amount} ({tx.category_id})
                        </li>
                    ))}
                </ul>
            </div>
    )
}