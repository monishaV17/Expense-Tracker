import React, { useState, useEffect} from "react";
import '../static/Dashboard.css';
import {Pie} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import TransactionModal from "./TransactionModal";
import fetchTransactions from "../api/transactions";
import {fetchSources} from "../api/sources";

ChartJS.register(ArcElement, Tooltip, Legend)

function Dashboard(){

    const [accounts,setAccounts]=useState([]);

    const[categories,setCategories]=useState([
                        { name: "Food", count: 5, color: "#2563eb" },
                        { name: "Transport", count: 3, color: "#f59e0b" },
                        { name: "Bills & Utilities", count: 2, color: "#10b981" },
                        { name: "Shopping", count: 4, color: "#ef4444" }
                        ]);

    const[isModalOpen,setIsModalOpen] = useState(false);
    const[selectedType,setSelectedType] = useState("expense");
    const[balance,setBalance] = useState(0);
    const[availableBalance,setAvailableBalance] = useState(0);
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

    const loadTransactions = async () => {
        try{
            const data = await fetchTransactions();
            setTransactions(data);
        } catch(err){
            console.error(err);
        }
    };

    useEffect(()=>{
        loadTransactions();
    },[]);

    useEffect(()=>{
        let total = 0, totalExpense=0;
        transactions.forEach((tx) =>{
            if(tx.txn_type === "income" || tx.txn_type === "debt_in"){
                total += tx.amount;
            }
            else if(tx.txn_type === "expense" || tx.txn_type === "debt_out"){
                 totalExpense += tx.amount;
            }
        });
        const available = total - totalExpense;
        setBalance(total);
        setAvailableBalance(available);
    },[transactions]);

    const loadSources = async () =>{
        try{
            const data = await fetchSources();
            setAccounts(data);
        }
        catch(err){
            console.error(err);
        }
    };

    useEffect(() => {
        loadSources();
    }, []);
    
    return(
        <div className="dashboard-card">
            <div className="dashboard-top-row">
            <div className="dashboard-balance-card">
                <span className="dashboard-balance-label">TOTAL BALANCE</span>
                <h3 className="dashboard-balance-amount">₹{balance.toLocaleString("en-IN")}</h3>
                <div className="dashboard-balance-available">Available ₹{availableBalance.toLocaleString("en-IN")}</div>
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
                {accounts.length > 0 ? (
                    accounts.map((acc, index)=>(
                    <div className="account-card" key={index}>
                    <span className="name">{acc.name.toUpperCase()}</span>
                    <p className="balance">₹{(acc.amount/100).toLocaleString("en-IN")}</p>
                    <span className="type">{acc.is_savings ? "Savings" : "Checking"}</span>
                    </div>
                ))
                ) : (<p>No accounts yet</p>)
            }
            </div>
            <TransactionModal isOpen={isModalOpen} initialType={selectedType}
                              onClose={() => setIsModalOpen(false)}
                              onAdd={loadTransactions}/>
    </div>
    );
}

export default Dashboard;