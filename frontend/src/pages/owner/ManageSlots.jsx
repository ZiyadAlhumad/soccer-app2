import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../../utils/api';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

function buildDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      value: `${year}-${month}-${day}`,
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: i === 0
    };
  });
}

function ManageSlots() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const days = buildDays();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/api/stadiums/${id}/slots`);
        setSlots(data);
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDayClick = (value) => {
    setDate(value);
    setSelected(new Set());
    setSuccessMsg(null);
    setServerError(null);
  };

  const toggleSlot = (startTime) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(startTime)) {
        next.delete(startTime);
      } else {
        next.add(startTime);
      }
      return next;
    });
  };

  const handleAddSelected = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    setServerError(null);
    setSuccessMsg(null);
    try {
      const newSlots = await Promise.all(
        Array.from(selected).map(startTime => {
          const hour = parseInt(startTime.split(':')[0], 10);
          const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
          return request(`/api/stadiums/${id}/slots`, {
            method: 'POST',
            body: JSON.stringify({ date, startTime, endTime })
          });
        })
      );
      setSlots(prev => [...prev, ...newSlots]);
      setSelected(new Set());
      setSuccessMsg(`${newSlots.length} slot${newSlots.length !== 1 ? 's' : ''} added successfully!`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await request(`/api/stadiums/${id}/slots/${slotId}`, { method: 'DELETE' });
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (loading) return <p>Loading slots...</p>;

  const slotsForDate = date
    ? slots.filter(s => new Date(s.date).toLocaleDateString('en-CA') === date)
    : [];
  const existingTimesForDate = new Set(slotsForDate.map(s => s.startTime));
  const availableSlots = TIME_SLOTS.filter(t => !existingTimesForDate.has(t));
  const allSelected = availableSlots.length > 0 && availableSlots.every(t => selected.has(t));

  const handleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(availableSlots));
  };

  return (
    <div>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-ghost" style={{ marginBottom: '16px' }}>
        ← Dashboard
      </button>
      <h2>Manage Slots</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '28px', maxWidth: '580px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Add Slots</h3>

        {/* Day picker */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>Select Day</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {days.map(day => {
              const isSelected = date === day.value;
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayClick(day.value)}
                  style={{
                    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: isSelected ? '#eff6ff' : '#f9fafb',
                    color: isSelected ? '#1d4ed8' : '#374151',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    textAlign: 'center', minWidth: '64px'
                  }}
                >
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {day.isToday ? 'Today' : day.weekday}
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '2px' }}>{day.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slot grid */}
        {date !== '' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0 }}>Select Time Slots</p>
              {availableSlots.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    padding: '4px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer',
                    border: '1px solid #2563eb', backgroundColor: allSelected ? '#2563eb' : 'white',
                    color: allSelected ? 'white' : '#2563eb', fontWeight: '600'
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {TIME_SLOTS.map(startTime => {
                const hour = parseInt(startTime.split(':')[0], 10);
                const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
                const existing = slotsForDate.find(s => s.startTime === startTime);
                const isReserved = existing?.isReserved === true;
                const isAdded = existing !== undefined && !isReserved;
                const isSelected = selected.has(startTime);

                let bg = '#f9fafb';
                let border = '1px solid #d1d5db';
                let color = '#374151';
                let cursor = 'pointer';

                if (isReserved) {
                  bg = '#fef2f2'; border = '1px solid #fca5a5'; color = '#ef4444'; cursor = 'default';
                } else if (isAdded) {
                  bg = '#f0fdf4'; border = '1px solid #86efac'; color = '#16a34a'; cursor = 'default';
                } else if (isSelected) {
                  bg = '#eff6ff'; border = '2px solid #2563eb'; color = '#1d4ed8';
                }

                return (
                  <button
                    key={startTime}
                    type="button"
                    onClick={() => toggleSlot(startTime)}
                    disabled={isAdded || isReserved}
                    style={{
                      padding: '8px 14px', borderRadius: '6px', fontSize: '13px',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      backgroundColor: bg, border, color, cursor
                    }}
                  >
                    {startTime}–{endTime}
                    {isAdded && ' ✓'}
                    {isReserved && ' 🔒'}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddSelected}
                disabled={selected.size === 0 || saving}
                style={{
                  padding: '9px 20px',
                  backgroundColor: selected.size === 0 || saving ? '#94a3b8' : '#10b981',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: selected.size === 0 || saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600'
                }}
              >
                {saving ? 'Adding...' : `Add ${selected.size > 0 ? selected.size + ' ' : ''}Selected Slot${selected.size !== 1 ? 's' : ''}`}
              </button>
              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '10px' }}>
                <span style={{ color: '#1d4ed8' }}>■ Selected</span>
                <span style={{ color: '#16a34a' }}>■ Added</span>
                <span style={{ color: '#ef4444' }}>■ Reserved</span>
              </div>
            </div>

            {serverError && <p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>{serverError}</p>}
            {successMsg !== null && <p style={{ color: 'green', fontSize: '13px', fontWeight: 'bold', marginTop: '10px' }}>{successMsg}</p>}
          </>
        )}
      </div>

      <h3>All Slots ({slots.length})</h3>
      {slots.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No slots added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {slots.map(slot => (
            <div key={slot._id} style={{
              border: `2px solid ${slot.isReserved ? 'red' : 'green'}`,
              borderRadius: '6px', padding: '10px 14px',
              backgroundColor: slot.isReserved ? '#fef2f2' : '#f0fdf4',
              minWidth: '140px'
            }}>
              <div style={{ fontSize: '13px', color: '#374151' }}>
                {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontWeight: 'bold' }}>{slot.startTime} – {slot.endTime}</div>
              <div style={{ fontSize: '12px', color: slot.isReserved ? 'red' : 'green' }}>
                {slot.isReserved ? 'Reserved' : 'Available'}
              </div>
              {!slot.isReserved && (
                <button
                  onClick={() => handleDelete(slot._id)}
                  style={{ marginTop: '6px', padding: '2px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageSlots;
