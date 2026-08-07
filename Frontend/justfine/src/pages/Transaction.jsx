import { useEffect, useState, useCallback } from "react";
import '../static/Transaction.css';
import FilterBox from '../components/FilterBox';
import TransactionModal from './TransactionModal';
import { fetchTransactions, deleteTransactions } from "../api/transactions";

function Transaction() {
    const [transactions, setTransactions] = useState([]);
    const [active, setActive] = useState("All");
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(""), 2000);
    };

    const filters = ["All", "Income", "Expense", "Transfer", "Debts", "Adjustments"];

    const filteredTransactions = active === "All"
        ? transactions
        : active === "Debts"
            ? transactions.filter((tx) => tx.txn_type === "debt_in" || tx.txn_type === "debt_out")
            : transactions.filter((tx) => tx.txn_type.toLowerCase() === active.toLowerCase());

    const openAddModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const loadTransactions = useCallback(async () => {
        try {
          const data = await fetchTransactions();
          setTransactions(data);
        } catch(err) {
          console.error(err);
        } finally{
            setLoading(false);
        }
      }, []);

    useEffect(() => {
        loadTransactions();
    },[loadTransactions]);

    useEffect(() => {
        window.addEventListener("transactions-updated", loadTransactions);
        return () => window.removeEventListener("transactions-updated", loadTransactions);
    }, [loadTransactions]);

    const handleDelete = async (id) => {
        try {
            await deleteTransactions(id);
            loadTransactions();
        } catch (err) {
            showMessage(err.message);
        }
    };

    return (
        <div className="transaction-page">
            <h2>All Transactions</h2>
            <FilterBox filters={filters} active={active} onChange={setActive} />
            {loading ? (
                <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                </div>
                ) : filteredTransactions.length === 0 ? (
                <p className="empty-state">No transactions yet</p>
                ) : (
                <ul>
                    {filteredTransactions.map(tx => (
                        <li key={tx.id} className={`txn-item ${tx.txn_type}`}>
                            <span className="txn-date">
                                {tx.created_at ? tx.created_at.split("T")[0] : ""}
                            </span>
                            <span className="txn-desc">{tx.description}</span>
                            <span className="txn-source">{tx.source_name}</span>
                            <span className={`txn-type-badge ${tx.txn_type}`}>{tx.txn_type}</span>
                            <span className="txn-category">{tx.category_name} </span>
                            <span className={`txn-amount ${tx.txn_type}`}>
                                {tx.txn_type === "income" ? "+" : "−"}₹{tx.amount}
                            </span>
                            <div className="bd-actions-group"><br/>
                                <button className="tr-action-btn" onClick={() => openEditModal(tx)}>Edit</button>
                                <button className="tr-action-btn-delete" onClick={() => handleDelete(tx.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {message && <p className="message">{message}</p>}

            <TransactionModal
                isOpen={isModalOpen}
                editingTransaction={editingTransaction}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onAdd={loadTransactions}
            />
        </div>
    );
}

export default Transaction;