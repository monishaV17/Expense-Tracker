const API_URL = "http://127.0.0.1:5000/api";

const fetchDebts = async ()=> {
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/debts`,{
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error || "Failed to fetch debt");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

const deleteDebts = async (debtId)=>{
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/debts/${debtId}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                }
        });
        const data = await response.json();
        if(!response.ok){
            throw new Error(data.error || "Failed to delete debt");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

export {fetchDebts, deleteDebts};