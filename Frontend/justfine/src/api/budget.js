const API_URL = "http://127.0.0.1:5000/api"

const fetchBudgets = async ()=> {
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/budgets`,{
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error || "Failed to fetch budget");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

const deleteBudgets = async (budgetId)=>{
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/budgets/${budgetId}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                }
        });
        const data = await response.json();
        if(!response.ok){
            throw new Error(data.error || "Failed to delete budget");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

export {fetchBudgets, deleteBudgets};