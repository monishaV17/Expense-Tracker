import React, {useState} from "react";
import '../static/sidebar.css';

function SideBar(){

    const sidebarData=[{
    title: "OVERVIEW",
    items: [
      { id: "dash", label: "Dashboard", icon: "ti-layout-dashboard" },
      { id: "trans", label: "Transactions", icon: "ti-list" }
    ]
    },
    {
    title: "MONEY",
    items: [
      { id: "source", label: "Sources", icon: "ti-credit-card" },
      { id: "debts", label: "Debts & Loans", icon: "ti-users" },
      { id: "coupons", label: "Coupons", icon: "ti-tag" },
      { id: "budgets", label: "Budgets", icon: "ti-currency-rupee" }
        ]
    },
    {
    title: "CONFIGURE",
    items: [
      { id: "cats", label: "Categories", icon: "ti-category" },
      { id: "notif", label: "Notifications", icon: "ti-bell", badge: 2 }
        ]
    }
    ];
const [activeItem,setActiveItem]=useState('dash');

    return(
        <aside className="sidebar">

            <div className="sidebar-logo">
                    <div  className="logo-icon">
                        <i className="ti ti-wallet" />
                    </div>
                    <span className="logo-name">JustFine</span>
                </div>

            <div className="balance-card">
                <span className="balance-label">TOTAL BALANCE</span>
                <h3 className="balance-amount">₹0</h3>
                <div className="balance-available">Available ₹0</div>
            </div>

            <nav className="nav-sidebar">
            {sidebarData.map((section)=>(
                <div key={section.title} className="menu-section">
                    <h3 className="section-title">{section.title}</h3>
                    <ul>
                        {section.items.map((item) => (
                        <li
                            key={item.id}
                            className={`nav-item 
                            ${activeItem === item.id ? 'active' : ''}`} 
                            onClick={()=>setActiveItem(item.id)}>
                            <i className={`ti ${item.icon}`} />
                            <span className="label">{item.label}</span>
                            {item.badge && (<span className="nav-badge">{item.badge}</span>
                            )}
                        </li>
                     ))}
                    </ul>
                </div>
            ))}
            </nav>

            <div className="sidebar-user">
                <div className="user-avatar">Moni</div>
                <div className="user-info">
                    <div className="user-name">john_doe</div>
                    <div className="user-email">john@example.com</div>
                </div>
            </div>
        </aside>
    
    );
}

export default SideBar;