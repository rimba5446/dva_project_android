import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OrderPage from './pages/OrderPage';
import TransaksiPage from './pages/TransaksiPage';
import CetakPage from './pages/CetakPage';
import LaporanPage from './pages/LaporanPage';

export default function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="/order" element={user ? <OrderPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/transaksi" element={user ? <TransaksiPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/cetak/:id" element={user ? <CetakPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/laporan" element={user ? <LaporanPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />      
      <Route path="*" element={<Navigate to={user ? "/order" : "/login"} />} />
    </Routes>
  );
}
