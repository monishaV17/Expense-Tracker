import {useState} from "react";
import '../static/ModalTransac.css';

const INITIAL_FORM_STATE={ name: "",amount: ""};

function PartitionsModal({ isOpen, onClose, onAdd }){
    const [formData, setFormData]=useState(INITIAL_FORM_STATE);

      if (!isOpen) return null;

       const handleChange = (e) => {
        const { name, value }=e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

     const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            name: formData.name,
            amount: Number(formData.amount) * 100,
            id: Date.now()
        });
        setFormData(INITIAL_FORM_STATE);
        onClose();
    };

     return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={onClose}>✕</button>
                
                <form onSubmit={handleSubmit}>
                    <input className="form-input" name="name" placeholder="Partition name" value={formData.name} onChange={handleChange} required/>
                    <input className="form-input" name="amount" type="number" placeholder="Amount (₹)" value={formData.amount} onChange={handleChange} />
                    <button type="submit">Add Partition</button>
                </form>
            </div>
        </div>
    );
}

export default PartitionsModal;