import { useState, useEffect, useCallback } from "react";
import '../static/Layout.css';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { Outlet, useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard","/transaction": "Transactions",
  "/sources": "Sources","/debts": "Debts & Loans",
  "/coupons": "Coupons","/budgets": "Budgets",
  "/categories": "Categories",
};

function Layout(){
  const [headerLabel, setHeaderLabel] = useState("Dashboard");
  const location = useLocation();
  const currentLabel = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="layout">
      <SideBar />
      <div className="layout-right">
        <TopBar headerLabel={currentLabel} />
        <main className="layout-content">
        <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;