import React, { useState, useEffect } from "react";
import "../static/ModalTransac.css";

const API_URL = "http://127.0.0.1:5000/api";

const INITIAL_FORM_STATE = {
    name: "",
    description: "",
    emoji: "",
    color: "#9CA3AF",
};

function CategoryModal({ isOpen, onClose, onAdd, editingCategory }) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name || "",
                description: editingCategory.description || "",
                emoji: editingCategory.emoji || "",
                color: editingCategory.color || "#9CA3AF",
            });
        } else {
            setFormData(INITIAL_FORM_STATE);
        }

        setError(null);
    }, [editingCategory, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const url = editingCategory
                ? `${API_URL}/categories/${editingCategory.id}`
                : `${API_URL}/categories`;

            const method = editingCategory ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (typeof onAdd === "function") {
                    await onAdd();
                }
                onClose();
            } else {
                setError(
                    data.error ||
                    (editingCategory
                        ? "Failed to update category"
                        : "Failed to add category")
                );
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="close-btn"
                    onClick={onClose}
                >
                    ✕
                </button>

                <form onSubmit={handleSubmit}>

                    <input
                        className="form-input"
                        name="name"
                        placeholder="Category name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="form-input"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <input
                        className="form-input"
                        name="emoji"
                        placeholder="Emoji (🍕)"
                        value={formData.emoji}
                        onChange={handleChange}
                    />

                    <input
                        className="form-input"
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                    />

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading
                            ? editingCategory
                                ? "Updating..."
                                : "Adding..."
                            : editingCategory
                            ? "Update Category"
                            : "Add Category"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default CategoryModal;