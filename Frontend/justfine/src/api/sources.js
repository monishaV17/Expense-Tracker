const API_URL = "http://localhost:5000/api/sources";

const fetchSources = async () => {
    try{
    const token = localStorage.getItem("token");
    const response = await fetch(API_URL, {
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

export default fetchSources;