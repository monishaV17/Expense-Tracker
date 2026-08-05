import {useState, useEffect} from "react";
import '../static/Transaction.css';
import FilterBox from '../components/FilterBox';
import TransactionModal from './TransactionModal';
import fetchTransactions  from "../api/transactions";

const API_URL = "http://127.0.0.1:5000/api";

function Transaction(){
    const[transactions,setTransactions]=useState([]);
    const[active,setActive]=useState("All");
    const[editingTransaction, setEditingTransaction]=useState(null);
    const[isModalOpen,setIsModalOpen]=useState(false);
    const[message,setMessage]=useState("");

    const showMessage=(text) => {
        setMessage(text);
        setTimeout(() => {
        setMessage("");
    }, 2000);
    }
    const filters = ["All", "Income", "Expense", "Transfer", "Debts", "Adjustments"];
    const filteredTransactions = active === "All" ? transactions : active === "Debts"
                                ? transactions.filter((tx) => tx.txn_type === "debt_in" ||
                                tx.txn_type === "debt_out") : transactions.filter(
                                (tx) => tx.txn_type.toLowerCase() === active.toLowerCase());
                
    const openEditModal=(transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const loadTransactions = async () => {
        try {
            const data = await fetchTransactions();
            setTransactions(data);
        } catch (err) {
            showMessage(err.message);
        }
    };
    
    useEffect(() => {
        loadTransactions();
    }, []);

    const handleDelete = async (id)=>{
        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/transactions/${id}`,{
                method : "DELETE",
                headers : {Authorization : `Bearer ${token}`,},
            });

            const data = await response.json();
            if(response.ok){
                const data = await fetchTransactions();
                setTransactions(data);
            }
            else{
                showMessage(data.error || "Failed to delete transaction");
            }
        } catch(err){
            console.error(err);
        }
    };

    return (
        <div className="transaction-page">
            <h2>All Transactions</h2>
            <FilterBox filters={filters} active={active} onChange={setActive} />
                {filteredTransactions.length === 0 ? (
                    <p className="empty-state">No transactions yet</p>
                ) : (
                    <ul>
                        {filteredTransactions.map(tx => (
                            <li key={tx.id} className={`txn-item ${tx.txn_type}`}>
                                <span className="txn-date">{new Date(tx.created_at).toLocaleDateString()}</span>
                                <span className="txn-desc">{tx.description}</span>
                                <span className={`txn-type-badge ${tx.txn_type}`}>{tx.txn_type}</span>
                                <span className="txn-category">{tx.category_name} </span>
                                <span className={`txn-amount ${tx.txn_type}`}>
                                    {tx.txn_type === "income" ? "+" : "−"}₹{tx.amount}
                                </span>
                                <div className="bd-actions-group"><br/>
                                    <button className="bd-action-btn" onClick={() => openEditModal(tx)}>Edit</button>
                                    <button className="bd-action-btn delete" onClick={() => handleDelete(tx.id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    )}
                    {message && <p className="message">{message}</p>}
                    <TransactionModal
                    isOpen={isModalOpen}
                    editingTransaction={editingTransaction}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={loadTransactions} />
        </div>
    );
}

export default Transaction;