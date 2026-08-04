import {useState, useEffect} from "react";
import '../static/ModalTransac.css';

const API_URL = "http://127.0.0.1:5000/api";

const INITIAL_FORM_STATE={ name: "",amount: ""};

function PartitionsModal({ isOpen, onClose, onAdd, editingPartition, sourceId }){
    const [formData, setFormData]=useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        if(editingPartition){
            setFormData({
                name: editingPartition.name || "",
                amount: editingPartition.amount ? editingPartition.amount : "",
        });
    } else{
        setFormData(INITIAL_FORM_STATE);
    }
}, [editingPartition, isOpen]);

      if (!isOpen) return null;

       const handleChange = (e) => {
        const { name, value }=e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

     const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            source_id: sourceId,
            name: formData.name,
            amount: Number(formData.amount),
        };
        try{
            const token = localStorage.getItem("token");
            const url = editingPartition 
                        ? `${API_URL}/sources/partitions/${editingPartition.id}`
                        : `${API_URL}/sources/partitions`;
            const method = editingPartition ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            });

            const data = await response.json();
            if(response.ok){
                if(typeof onAdd === "function"){
                    await onAdd();
                }
                onClose();
            } else{
                alert(data.error || "Failed");
            }
        }
            catch(err){
                console.error(err);
            }
            finally{
                setLoading(false);
            }
        };

     return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={onClose}>✕</button>
                
                <form onSubmit={handleSubmit}>
                    <input className="form-input" name="name" placeholder="Partition name" value={formData.name} onChange={handleChange} required/>
                    <input className="form-input" name="amount" type="number" placeholder="(₹) Amount" value={formData.amount} onChange={handleChange} />
                    <button type="submit" disabled={loading}>
                        {loading ? (editingPartition ? "Updating..." : "Adding...")
                        : (editingPartition ? "Update Partition" : "Add Partition")}</button>
                </form>
            </div>
        </div>
    );
}

export default PartitionsModal;