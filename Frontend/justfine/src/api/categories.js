const API_URL = "http://127.0.0.1:5000/api"

const fetchCategories = async ()=> {
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/categories`,{
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error || "Failed to fetch categories");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

const deleteCategories = async (categoryId)=>{
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/categories/${caetgoryId}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                }
        });
        const data = await response.json();
        if(!response.ok){
            throw new Error(data.error || "Failed to delete category");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

export {fetchCategories, deleteCategories};