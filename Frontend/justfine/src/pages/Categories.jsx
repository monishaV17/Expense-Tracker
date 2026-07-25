import React from 'react';
import '../static/categories.css';

const mockCategories = [
  { id: '1', name: 'Food & Dining', emoji: '🍕', color: '#FDE68A', count: 12, is_system: false },
  { id: '2', name: 'Transport', emoji: '🚗', color: '#D1FAE5', count: 8, is_system: false },
  { id: '3', name: 'Shopping', emoji: '🛒', color: '#EDE9FE', count: 5, is_system: false },
  { id: '4', name: 'Bills & Utilities', emoji: '💡', color: '#FEF3C7', count: 3, is_system: false },
  { id: '5', name: 'Entertainment', emoji: '🎮', color: '#E9D5FF', count: 6, is_system: false },
  { id: '6', name: 'Salary', emoji: '💼', color: '#F0F9FF', count: 1, is_system: false },
  { id: '8', name: 'Others', emoji: '📦', color: '#FFF4E6', count: 0, is_system: true, system_note: 'default' }
];

function Categories(){
    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Manage your categories</h2>
            </div>

           <div className="categories-grid">
                {mockCategories.filter((cat) => cat.name !== 'Tithe') 
                .map((cat) => (
            <div key={cat.id}
                className={`cat-card ${cat.is_system ? 'cat-system' : ''}`}
                style={{ borderColor: cat.is_system ? '#F59E0B' : '#E6E9EE' }}>

            <div className="cat-emoji" style={{ backgroundColor: cat.color }}>
                <span className="emoji">{cat.emoji}</span>
            </div>< br />
            <div className="cat-body">
            <div className="cat-name">{cat.name}</div>
            <div className="cat-sub">
                {cat.is_system 
                ? `System · ${cat.system_note || ''}` 
                : `${cat.count} transactions`
                }
            </div>
            </div>
            </div>
            ))}
        </div>
    </div>
);
}

export default Categories;
