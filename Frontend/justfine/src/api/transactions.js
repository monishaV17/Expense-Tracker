const API_URL = "http://127.0.0.1:5000/api";

async function fetchTransactions() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/transactions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch transactions");
        }
        return data;
    } catch (err) {
        throw err;
    }
}

export default fetchTransactions;