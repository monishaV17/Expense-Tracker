const API_URL = "http://127.0.0.1:5000/api"

const fetchCoupons = async ()=> {
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/coupons`,{
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error || "Failed to fetch coupon");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

const deleteCoupons = async (couponId)=>{
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/coupons/${couponId}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
                }
        });
        const data = await response.json();
        if(!response.ok){
            throw new Error(data.error || "Failed to delete coupon");
        }
        return data;
    }
    catch(err){
        throw err;
    }
};

export {fetchCoupons, deleteCoupons};