import React from "react";
import React, {userState} from "react";

function SideBar(){

    const sidebarData=[{
    title: "OVERVIEW",
    items: [
      { id: "dash", label: "Dashboard", icon: "⊞" },
      { id: "trans", label: "Transactions", icon: "︙" }
    ]
    },
    {
    title: "MONEY",
    items: [
      { id: "source", label: "Sources", icon: "💳" },
      { id: "debts", label: "Debts & Loans", icon: "👥" },
      { id: "coupons", label: "Coupons", icon: "🏷️" },
      { id: "budgets", label: "Budgets", icon: "₹" }
        ]
    },
    {
    title: "CONFIGURE",
    items: [
      { id: "cats", label: "Categories", icon: "⊘" },
      { id: "notif", label: "Notifications", icon: "🔔", badge: 2 }
        ]
    }
    ];
const [activeItem,setActiveItem]=useState('dash');

    return(
        <div className="sidebar">
            <div className="logo-card">
                <div  className="logo">
                    <h3>JustFine</h3>
                </div>
            </div>
            <div className="Total-balance">
                <span>TOTAL BALANCE</span>
                <h3>₹{}</h3>
                <div className="availabe">
                    <span>Available ₹{}</span>
                </div>
            </div>
            {sidebarData.map((section)=>(
                <div key={section.title} className="menu-section">
                    <h3 className="section-title">{section.title}</h3>
                    <ul>
                        {section.items.map((item) => (
                        <li
                            key={item.id}
                            className={`menu-item 
                            ${activeItem === item.id ? 'active' : ''}`} 
                            onClick={()=>setActiveItem(item.id)}>

                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                            {item.badge && <span className="badge">{item.badge}</span>}
                    </li>
                    ))}
                </ul>
            </div>
            ))}
        </div>
    );
}