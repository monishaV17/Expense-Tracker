const API_URL = "http://localhost:5000/api";

const fetchSources = async () => {
    try{
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/sources`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();

    if(!response.ok){
        throw new Error(data.error || "Failed to fetch sources");
    }
    return data;
}
catch(err){
    throw err;
}
};

    const deleteSource = async (sourceId) => {
        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/sources/${sourceId}`,{
                method: "DELETE",
                
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                    }
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.error || "Failed to delete source");
            }
            return data;
        }
        catch(err){
            throw err;
        }
    };

    const deletePartition = async (partitionId) =>{
        try{
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/partitions/${partitionId}`,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                    }
            });
            const data = await response.json();
            if(!response.ok){
                throw new Error(data.error || "Failed to delete source");
            }
            return data;
        }
        catch(err){
            throw err;
        }
    };

export { fetchSources, deleteSource, deletePartition };
