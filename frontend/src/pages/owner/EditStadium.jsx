import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request, { BASE_URL } from '../../utils/api';

const AMENITIES = ['WC', 'Parking', 'Showers', 'Prayer Room', 'Changing Rooms', 'Vendor Booth'];

function EditStadium() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [amenities, setAmenities] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/api/stadiums/${id}`);
        setForm({ name: data.name, description: data.description });
        setAmenities(data.amenities ?? []);
        setExistingPhotos(data.photos ?? []);
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNewFiles = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
    setNewPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleRemoveExisting = (index) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError(null);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      existingPhotos.forEach(p => formData.append('keepPhotos', p));
      newFiles.forEach(f => formData.append('newPhotos', f));
      amenities.forEach(a => formData.append('amenities', a));
      await request(`/api/stadiums/${id}`, { method: 'PUT', body: formData });
      setSuccessMsg('Stadium updated successfully!');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const inputStyle = {
    width: '100%', padding: '8px', marginTop: '4px',
    border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box'
  };

  const removeBtnStyle = {
    position: 'absolute', top: '-6px', right: '-6px',
    width: '22px', height: '22px', borderRadius: '50%',
    backgroundColor: '#ef4444', color: 'white',
    border: 'none', cursor: 'pointer', fontSize: '14px',
    lineHeight: '22px', textAlign: 'center', padding: 0
  };

  return (
    <div style={{ maxWidth: '540px' }}>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-ghost" style={{ marginBottom: '16px' }}>
        ← Dashboard
      </button>
      <h2>Edit Stadium</h2>
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
      {successMsg !== null && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>{successMsg}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name">Stadium Name</label><br />
          <input id="name" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
          {errors.name !== undefined && <p style={{ color: 'red', fontSize: '13px', margin: '4px 0 0' }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description">Description</label><br />
          <textarea
            id="description" name="description" value={form.description}
            onChange={handleChange} rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          {errors.description !== undefined && <p style={{ color: 'red', fontSize: '13px', margin: '4px 0 0' }}>{errors.description}</p>}
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

        <div style={{ marginBottom: '16px' }}>
          <label>Current Photos</label>
          {existingPhotos.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0' }}>No photos yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {existingPhotos.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={`${BASE_URL}${src}`}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '90px', height: '68px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db', display: 'block' }}
                  />
                  <button type="button" onClick={() => handleRemoveExisting(i)} style={removeBtnStyle}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '500' }}>Add New Photos</label><br />
          <label htmlFor="newPhotos" style={{ display: 'inline-block', marginTop: '6px', padding: '7px 16px', backgroundColor: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            Choose Pics
          </label>
          <input
            id="newPhotos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewFiles}
            style={{ display: 'none' }}
          />
          {newPreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {newPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`New photo ${i + 1}`}
                    style={{ width: '90px', height: '68px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #2563eb', display: 'block' }}
                  />
                  <button type="button" onClick={() => handleRemoveNew(i)} style={removeBtnStyle}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/owner/dashboard')}
            style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>

      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', padding: '28px 32px',
            maxWidth: '360px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>Save Changes</h3>
            <p style={{ color: '#374151' }}>Are you sure you want to save the changes to this stadium?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                style={{ padding: '8px 18px', border: 'none', borderRadius: '6px', backgroundColor: '#047857', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditStadium;
