const API_URL = "http://localhost:5000/api";

const fetchTransactions = async () => {
    try{
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();

    if(!response.ok){
        throw new Error(data.error || "Failed to fetch transactions");
    }
    return data;
}
catch(err){
    throw err;
}
};

    const deleteTransactions = async (transactionId) => {
        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/transactions/${transactionId}`,{
                method: "DELETE",
                
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                    }
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.error || "Failed to delete transaction");
            }
            return data;
        }
        catch(err){
            throw err;
        }
    };

export { fetchTransactions, deleteTransactions};
