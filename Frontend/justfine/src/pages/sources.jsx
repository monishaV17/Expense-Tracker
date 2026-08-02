import { useState, useEffect, useCallback } from "react";
import '../static/sources.css';
import FilterBox from '../components/FilterBox';
import SourceModal from './SourceModal.jsx';
import PartitionsModal from "./PartitionsModal.jsx";
import {fetchSources, deleteSource,  deletePartition} from "../api/sources.js";

function Sources() {
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [filter, setFilter] = useState("All");
    const [sources, setSources] = useState([]);
    const [isPartitionModalOpen, setIsPartitionModalOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [editingSource, setEditingSource] = useState(null);
    const [editingPartition, setEditingPartition] = useState(null);


    const filteredSources = sources.filter(s => {
        if(filter === "Active") return s.is_active;
        if(filter === "Inactive") return !s.is_active;
        if(filter === "Savings") return s.is_savings;
        return true;
    });

    const loadSources = useCallback(async () => {
        try {
            const data = await fetchSources();
            setSources(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadSources();
    }, [loadSources]);

    const openEditModal= (source) => {
        setEditingSource(source);
        setIsSourceModalOpen(true);
    };

    const handleDeleteSource = async (sourceId) => {
        try{
            await deleteSource(sourceId);
            loadSources();
        } catch(err){
            console.error(err);
        }
    };

    const openAddPartition = (source) =>{
        setSelectedSource(source);
        setEditingPartition(null);
        setIsPartitionModalOpen(true);
    };

    const openEditPartition = (source, partition) =>{
        setSelectedSource(source);
        setEditingPartition(partition);
        setIsPartitionModalOpen(true);
    };

    const handleDeletePartition = async (partitionId) =>{
        try{
            await deletePartition(partitionId);
            loadSources();
        } catch(err){
            console.error(err);
        }
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
                                {s.partitions.map((p) => (
                                    <div key={p.id} className="part-row">
                                        <span className="part-label">{p.name}</span>
                                        <div className="part-right">
                                            <span className="part-amt">₹{p.amount / 100}</span>
                                            <button className="part-edit-btn" onClick={() => openEditPartition(s, p)}>Edit</button>
                                            <button className="action-btn delete" onClick={() => handleDeletePartition(p.id)}>Delete</button>
                                        </div>
                                    </div>
                        ))}
                    </div>
                    )}

                        <div className="src-actions">
                            <button className="action-btn" onClick={() => openEditModal(s)}>Edit</button>
                            <button className="action-btn" onClick={()=> openAddPartition(s)}>Partitions</button>
                            <button className="action-btn delete" onClick={()=> handleDeleteSource(s.id)}>Delete</button>
                        </div>
                    </div>
                ))
            )}

            <SourceModal isOpen={isSourceModalOpen} 
            editingSource={editingSource}
            onClose={() => {
                setIsSourceModalOpen(false);
                setEditingSource(null);
            }}
            onAdd={loadSources} />

            <PartitionsModal isOpen={isPartitionModalOpen} onClose={() => {
                setIsPartitionModalOpen(false); 
                setEditingPartition(null);
                setSelectedSource(null);
                }} 
                onAdd={loadSources}
                editingPartition={editingPartition} 
                sourceId={selectedSource?.id}
            />
        </div>
    );
}

export default Sources;