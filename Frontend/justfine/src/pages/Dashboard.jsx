import React, { useState, useEffect} from "react";
import '../static/Dashboard.css';
import {Pie} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import TransactionModal from "./TransactionModal";

ChartJS.register(ArcElement, Tooltip, Legend)

const API_URL = "http://127.0.0.1:5000/api";

function Dashboard(){

    const [accounts,setAccounts]=useState([
        { bankName: "HDFC BANK", balance: '₹20000', type: "Checking" },
        { bankName: "SBI BANK", balance: '₹17750', type: "Savings" },
        { bankName: "PETTY CASH", balance: '₹2500', type: "Cash" }
    ]);

    const[categories,setCategories]=useState([
                        { name: "Food", count: 5, color: "#2563eb" },
                        { name: "Transport", count: 3, color: "#f59e0b" },
                        { name: "Bills & Utilities", count: 2, color: "#10b981" },
                        { name: "Shopping", count: 4, color: "#ef4444" }
                        ]);

    const[isModalOpen,setIsModalOpen] = useState(false);
    const[selectedType,setSelectedType] = useState("expense");
    const[balance,setBalance] = useState(0);
    const[transactions,setTransactions] = useState([]);

    const openModal=(type)=>{
        setSelectedType(type);
        setIsModalOpen(true);
      };

    const data={
            labels: categories.map(c => c.name),
            datasets: [
            {
                data: categories.map(c => c.count),
                backgroundColor: categories.map(c => c.color),
                borderColor: "#fff",
                borderWidth: 2,
            },
            ],
        };

    const pieOptions={
        responsive:true,
        plugins:{legend: {position: "bottom",}
    }
    };

    const handleAddTransaction=(newTransaction) => {
        console.log("Transaction Added:", newTransaction);
    }

    return(
        <div className="dashboard-card">
            <div className="dashboard-top-row">
            <div className="dashboard-balance-card">
                <span className="dashboard-balance-label">TOTAL BALANCE</span>
                <h3 className="dashboard-balance-amount">₹1</h3>
                <div className="dashboard-balance-available">Available ₹0</div>
                <div className="transaction-type">
                    <button className="btn" onClick={() => openModal("income")}>
                        <i className="ti ti-arrow-down-left"></i>Income
                    </button>
                    <button className="btn" onClick={() => openModal("expense")}>
                        <i className="ti ti-arrow-up-right"></i>Expense
                    </button>
                    <button className="btn" onClick={() => openModal("transfer")}>
                        <i className="ti ti-arrows-exchange"></i>Transfer
                    </button>
                </div>
            </div>

                {categories.length> 0 ? (
                    <div className="chart-box">
                    <h4 className="chart-title">Spending by Category</h4> 
                    <Pie data={data} options={pieOptions}/>
                    </div>
                    ) : (<p className="chart-empty">No category data yet</p>)
                }
            </div>

            <div className="dashboard-account">
                {accounts.map((acc, index)=>(
                    <div className="account-card" key={index}>
                    <span className="name">{acc.bankName}</span>
                    <p className="balance">{acc.balance}</p>
                    <span className="type">{acc.type}</span>
                    </div>
                ))}
            </div>
            <TransactionModal isOpen={isModalOpen} initialType={selectedType}
                              onClose={() => setIsModalOpen(false)}
                              onAdd={handleAddTransaction}/>
    </div>
    );
}

export default Dashboard;