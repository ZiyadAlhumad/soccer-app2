import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import request from '../../utils/api';

function Statistics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const stadiumId = new URLSearchParams(search).get('stadiumId');
  const [stadiums, setStadiums] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const allStadiums = await request('/api/stadiums');
        const mine = allStadiums.filter(s => s.owner === user.id);
        const filtered = stadiumId !== null ? mine.filter(s => s._id === stadiumId) : mine;
        setStadiums(filtered);

        const statsResults = await Promise.all(
          filtered.map(s => request(`/api/stadiums/${s._id}/stats`))
        );

        const statsMap = {};
        filtered.forEach((s, i) => { statsMap[s._id] = statsResults[i]; });
        setStats(statsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  if (loading) return <p>Loading statistics...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (stadiums.length === 0) return <p style={{ color: '#6b7280' }}>No stadiums found.</p>;

  return (
    <div>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-ghost" style={{ marginBottom: '20px' }}>
        ← Dashboard
      </button>

      {stadiums.map(s => {
        const st = stats[s._id] || {};
        const total = st.totalSlots ?? 0;
        const reserved = st.reservedSlots ?? 0;
        const available = st.availableSlots ?? 0;
        const cancelled = st.cancelledReservations ?? 0;
        const occupancyPct = total > 0 ? Math.round((reserved / total) * 100) : 0;

        return (
          <div key={s._id}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ margin: '0 0 4px' }}>{s.name}</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>📍 {s.location}</p>
            </div>

            {/* Occupancy bar */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Slot Occupancy</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: reserved > 0 ? '#ef4444' : '#6b7280' }}>
                  {occupancyPct}%
                </span>
              </div>
              <div style={{ width: '100%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${occupancyPct}%`, height: '100%', borderRadius: '999px',
                  backgroundColor: occupancyPct >= 80 ? '#ef4444' : occupancyPct >= 50 ? '#f59e0b' : '#10b981',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                <span>{reserved} reserved</span>
                <span>{available} available</span>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', fontWeight: '500' }}>Total Slots</div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#16a34a', lineHeight: 1 }}>{available}</div>
                <div style={{ fontSize: '14px', color: '#16a34a', marginTop: '8px', fontWeight: '500' }}>Available Slots</div>
              </div>

              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ef4444', lineHeight: 1 }}>{reserved}</div>
                <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px', fontWeight: '500' }}>Reserved Slots</div>
              </div>

              <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#9ca3af', lineHeight: 1 }}>{cancelled}</div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px', fontWeight: '500' }}>Cancelled</div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Statistics;
