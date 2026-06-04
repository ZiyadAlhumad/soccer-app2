import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import request from '../../utils/api';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stadiums, setStadiums] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await request('/api/stadiums');
        const mine = all.filter(s => s.owner === user.id);
        setStadiums(mine);

        const statsResults = await Promise.all(
          mine.map(s => request(`/api/stadiums/${s._id}/stats`))
        );
        const statsMap = {};
        mine.forEach((s, i) => { statsMap[s._id] = statsResults[i]; });
        setStats(statsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const handleConfirmDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await request(`/api/stadiums/${id}`, { method: 'DELETE' });
      setStadiums(prev => prev.filter(s => s._id !== id));
      setStats(prev => { const next = { ...prev }; delete next[id]; return next; });
      setDeleteMsg('Stadium deleted.');
    } catch (err) {
      setDeleteMsg(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const totalActiveReservations = stadiums.reduce((sum, s) => sum + (stats[s._id]?.activeReservations ?? 0), 0);
  const totalSlots = stadiums.reduce((sum, s) => sum + (stats[s._id]?.totalSlots ?? 0), 0);
  const totalReserved = stadiums.reduce((sum, s) => sum + (stats[s._id]?.reservedSlots ?? 0), 0);
  const occupancyRate = totalSlots === 0 ? 0 : Math.round((totalReserved / totalSlots) * 100);

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Owner Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ border: '1px solid #bfdbfe', borderRadius: '10px', padding: '20px 24px', backgroundColor: '#eff6ff' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#3b82f6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Stadiums</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#1d4ed8' }}>{stadiums.length}</p>
        </div>
        <div style={{ border: '1px solid #86efac', borderRadius: '10px', padding: '20px 24px', backgroundColor: '#f0fdf4' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#16a34a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Reservations</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#15803d' }}>{totalActiveReservations}</p>
        </div>
        <div style={{ border: '1px solid #d8b4fe', borderRadius: '10px', padding: '20px 24px', backgroundColor: '#faf5ff' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#9333ea', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupancy Rate</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: '#7e22ce' }}>{occupancyRate}%</p>
          {totalSlots > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9333ea' }}>{totalReserved} / {totalSlots} slots filled</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>My Stadiums</h2>
        <button onClick={() => navigate('/owner/stadiums/new')}
          style={{ padding: '8px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          + Add Stadium
        </button>
      </div>
      {deleteMsg && <p style={{ color: 'green' }}>{deleteMsg}</p>}
      {stadiums.length === 0 ? (
        <p style={{ color: '#6b7280' }}>You have no stadiums yet. Add one!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {stadiums.map(s => (
            <div key={s._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 4px' }}>{s.name}</h3>
              <p style={{ color: '#6b7280', margin: '0 0 12px', fontSize: '14px' }}>📍 {s.location}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button onClick={() => navigate(`/owner/stadiums/${s._id}/slots`)}
                  style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Manage Slots
                </button>
                <button onClick={() => navigate(`/owner/stadiums/${s._id}/status`)}
                  style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  View Status
                </button>
                <button onClick={() => navigate(`/owner/stats?stadiumId=${s._id}`)}
                  style={{ padding: '6px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Statistics
                </button>
                <button onClick={() => navigate(`/owner/stadiums/${s._id}/edit`)}
                  style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Edit
                </button>
                <button onClick={() => setConfirmDeleteId(s._id)}
                  style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId !== null && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', padding: '28px 32px',
            maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>Delete Stadium</h3>
            <p style={{ color: '#374151' }}>Are you sure you want to delete this stadium?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
