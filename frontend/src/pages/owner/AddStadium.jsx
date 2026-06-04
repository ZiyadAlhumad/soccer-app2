import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/api';

const INIT = { name: '', description: '', location: '' };
const CITIES = [
  'Abha', 'Dammam', 'Al-Khubar', 'Al-Taif', 'Buraydah',
  'Dhahran', 'Hail', 'Jeddah', 'Mecca', 'Madinah', 'Riyadh', 'Tabuk', 'Yanbu'
];
const AMENITIES = ['WC', 'Parking', 'Showers', 'Prayer Room', 'Changing Rooms', 'Vendor Booth'];

function AddStadium() {
  const [form, setForm] = useState(INIT);
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
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
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('location', form.location.trim());
      photos.forEach(file => formData.append('photos', file));
      amenities.forEach(a => formData.append('amenities', a));
      await request('/api/stadiums', { method: 'POST', body: formData });
      navigate('/owner/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #d1d5db', borderRadius: '6px' };

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2>Add New Stadium</h2>
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name">Stadium Name</label><br />
          <input id="name" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
          {errors.name && <p style={{ color: 'red', fontSize: '13px' }}>{errors.name}</p>}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="location">Location</label><br />
          <select id="location" name="location" value={form.location} onChange={handleChange} style={inputStyle}>
            <option value="">Select a city...</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.location && <p style={{ color: 'red', fontSize: '13px' }}>{errors.location}</p>}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="description">Description</label><br />
          <textarea id="description" name="description" value={form.description} onChange={handleChange}
            rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          {errors.description && <p style={{ color: 'red', fontSize: '13px' }}>{errors.description}</p>}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '500' }}>Facilities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
            {AMENITIES.map(amenity => (
              <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '500' }}>Photos</label><br />
          <label htmlFor="photos" style={{ display: 'inline-block', marginTop: '6px', padding: '7px 16px', backgroundColor: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            Choose Pics
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Preview ${i + 1}`}
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={loading}
            style={{ padding: '10px 24px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Add Stadium'}
          </button>
          <button type="button" onClick={() => navigate('/owner/dashboard')}
            style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStadium;
