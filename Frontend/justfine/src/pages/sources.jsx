import { useState, useEffect } from "react";
import '../static/sources.css';
import FilterBox from '../components/FilterBox';
import SourceModal from './SourceModal.jsx';
import PartitionsModal from "./PartitionsModal.jsx";
import {fetchSources, addSource} from "../api/sources.js";

function Sources() {
    const [isSourceModalOpen, setIsSourceModalOpen]=useState(false);
    const [filter, setFilter]=useState("All");
    const [sources, setSources]=useState([]);
    const [isPartitionModalOpen, setIsPartitionModalOpen]=useState(false);
    const [activeSourceIndex, setActiveSourceIndex]=useState(null);


    const filteredSources = sources.filter(s => {
        if(filter === "Active") return s.is_active;
        if(filter === "Inactive") return !s.is_active;
        if(filter === "Savings") return s.is_savings;
        return true;
    });

    const loadSources = async () => {
        try {
            const data = await fetchSources();
            setSources(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadSources();
    }, []);

    const handleAddSource = async (newSource) => {
        try {
            await addSource(newSource);
            loadSources();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddPartition=(newPartition) => {
        setSources(prevSources => 
            prevSources.map((source, index) => {
                if (index === activeSourceIndex) {
                    return{
                        ...source,
                        partitions: [
                            ...source.partitions,
                            {name: newPartition.name, amount: newPartition.amount} 
                        ]
                    };
                }
                return source;
            })
        );
    };

    return (
        <div className="source-page">
            <div className="sources-top">
                <h2>Money Sources</h2>
                <button className="sources-add-btn" onClick={() => setIsSourceModalOpen(true)}>+ Add Source</button>
            </div>

            <FilterBox filters={["All", "Active", "Savings", "Inactive"]} active={filter} onChange={setFilter} />
            
            {filteredSources.length === 0 ? (
                <p className="empty-state">No sources found</p>
            ) : (
                filteredSources.map(s => (
                    <div key={s.id} className="src-card">
                        <div className="src-top">
                        <div className="src-left">
                        <span className="src-name">{s.name}</span>
                        <span className="src-des">{s.description}</span>
                        </div>
                        <div className="src-right">
                         <span className="src-amt">₹{s.amount / 100}</span>
                        <span className="src-txn">{s.count} transactions</span>
                        </div>
                        </div>

                        <div className="src-badges">
                            {s.is_savings && <span className="badge badge-savings">Savings</span>}
                            <span className={`badge ${s.is_active ? "badge-active" : "badge-inactive"}`}>
                                {s.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {s.partitions.length > 0 && (
                            <div className="parts">
                                <div className="parts-title">Partitions</div>
                                {s.partitions.map(p => (
                                    <div key={p.id} className="part-row">
                                        <span>{p.name}</span>
                                        <span>₹{p.amount / 100}</span>
                                    </div>
                                ))}
                            </div>
                        )} 

                        <div className="src-actions">
                            <button className="action-btn">Edit</button>
                            <button className="action-btn" onClick={()=> setIsPartitionModalOpen(true)}>Partitions</button>
                            <button className="action-btn delete">Delete</button>
                        </div>
                    </div>
                ))
            )}

            <SourceModal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)} onAdd={handleAddSource} />
            <PartitionsModal isOpen={isPartitionModalOpen} onClose={() => {
                setIsPartitionModalOpen(false); 
                setActiveSourceIndex(null);
                }} 
                onAdd={handleAddPartition} 
            />
        </div>
    );
}

export default Sources;