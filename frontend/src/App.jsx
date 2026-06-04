import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import OwnerRoute from './components/common/OwnerRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StadiumDetail from './pages/StadiumDetail';

import Dashboard from './pages/owner/Dashboard';
import AddStadium from './pages/owner/AddStadium';
import EditStadium from './pages/owner/EditStadium';
import ManageSlots from './pages/owner/ManageSlots';
import ReservationStatus from './pages/owner/ReservationStatus';
import OwnerMessages from './pages/owner/Messages';
import Statistics from './pages/owner/Statistics';

import MyReservations from './pages/user/MyReservations';
import UserMessages from './pages/user/Messages';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2>404 – Page Not Found</h2>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="stadiums/:id" element={<StadiumDetail />} />

        {/* Owner-only routes */}
        <Route element={<OwnerRoute />}>
          <Route path="owner/dashboard" element={<Dashboard />} />
          <Route path="owner/stadiums/new" element={<AddStadium />} />
          <Route path="owner/stadiums/:id/edit" element={<EditStadium />} />
          <Route path="owner/stadiums/:id/slots" element={<ManageSlots />} />
          <Route path="owner/stadiums/:id/status" element={<ReservationStatus />} />
          <Route path="owner/messages" element={<OwnerMessages />} />
          <Route path="owner/stats" element={<Statistics />} />
        </Route>

        {/* User protected routes */}
        <Route path="my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
        <Route path="user/messages" element={<ProtectedRoute><UserMessages /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
