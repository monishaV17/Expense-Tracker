import React, { useState, useEffect } from "react";
import "../static/ModalTransac.css";

const API_URL = "http://127.0.0.1:5000/api";

const INITIAL_FORM_STATE = {
    name: "",
    description: "",
    amount: "",
    remaining_amount: "",
    card_number: "",
    expiry_date: "",
    is_active: true,
};

function CouponModal({ isOpen, onClose, onAdd, editingCoupon}) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(editingCoupon) {
            setFormData({
                    name: editingCoupon.name || "",
                    description: editingCoupon.description || "",
                    amount: editingCoupon.amount ? editingCoupon.amount : "",
                    remaining_amount: editingCoupon.remaining_amount ? 
                                      editingCoupon.remaining_amount : "",
                    card_number: editingCoupon.card_number || "",
                    expiry_date: editingCoupon.expiry_date ? editingCoupon.expiry_date.slice(0, 10) : "",
                    is_active: editingCoupon.is_active,
            });
        } else {
            setFormData(INITIAL_FORM_STATE);
        }
        setError(null);
    }, [editingCoupon, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload={
                    name: formData.name || "",
                    description: formData.description || "",
                    amount: formData.amount ? formData.amount : "",
                    remaining_amount: formData.remaining_amount ? Number(formData.remaining_amount)
                                    : Number(formData.amount),
                    card_number: formData.card_number || "",
                    expiry_date: formData.expiry_date || "",
                    is_active: formData.is_active,
                    };

        try{
            const token = localStorage.getItem("token");
            const url = editingCoupon ? `${API_URL}/coupons/${editingCoupon.id}`
                                         : `${API_URL}/coupons`;
            const method = editingCoupon ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const data=await response.json();
            if (response.ok) {
                if (typeof onAdd === "function") {
                    await onAdd(); 
                }
                onClose();
            } else {
                setError(data.message || (editingCoupon ? "Failed to update coupon" : "Failed to add coupon"));
            }
        } catch (err) {
            setError(`Error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="close-btn" onClick={onClose}>✕</button>

                <form onSubmit={handleSubmit}>
                    <input className="form-input" name="name" placeholder="Coupon name" value={formData.name}
                        onChange={handleChange} required />

                    <input className="form-input" name="description" placeholder="Description" value={formData.description}
                        onChange={handleChange} />

                    <input className="form-input" name="amount" type="number" placeholder="Amount" value={formData.amount}
                        onChange={handleChange} required />

                    <input className="form-input" name="remaining_amount" type="number" placeholder="Remaining amount"
                        value={formData.remaining_amount} onChange={handleChange} />
 
                    <input className="form-input" name="card_number" placeholder="Card number" value={formData.card_number}
                        onChange={handleChange} />

                    <input className="form-input" name="expiry_date" type="date"  value={formData.expiry_date}
                        onChange={handleChange} />

                    <label className="checkbox-row">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}/>
                        Active coupon
                    </label>

                    <button type="submit" disabled={loading}>
                    {loading ? (editingCoupon  ? "Updating..." : "Adding...")
                                 : (editingCoupon ? "Update Coupon" : "Add Coupon")}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CouponModal;
