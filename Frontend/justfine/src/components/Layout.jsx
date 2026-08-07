import { useState, useEffect, useCallback } from "react";
import '../static/Layout.css';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { Outlet, useLocation } from "react-router-dom";
import { fetchSources } from "../api/sources";
import { fetchDebts } from "../api/debts";
import { fetchCoupons } from "../api/coupon";

const pageTitles = {
  "/dashboard": "Dashboard","/transaction": "Transactions",
  "/sources": "Sources","/debts": "Debts & Loans",
  "/coupons": "Coupons","/budgets": "Budgets",
  "/categories": "Categories","/notifications": "Notifications",
};

function Layout(){
  const [headerLabel, setHeaderLabel] = useState("Dashboard");
  const [sources, setSources] = useState([]);
  const [debts, setDebts] = useState([]);
  const [coupons, setCoupons]=useState([]);
  const location = useLocation();
  const currentLabel = pageTitles[location.pathname] || "Dashboard";

  const loadSources = useCallback(async () => {
    try {
      const data = await fetchSources();
      setSources(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadDebts = useCallback(async ()=> {
    try{
        const data = await fetchDebts();
        setDebts(data);
    } catch(err){
        console.error(err);
    }
 },[]);

 const loadCoupons = useCallback(async () => {
  try{
      const data = await fetchCoupons();
      setCoupons(data);
  } catch(err){
      console.error(err);
  }
},[]);

  useEffect(() => {
    loadSources();
    loadDebts();
    loadCoupons();
  }, [loadSources, loadDebts, loadCoupons]);

  return (
    <div className="layout">
      <SideBar />
      <div className="layout-right">
        <TopBar headerLabel={currentLabel} />
        <main className="layout-content">
          <Outlet context={{
                             sources, refreshSources: loadSources,
                             debts,   refreshDebts: loadDebts,
                             coupons, refreshCoupons: loadCoupons  }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;