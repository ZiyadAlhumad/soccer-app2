import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../../utils/api';

function ReservationStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [reservationBySlot, setReservationBySlot] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMessageSlot, setActiveMessageSlot] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState({ error: null, success: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [slotsData, reservationsData] = await Promise.all([
          request(`/api/stadiums/${id}/slots`),
          request(`/api/stadiums/${id}/reservations`)
        ]);
        setSlots(slotsData);
        const lookup = reservationsData.reduce((acc, r) => {
          acc[r.slot] = r;
          return acc;
        }, {});
        setReservationBySlot(lookup);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSendMessage = async (e, receiverId) => {
    e.preventDefault();
    if (!messageContent.trim()) { setMessageStatus({ error: 'Message cannot be empty.', success: null }); return; }
    setMessageStatus({ error: null, success: null });
    try {
      await request('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId, content: messageContent.trim() })
      });
      setMessageContent('');
      setActiveMessageSlot(null);
      setMessageStatus({ error: null, success: 'Message sent!' });
    } catch (err) {
      setMessageStatus({ error: err.message, success: null });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const groupedByDate = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const reserved = slots.filter(s => s.isReserved).length;
  const available = slots.length - reserved;

  return (
    <div>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-ghost" style={{ marginBottom: '16px' }}>← Dashboard</button>
      <h2>Reservation Status</h2>

      {messageStatus.success && <p style={{ color: 'green' }}>{messageStatus.success}</p>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
          <strong style={{ color: 'green' }}>{available}</strong> Available
        </div>
        <div style={{ padding: '12px 20px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
          <strong style={{ color: 'red' }}>{reserved}</strong> Reserved
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', backgroundColor: 'green', display: 'inline-block', borderRadius: '3px' }}></span> Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', backgroundColor: 'red', display: 'inline-block', borderRadius: '3px' }}></span> Reserved
        </span>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <p style={{ color: '#6b7280' }}>No slots added yet.</p>
      ) : (
        Object.entries(groupedByDate).map(([date, daySlots]) => (
          <div key={date} style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '8px' }}>{date}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {daySlots.map(slot => {
                const reservation = reservationBySlot[slot._id];
                const bookedBy = reservation?.user;
                const isMessaging = activeMessageSlot === slot._id;
                return (
                  <div
                    key={slot._id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: slot.isReserved ? '#fef2f2' : '#f0fdf4',
                      border: `1px solid ${slot.isReserved ? '#fca5a5' : '#86efac'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      minWidth: '160px'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{slot.startTime} – {slot.endTime}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: slot.isReserved ? '#ef4444' : 'green' }}>
                      {slot.isReserved ? 'Reserved' : 'Available'}
                    </div>

                    {slot.isReserved && bookedBy !== undefined && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#374151' }}>
                        👤 {bookedBy?.name ?? 'Unknown user'}
                      </div>
                    )}

                    {slot.isReserved && bookedBy !== undefined && !isMessaging && (
                      <button
                        onClick={() => { setActiveMessageSlot(slot._id); setMessageContent(''); setMessageStatus({ error: null, success: null }); }}
                        style={{
                          marginTop: '8px', padding: '4px 10px', fontSize: '12px',
                          backgroundColor: '#047857', color: 'white',
                          border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}
                      >
                        ✉ Message
                      </button>
                    )}

                    {isMessaging && (
                      <form onSubmit={e => handleSendMessage(e, bookedBy._id)} style={{ marginTop: '8px' }}>
                        {messageStatus.error && <p style={{ color: 'red', fontSize: '12px', margin: '0 0 4px' }}>{messageStatus.error}</p>}
                        <textarea
                          value={messageContent}
                          onChange={e => setMessageContent(e.target.value)}
                          rows={2}
                          placeholder="Write a message..."
                          style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button type="submit"
                            style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Send
                          </button>
                          <button type="button"
                            onClick={() => { setActiveMessageSlot(null); setMessageContent(''); }}
                            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ReservationStatus;
