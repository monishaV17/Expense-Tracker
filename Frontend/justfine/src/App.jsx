import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Auth from './components/Auth';
import SideBar from './components/SideBar';

function App(){
    return (
        <Routes>
            <Route path="/" element={<Auth />}/>
            <Route path="/dashboard" element={<SideBar />}/>
        </Routes>
    );
}

export default App;