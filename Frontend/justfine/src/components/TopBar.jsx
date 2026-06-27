import { useState } from "react";
import '../static/TopBar.css';

function TopBar({headerLabel}) {
  const [search, setSearch]=useState('');


const handleNotify=()=>{
    alert("notification clicked");
}

const handleTrans=()=>{
    alert("transaction clicked");
}

    return (
        <header className="top-bar">
            <h3>{headerLabel}</h3>
            <input className="search" type="text" placeholder="🔍 Search transactions..." value={search} onChange={(e)=> setSearch(e.target.value)}/>
            <div className="notification">
                <button type="button" onClick={handleNotify}>
                     <i className="ti ti-bell"></i>
                </button>
            </div>
            <div className="add-trans">
                <button type="button" onClick={handleTrans}>+ Add Transaction</button>
            </div>
        </header>
    )
}

export default TopBar;