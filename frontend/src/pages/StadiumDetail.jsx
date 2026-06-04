import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import request, { BASE_URL } from '../utils/api';
import STADIUM_IMAGES from '../utils/stadiumImages';

const INIT_AUTH = { name: '', email: '', password: '', role: 'user' };

function StadiumDetail() {
  const { id } = useParams();
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [photoIndex, setPhotoIndex] = useState(0);

  const [stadium, setStadium] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserveError, setReserveError] = useState(null);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState({ error: null, success: null });

  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingSlot, setPendingSlot] = useState(null);
  const [authForm, setAuthForm] = useState(INIT_AUTH);
  const [authErrors, setAuthErrors] = useState({});
  const [authServerError, setAuthServerError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [stadiumData, slotsData] = await Promise.all([
          request(`/api/stadiums/${id}`),
          request(`/api/stadiums/${id}/slots`)
        ]);
        setStadium(stadiumData);
        setSlots(slotsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReserveClick = (slot) => {
    if (!isAuthenticated) {
      setPendingSlot(slot);
      setAuthModal(true);
      return;
    }
    setReserveError(null);
    setConfirmSlot(slot);
  };

  const handleConfirm = async () => {
    const slot = confirmSlot;
    const slotId = slot._id;
    setConfirmSlot(null);
    try {
      const reservation = await request('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({ slotId })
      });
      setSlots(prev => prev.map(s => s._id === slotId ? { ...s, isReserved: true } : s));
      setBookingInfo({ reservationId: reservation._id, slot, stadium });
    } catch (err) {
      setReserveError(err.message);
    }
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(f => ({ ...f, [name]: value }));
  };

  const validateLogin = () => {
    const errs = {};
    if (!authForm.email.trim()) errs.email = 'Email is required.';
    if (!authForm.password) errs.password = 'Password is required.';
    return errs;
  };

  const validateRegister = () => {
    const errs = {};
    if (!authForm.name.trim()) errs.name = 'Name is required.';
    if (!authForm.email.trim()) errs.email = 'Email is required.';
    if (authForm.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    return errs;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const errs = authMode === 'login' ? validateLogin() : validateRegister();
    if (Object.keys(errs).length > 0) { setAuthErrors(errs); return; }
    setAuthErrors({});
    setAuthServerError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const data = await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authForm.email, password: authForm.password })
        });
        login(data);
        setAuthModal(false);
        setAuthForm(INIT_AUTH);
        setConfirmSlot(pendingSlot);
        setPendingSlot(null);
      } else {
        await request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(authForm)
        });
        setAuthMode('login');
        setAuthForm(f => ({ ...f, name: '', password: '' }));
      }
    } catch (err) {
      setAuthServerError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) { setMessageStatus({ error: 'Message cannot be empty.', success: null }); return; }
    setMessageStatus({ error: null, success: null });
    try {
      await request('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: stadium.owner._id, content: messageContent.trim() })
      });
      setMessageContent('');
      setShowMessageForm(false);
      setMessageStatus({ error: null, success: 'Message sent to the owner!' });
    } catch (err) {
      setMessageStatus({ error: err.message, success: null });
    }
  };

  const closeAuthModal = () => {
    setAuthModal(false);
    setAuthForm(INIT_AUTH);
    setAuthErrors({});
    setAuthServerError(null);
    setAuthMode('login');
    setPendingSlot(null);
  };

  if (user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!stadium) return <p>Stadium not found.</p>;

  const images = stadium.photos.length > 0
    ? stadium.photos
    : (STADIUM_IMAGES[state?.imageGroup] ?? []);

  const resolveImage = (src) => src.startsWith('/uploads/') ? `${BASE_URL}${src}` : src;

  const groupedByDate = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '16px' }}>← Back</button>
      <h2>{stadium.name}</h2>
      <p style={{ color: '#6b7280' }}>📍 {stadium.location}</p>
      <p>{stadium.description}</p>

      {stadium.amenities && stadium.amenities.length > 0 && (
        <p style={{ color: '#374151', fontSize: '14px', marginBottom: '16px' }}>
          <strong>Facilities: </strong>
          {stadium.amenities.map((a, i) => (
            <span key={a}>
              {i > 0 && <span style={{ color: '#16a34a', margin: '0 6px' }}>●</span>}
              {a}
            </span>
          ))}
        </p>
      )}

      {images.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '600px' }}>
            <img
              src={resolveImage(images[photoIndex])}
              alt={`Stadium photo ${photoIndex + 1}`}
              style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setPhotoIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px'
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={resolveImage(img)}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setPhotoIndex(i)}
                style={{
                  width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px',
                  cursor: 'pointer', border: photoIndex === i ? '2px solid #2563eb' : '2px solid transparent',
                  opacity: photoIndex === i ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </div>
      )}

      {reserveError && <p style={{ color: 'red' }}>{reserveError}</p>}

      <h3>Availability Schedule</h3>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', backgroundColor: 'green', display: 'inline-block', borderRadius: '3px' }}></span> Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', backgroundColor: 'red', display: 'inline-block', borderRadius: '3px' }}></span> Reserved
        </span>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <p style={{ color: '#6b7280' }}>No slots available yet.</p>
      ) : (
        Object.entries(groupedByDate).map(([date, daySlots]) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px' }}>{date}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {daySlots.map(slot => (
                <div
                  key={slot._id}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: slot.isReserved ? 'red' : 'green',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '100px',
                    textAlign: 'center'
                  }}
                >
                  <div>{slot.startTime} – {slot.endTime}</div>
                  {!slot.isReserved && user?.role !== 'owner' && (
                    <button
                      onClick={() => handleReserveClick(slot)}
                      style={{
                        marginTop: '6px',
                        padding: '4px 10px',
                        backgroundColor: 'white',
                        color: 'green',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Reserve
                    </button>
                  )}
                  {slot.isReserved && <div style={{ fontSize: '12px', marginTop: '4px' }}>Reserved</div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {isAuthenticated && user?.role === 'user' && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ marginBottom: '12px' }}>Contact Owner</h3>
          {messageStatus.success && <p style={{ color: 'green' }}>{messageStatus.success}</p>}
          {!showMessageForm ? (
            <button
              onClick={() => { setShowMessageForm(true); setMessageStatus({ error: null, success: null }); }}
              style={{ padding: '8px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
            >
              ✉ Message Owner
            </button>
          ) : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', maxWidth: '480px' }}>
              <h4 style={{ margin: '0 0 10px' }}>Message to {stadium.owner?.name ?? 'Owner'}</h4>
              {messageStatus.error && <p style={{ color: 'red', fontSize: '13px' }}>{messageStatus.error}</p>}
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  rows={3}
                  placeholder="Write your message..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit"
                    style={{ padding: '7px 16px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                    Send
                  </button>
                  <button type="button" onClick={() => { setShowMessageForm(false); setMessageContent(''); setMessageStatus({ error: null, success: null }); }}
                    style={{ padding: '7px 16px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {authModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '28px 32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => { setAuthMode('login'); setAuthErrors({}); setAuthServerError(null); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: '15px',
                  backgroundColor: 'white',
                  borderBottom: authMode === 'login' ? '2px solid #2563eb' : '2px solid transparent',
                  color: authMode === 'login' ? '#2563eb' : '#6b7280',
                  fontWeight: authMode === 'login' ? 'bold' : 'normal'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthErrors({}); setAuthServerError(null); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: '15px',
                  backgroundColor: 'white',
                  borderBottom: authMode === 'register' ? '2px solid #2563eb' : '2px solid transparent',
                  color: authMode === 'register' ? '#2563eb' : '#6b7280',
                  fontWeight: authMode === 'register' ? 'bold' : 'normal'
                }}
              >
                Sign Up
              </button>
            </div>

            <p style={{ color: '#374151', marginTop: 0 }}>
              {authMode === 'login' ? 'Sign in to complete your reservation.' : 'Create an account to reserve this slot.'}
            </p>

            {authServerError && <p style={{ color: 'red', fontSize: '13px' }}>{authServerError}</p>}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div style={{ marginBottom: '12px' }}>
                  <label htmlFor="auth-name">Name</label><br />
                  <input
                    id="auth-name" name="name" value={authForm.name}
                    onChange={handleAuthChange}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                  {authErrors.name && <p style={{ color: 'red', fontSize: '13px', margin: '4px 0 0' }}>{authErrors.name}</p>}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="auth-email">Email</label><br />
                <input
                  id="auth-email" name="email" type="email" value={authForm.email}
                  onChange={handleAuthChange}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
                />
                {authErrors.email && <p style={{ color: 'red', fontSize: '13px', margin: '4px 0 0' }}>{authErrors.email}</p>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="auth-password">Password</label><br />
                <input
                  id="auth-password" name="password" type="password" value={authForm.password}
                  onChange={handleAuthChange}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
                />
                {authErrors.password && <p style={{ color: 'red', fontSize: '13px', margin: '4px 0 0' }}>{authErrors.password}</p>}
              </div>

              {authMode === 'register' && (
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="auth-role">I am a</label><br />
                  <select
                    id="auth-role" name="role" value={authForm.role}
                    onChange={handleAuthChange}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  >
                    <option value="user">Match Organizer (User)</option>
                    <option value="owner">Stadium Owner</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  style={{
                    padding: '8px 18px', border: '1px solid #d1d5db',
                    borderRadius: '6px', backgroundColor: 'white',
                    cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    padding: '8px 18px', border: 'none',
                    borderRadius: '6px', backgroundColor: '#047857',
                    color: 'white', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  {authLoading ? '...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookingInfo !== null && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '28px 32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, color: 'green' }}>Booking Confirmed!</h3>
            <p style={{ color: '#374151' }}>Your reservation has been successfully made.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280', width: '110px' }}>Booking No.</td>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>#{bookingInfo.reservationId.slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Stadium</td>
                  <td style={{ padding: '6px 0' }}>{bookingInfo.stadium.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Location</td>
                  <td style={{ padding: '6px 0' }}>📍 {bookingInfo.stadium.location}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Date</td>
                  <td style={{ padding: '6px 0' }}>
                    {new Date(bookingInfo.slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Time</td>
                  <td style={{ padding: '6px 0' }}>{bookingInfo.slot.startTime} – {bookingInfo.slot.endTime}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setBookingInfo(null)}
                style={{
                  padding: '8px 20px', border: 'none',
                  borderRadius: '6px', backgroundColor: 'green',
                  color: 'white', cursor: 'pointer', fontSize: '14px'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSlot !== null && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '28px 32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>Confirm Reservation</h3>
            <p style={{ color: '#374151' }}>Are you sure you want to reserve this slot?</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280', width: '90px' }}>Stadium</td>
                  <td style={{ padding: '6px 0' }}>{stadium.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Location</td>
                  <td style={{ padding: '6px 0' }}>📍 {stadium.location}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Date</td>
                  <td style={{ padding: '6px 0' }}>
                    {new Date(confirmSlot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', color: '#6b7280' }}>Time</td>
                  <td style={{ padding: '6px 0' }}>{confirmSlot.startTime} – {confirmSlot.endTime}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmSlot(null)}
                style={{
                  padding: '8px 18px', border: '1px solid #d1d5db',
                  borderRadius: '6px', backgroundColor: 'white',
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '8px 18px', border: 'none',
                  borderRadius: '6px', backgroundColor: 'green',
                  color: 'white', cursor: 'pointer', fontSize: '14px'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StadiumDetail;
