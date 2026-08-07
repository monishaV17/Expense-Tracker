import React, { useState, useEffect, useCallback } from "react";
import "../static/categories.css";
import CategoryModal from "./CategoryModal";
import { fetchCategories, deleteCategories } from "../api/categories";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally{
            setLoading(false);
        }
    },[]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const openAddModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            loadCategories();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Manage your categories</h2>
                <button className="add-category-btn" onClick={openAddModal}>+ Add Category</button>
            </div>

            <div className="categories-grid">
                {loading ? (
                    <div className="loading-spinner-container">
                    <div className="loading-spinner"></div>
                    </div>
                    )  : categories
                    .filter((cat) => cat.name !== "Tithe")
                    .sort((a, b) => (a.name === "Others" ? 1 : b.name === "Others" ? -1 : 0))
                    .map((cat) => (
                        <div
                            key={cat.id}
                            className={`cat-card ${cat.is_system ? "cat-system" : ""}`}
                            style={{
                                borderColor: cat.is_system
                                    ? "#F59E0B"
                                    : "#E6E9EE",
                            }}>

                            <div className="cat-emoji" style={{ backgroundColor: cat.color }}>
                                <span className="emoji">{cat.emoji}</span>
                            </div>

                            <div className="cat-body">
                                <div className="cat-name">{cat.name}</div>

                                <div className="cat-sub">
                                    {cat.description && <div>{cat.description}</div>}
                                    <div>{cat.count} transactions</div>
                                </div>

                                <div className="cat-actions">
                                    {!cat.is_system && (
                                    <>
                                    <button className="action-btn" onClick={() => openEditModal(cat)}>
                                        Edit
                                    </button>

                                    <button className="action-btn delete" onClick={() => handleDelete(cat.id)}>
                                        Delete
                                    </button>
                                    </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                editingCategory={editingCategory}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                }}
                onAdd={loadCategories}
            />
        </div>
    );
}

export default Categories;