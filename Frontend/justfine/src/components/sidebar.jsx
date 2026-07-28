import React from "react";
import '../static/sidebar.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:5000/api/auth";

function SideBar(){
    const navigate=useNavigate();
    const location=useLocation();
    const [created_at,setCreated_at]=useState("");
    const[userInfo,setUserInfo]=useState({username:'',email:'',created_at:''});
    const[message,setMessage]=useState("");

    const showMessage=(text) => {
        setMessage(text);
        setTimeout(() => {
        setMessage("");
        }, 2000);
    }

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

    useEffect(()=>{
    const fetchUserInfo=async()=>{
        const token=localStorage.getItem("token");
        if(!token){
            navigate('/login');
            return;
        }
        try{
            const response=await fetch(`${API_URL}/me`,{
                method:'GET',
                headers: {Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
             }
            });
            if(!response.ok){
                throw new Error('Failed to fetch user info');
            }
            const data=await response.json();
            setUserInfo({username:data.username,
                email:data.email,
                created_at:data.created_at ? new Date(data.created_at).toLocaleDateString() : ""
            })
        }catch(error){
            console.error('Error fetching user info:',error);
            setUser({
                username: 'Unknown',
                email: '',
                created_at: ''
            });
        }
    }
    fetchUserInfo();
    },[navigate]);

    const handleLogout=async()=>{
        const token=localStorage.getItem('token');
        try{
            const response=await fetch(`${API_URL}/logout`,{
                method:'POST',
                headers:{'Authorization':`Bearer ${token}`},
                'Content-Type': 'application/json'
            })
            if(response.ok){
                const data=await response.json();
                showMessage(data.message)
        }
        }
        catch(error){
            console.error('Error logging out:',error);
        }
        finally{
            localStorage.removeItem('token');
            window.location.href = '/';
            
        }
        }

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
                    <div className="user-name">{userInfo.username}</div>
                    <div className="user-email">{userInfo.email}</div>
                    {userInfo.created_at && (<div className="user-createdat">Joined on : {userInfo.created_at}  
                    </div>)}
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
            {message && <p className="message">{message}</p>}
        </aside>
    );
}

export default SideBar;