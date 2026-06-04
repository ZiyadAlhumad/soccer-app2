import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import request from '../utils/api';

const INIT = { name: '', email: '', password: '', role: 'user' };

function Register() {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError(null);
    setLoading(true);
    try {
      await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      navigate('/login');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--background) 0%, var(--slate-100) 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--surface)',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        padding: '40px'
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', color: 'var(--dark)', fontWeight: '700' }}>Create Account</h1>
          <p style={{ margin: '0', color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Join us to reserve stadiums and manage your bookings
          </p>
        </div>

        {serverError && (
          <div style={{
            background: 'var(--error-light)',
            border: '1px solid #fca5a5',
            color: '#7f1d1d',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.95rem'
          }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="name" style={{ fontWeight: '600', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--background)',
                transition: 'all 0.2s ease'
              }}
            />
            {errors.name && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: '2px 0 0' }}>{errors.name}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontWeight: '600', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--background)',
                transition: 'all 0.2s ease'
              }}
            />
            {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: '2px 0 0' }}>{errors.email}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ fontWeight: '600', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--background)',
                transition: 'all 0.2s ease'
              }}
            />
            {errors.password && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: '2px 0 0' }}>{errors.password}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="role" style={{ fontWeight: '600', color: 'var(--slate-900)', fontSize: '0.95rem' }}>
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'var(--background)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="user">Match Organizer (User)</option>
              <option value="owner">Stadium Owner</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 16px',
              background: loading ? 'var(--slate-400)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <NavLink to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Login here
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
