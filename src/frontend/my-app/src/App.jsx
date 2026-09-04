import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';

import Home from './pages/Home';
import Network from './pages/Network';
import Overview from './pages/Overview';
import SystemHealth from './pages/SystemHealth';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/network" element={<Network />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
