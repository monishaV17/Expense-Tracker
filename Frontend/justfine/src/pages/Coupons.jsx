import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../static/Coupons.css";
import CouponModal from "./CouponModal";
import { deleteCoupons } from "../api/coupon";

function formatExpiry(date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function Coupons() {
    const { coupons, refreshCoupons } = useOutletContext();
    const [isModalOpen, setIsModalOpen]=useState(false);
    const [editingCoupon, setEditingCoupon]=useState(null);

    const openAddModal=() => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const openEditModal=(coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (couponId) => {
        try{
            await deleteCoupons(couponId);
            refreshCoupons();
        } catch(err){
            console.error(err);
        }
    };

    return (
        <div className="coupons-page">
            <div className="coupons-top">
                <div>
                    <h2 className="coupons-subtitle">Manage your coupons and gift cards</h2>
                </div>
                <button className="coupons-add-btn" onClick={openAddModal}>
                    + Add Coupon
                </button>
            </div>

            <div className="coupons-list">
                {coupons.map((coupon) => {
                    const percent=coupon.amount
                        ? Math.round((coupon.remaining_amount / coupon.amount)* 100)
                        : 0;

                    return (
                        <div key={coupon.id} className="coupon-card">
                            <div className="coupon-card-top">
                                <div className="coupon-name">{coupon.name}</div>
                                <div className="coupon-subtitle">
                                    {coupon.description} · Expires {formatExpiry(coupon.expiry_date)}
                                </div>
                            </div>

                            {coupon.card_number && (
                                <div className="coupon-code">{coupon.card_number}</div>
                            )}

                            <div className="coupon-foot">
                                <div className="coupon-value">
                                    <strong>₹{coupon.remaining_amount.toLocaleString("en-IN")}</strong> of ₹{coupon.amount.toLocaleString("en-IN")}
                                </div>
                                <div className="coupon-actions-group">
                                    <button className="coupon-action-btn" onClick={() => openEditModal(coupon)}>
                                        Edit
                                    </button>
                                    <button className="coupon-action-btn delete" onClick={() => handleDelete(coupon.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="coupon-progress-bar">
                                <div className="coupon-progress-fill" style={{ width: `${percent}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <CouponModal isOpen={isModalOpen}
                editingCoupon={editingCoupon}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCoupon(null);
                }}
                onAdd={refreshCoupons} />
        </div>
    );
}

export default Coupons;
