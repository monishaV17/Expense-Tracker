import React from "react";
import '../static/sidebar.css';
import { useNavigate, useLocation } from "react-router-dom";

function SideBar(){
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarData = [
      {
        title: "OVERVIEW",
        items: [
          { id: "dash", label: "Dashboard", icon: "ti-layout-dashboard", path: "/dashboard" },
          { id: "trans", label: "Transactions", icon: "ti-list", path: "/transaction"}
        ]
      },
      {
        title: "MONEY",
        items: [
          { id: "source", label: "Sources", icon: "ti-credit-card", path: "/sources"},
          { id: "debts", label: "Debts & Loans", icon: "ti-users", path: "/debts"},
          { id: "coupons", label: "Coupons", icon: "ti-tag", path: "/coupons"},
          { id: "budgets", label: "Budgets", icon: "ti-currency-rupee", path: "/budgets" }
        ]
      },
      {
        title: "CONFIGURE",
        items: [
          { id: "cats", label: "Categories", icon: "ti-category", path: "/categories"}
        ]
      }
    ];

    const handleLogout = () => {
        navigate('/login');
    };

    return(
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <i className="ti ti-wallet" />
                </div>
                <span className="logo-name">JustFine</span>
            </div>

            <div className="user">
                <div className="user-avatar">
                    <i className="ti ti-user" />
                </div>
                <div className="user-info">
                    <div className="user-name">Moni</div>
                    <div className="user-email">moni@example.com</div>
                    <div className="user-createdat">2022-07-22 20:43</div>
                </div>
            </div>

            <nav className="nav-sidebar">
                {sidebarData.map((section)=>(
                    <div key={section.title} className="menu-section">
                        <span className="section-title">{section.title}</span>
                        <ul>
                            {section.items.map((item) => (
                                <li
                                    key={item.id}
                                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} 
                                    onClick={() => navigate(item.path)}>
                                    <i className={`ti ${item.icon}`} />
                                    <span className="label">{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="logout-card">
                <button className="logout-btn" onClick={handleLogout}>
                    <i className="ti ti-logout" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default SideBar;