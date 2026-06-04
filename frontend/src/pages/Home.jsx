import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import request, { BASE_URL } from '../utils/api';
import STADIUM_IMAGES from '../utils/stadiumImages';
import './Home.css';

const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, '0')}:00`;
});

function Home() {
  const { user } = useAuth();
  const [allStadiums, setAllStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedHours, setSelectedHours] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current !== null && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const params = new URLSearchParams();
        if (date) {
          const [yr, mo, dy] = date.split('-').map(Number);
          params.set('dateFrom', new Date(yr, mo - 1, dy, 0, 0, 0, 0).toISOString());
          params.set('dateTo', new Date(yr, mo - 1, dy, 23, 59, 59, 999).toISOString());
        }
        selectedHours.forEach(h => params.append('time', h));
        const query = params.toString() ? `?${params.toString()}` : '';
        const data = await request(`/api/stadiums${query}`);
        setAllStadiums(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date, selectedHours]);

  if (user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;

  if (loading) return <p>Loading stadiums...</p>;

  const stadiums = location.trim()
    ? allStadiums.filter(s => s.location.toLowerCase().includes(location.trim().toLowerCase()))
    : allStadiums;

  const toggleHour = (hour) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const dropdownLabel = selectedHours.length === 0
    ? 'Any time'
    : selectedHours.length <= 2
      ? selectedHours.join(', ')
      : `${selectedHours.length} hours selected`;

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <h1 className="hero-title">Reserve your pitch in minutes</h1>
          <p className="hero-text">
            Search stadiums by location or time and book the right field for training or match day.
          </p>
          <div className="hero-actions">
            <label className="sr-only" htmlFor="stadium-search">
              Search stadiums by location
            </label>
            <input
              id="stadium-search"
              className="hero-search"
              placeholder="Search by location..."
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <div className="hero-meta">{stadiums.length} stadium{stadiums.length === 1 ? '' : 's'} found</div>

            <div className="hero-filters">
              <div className="hero-filter-group">
                <label htmlFor="filter-date" className="hero-filter-label">Date</label>
                <input
                  id="filter-date"
                  type="date"
                  className="hero-filter-input"
                  value={date}
                  placeholder="Select a date"
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="hero-filter-group" ref={dropdownRef} style={{ position: 'relative' }}>
                <span className="hero-filter-label">Time</span>
                <button
                  type="button"
                  className="hero-filter-input hero-time-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  <span>{dropdownLabel}</span>
                  <span className="hero-time-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                </button>
                {dropdownOpen && (
                  <div className="hero-time-panel">
                    {HOURS.map(hour => (
                      <label key={hour} className="hero-time-option">
                        <input
                          type="checkbox"
                          checked={selectedHours.includes(hour)}
                          onChange={() => toggleHour(hour)}
                        />
                        <span className="hero-time-option-label">{hour}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {(date !== '' || selectedHours.length > 0) && (
                <button
                  type="button"
                  className="hero-clear-btn"
                  onClick={() => { setDate(''); setSelectedHours([]); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="stadium-section">
        <div className="section-header">
          <div>
            <h2 className="section-heading">Available Stadiums</h2>
            <p className="section-description">
              Browse the best campus pitches and secure your booking with a clean schedule view.
            </p>
          </div>
        </div>

        {error !== null ? (
          <p className="no-results" style={{ color: '#ef4444' }}>Error: {error}</p>
        ) : stadiums.length === 0 ? (
          <p className="no-results">No stadiums found.</p>
        ) : (
          <div className="stadium-grid">
            {stadiums.map((stadium, index) => {
              const imageGroup = index + 1;
              const thumbnail = stadium.photos.length > 0
                ? `${BASE_URL}${stadium.photos[0]}`
                : (STADIUM_IMAGES[imageGroup] ?? [])[0] ?? null;
              return (
                <div key={stadium._id} className="stadium-card">
                  {thumbnail !== null && (
                    <img src={thumbnail} alt={stadium.name} className="stadium-image" />
                  )}
                  <div className="stadium-content">
                    <h3 className="stadium-title">{stadium.name}</h3>
                    <p className="stadium-location">📍 {stadium.location}</p>
                    <p className="stadium-description">{stadium.description}</p>
                    <div className="stadium-footer">
                      <button
                        onClick={() => navigate(`/stadiums/${stadium._id}`, { state: { imageGroup } })}
                        className="view-schedule-button"
                      >
                        View Schedule
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
