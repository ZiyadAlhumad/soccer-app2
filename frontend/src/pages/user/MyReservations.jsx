import { useState, useEffect } from 'react';
import request from '../../utils/api';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelMsg, setCancelMsg] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [activeMessageRes, setActiveMessageRes] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageError, setMessageError] = useState(null);
  const [messageSuccess, setMessageSuccess] = useState(null);

  useEffect(() => {
    if (cancelMsg === null) return;
    const timer = setTimeout(() => setCancelMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [cancelMsg]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request('/api/reservations');
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelClick = (id) => {
    setCancelMsg(null);
    setConfirmCancelId(id);
  };

  const handleConfirmCancel = async () => {
    const id = confirmCancelId;
    setConfirmCancelId(null);
    try {
      await request(`/api/reservations/${id}/cancel`, { method: 'PUT' });
      setReservations(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r)
      );
      setCancelMsg('Reservation cancelled successfully.');
    } catch (err) {
      setCancelMsg(err.message);
    }
  };

  const handleSendMessage = async (e, ownerId) => {
    e.preventDefault();
    if (!messageContent.trim()) { setMessageError('Message cannot be empty.'); return; }
    setMessageError(null);
    try {
      await request('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: ownerId, content: messageContent.trim() })
      });
      setMessageContent('');
      setActiveMessageRes(null);
      setMessageSuccess('Message sent to the owner!');
      setTimeout(() => setMessageSuccess(null), 3000);
    } catch (err) {
      setMessageError(err.message);
    }
  };

  if (loading) return <p>Loading your reservations...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>My Reservations</h2>

      {messageSuccess && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#16a34a', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000
        }}>
          {messageSuccess}
        </div>
      )}

      {reservations.length === 0 ? (
        <p style={{ color: '#6b7280' }}>You have no reservations yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          {reservations.map(r => {
            const isMessaging = activeMessageRes === r._id;
            const owner = r.stadium?.owner;
            return (
              <div key={r._id} style={{
                border: `1px solid ${r.status === 'cancelled' ? '#fca5a5' : '#86efac'}`,
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: r.status === 'cancelled' ? '#fef2f2' : '#f0fdf4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Reservation #{r._id.slice(-6).toUpperCase()}
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px',
                    backgroundColor: r.status === 'active' ? '#10b981' : '#ef4444',
                    color: 'white'
                  }}>
                    {r.status}
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#6b7280', width: '110px' }}>Stadium</td>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{r.stadium?.name ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#6b7280' }}>Location</td>
                      <td style={{ padding: '4px 0' }}>📍 {r.stadium?.location ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#6b7280' }}>Date</td>
                      <td style={{ padding: '4px 0' }}>
                        {r.slot?.date
                          ? new Date(r.slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#6b7280' }}>Time</td>
                      <td style={{ padding: '4px 0' }}>{r.slot ? `${r.slot.startTime} – ${r.slot.endTime}` : '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#6b7280' }}>Booked on</td>
                      <td style={{ padding: '4px 0' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>

                {r.status === 'active' && (
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleCancelClick(r._id)}
                      style={{
                        padding: '7px 14px', backgroundColor: '#ef4444', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                      }}
                    >
                      Cancel Reservation
                    </button>
                    {owner !== undefined && (
                      <button
                        onClick={() => { setActiveMessageRes(isMessaging ? null : r._id); setMessageContent(''); setMessageError(null); }}
                        style={{
                          padding: '7px 14px', backgroundColor: '#047857', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        ✉ Message Owner
                      </button>
                    )}
                  </div>
                )}

                {isMessaging && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #d1fae5', paddingTop: '12px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151' }}>
                      Message to {owner?.name ?? 'Owner'}
                    </p>
                    {messageError && <p style={{ color: 'red', fontSize: '13px', margin: '0 0 6px' }}>{messageError}</p>}
                    <form onSubmit={e => handleSendMessage(e, owner._id)}>
                      <textarea
                        value={messageContent}
                        onChange={e => setMessageContent(e.target.value)}
                        rows={3}
                        placeholder="Write your message..."
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box', fontSize: '14px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button type="submit"
                          style={{ padding: '7px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                          Send
                        </button>
                        <button type="button"
                          onClick={() => { setActiveMessageRes(null); setMessageContent(''); setMessageError(null); }}
                          style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelMsg !== null && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#16a34a', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000
        }}>
          {cancelMsg}
        </div>
      )}

      {confirmCancelId !== null && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', padding: '28px 32px',
            maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>Cancel Reservation</h3>
            <p style={{ color: '#374151' }}>Are you sure you want to cancel this reservation?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmCancelId(null)}
                style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                No, Keep It
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReservations;
