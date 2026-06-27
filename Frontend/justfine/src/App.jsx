import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Auth from './components/Auth';
import SideBar from './components/SideBar';
import Layout from './components/Layout';

function App(){
    return (
        <Routes>
            <Route path="/" element={<Auth />}/>
            <Route path="/layout" element={<Layout />}/>
        </Routes>
    );
}

export default App;