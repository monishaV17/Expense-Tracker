import { useState } from "react";
import '../static/TopBar.css';
import ToggleTheme from "./ToggleTheme";
import TransactionModal from "../pages/TransactionModal";

function TopBar({headerLabel, onAddTransaction}) {
  const [search, setSearch]=useState('');
  const [isModalOpen, setIsModalOpen]=useState(false);


const handleNotify=()=>{
    alert("notification clicked");
}

    return (
        <header className="top-bar">
            <h3>{headerLabel}</h3>
            <input className="search" type="text" placeholder="🔍 Search transactions..." value={search} onChange={(e)=> setSearch(e.target.value)}/>
            <ToggleTheme /> 
            <div className="add-trans">
                <button type="button" onClick={(handleTransaction)=> setIsModalOpen(true)}>+ Add Transaction</button>
            </div>
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={onAddTransaction} />
        </header>
    )
}

export default TopBar;