import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkStyle = ({ isActive }) => ({
    fontWeight: isActive ? '700' : '500',
    color: isActive ? 'var(--primary)' : 'var(--slate-600)',
    textDecoration: 'none',
    marginRight: '24px',
    paddingBottom: '4px',
    borderBottom: isActive ? '2px solid var(--primary)' : 'none',
    transition: 'all 0.2s ease'
  });

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 24px',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
      gap: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <NavLink to="/" style={{ marginRight: '48px', borderBottom: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/logoFFF.png" alt="StadiumBook" style={{ height: '72px', width: 'auto' }} />
      </NavLink>

      {user?.role !== 'owner' && (
        <NavLink to="/" style={linkStyle}>Stadiums</NavLink>
      )}

      {!isAuthenticated && (
        <>
          <NavLink to="/login" style={linkStyle}>Login</NavLink>
          <NavLink to="/register" style={linkStyle}>Register</NavLink>
        </>
      )}

      {isAuthenticated && user?.role === 'owner' && (
        <>
          <NavLink to="/owner/dashboard" style={linkStyle}>Dashboard</NavLink>
          <NavLink to="/owner/stadiums/new" style={linkStyle}>Add Stadium</NavLink>
          <NavLink to="/owner/messages" style={linkStyle}>Messages</NavLink>
        </>
      )}

      {isAuthenticated && user?.role === 'user' && (
        <>
          <NavLink to="/my-reservations" style={linkStyle}>My Reservations</NavLink>
          <NavLink to="/user/messages" style={linkStyle}>Messages</NavLink>
        </>
      )}

      {isAuthenticated && (
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ padding: '8px 16px' }}
          >
            Logout
          </button>
        </span>
      )}
    </nav>
  );
}

export default Navbar;

