// pages/AdminPanel.jsx — The admin control panel (CSR Manager view).
//
// Features:
//   - Create new volunteering events via a form
//   - See all existing events with registration counts
//   - Delete events
//   - See who registered for each event (expandable)

import { useState, useEffect } from 'react';
import api from '../api/axios';

const CAUSES = ['Environment', 'Education', 'Food', 'Health', 'Animals', 'Community', 'Technology'];

const emptyForm = {
  title: '', description: '', cause: 'Environment',
  location: '', date: '', duration_hrs: 2, max_volunteers: 50
};

export default function AdminPanel() {
  const [events, setEvents]         = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');
  const [expandedEvent, setExpandedEvent] = useState(null); // Event whose registrations are shown
  const [registrations, setRegistrations] = useState({});  // Cache of registrations per event

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      showMessage('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
        showMessage('Event updated successfully!', 'success');
      } else {
        await api.post('/events', form);
        showMessage('Event created successfully!', 'success');
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title, description: event.description || '',
      cause: event.cause, location: event.location,
      date: event.date.split('T')[0], // Format date for input
      duration_hrs: event.duration_hrs, max_volunteers: event.max_volunteers
    });
    setEditingId(event.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This will also remove all registrations.`)) return;
    try {
      await api.delete(`/events/${id}`);
      showMessage('Event deleted.', 'info');
      fetchEvents();
    } catch (err) {
      showMessage('Delete failed.', 'error');
    }
  };

  const loadRegistrations = async (eventId) => {
    if (expandedEvent === eventId) { setExpandedEvent(null); return; }
    try {
      const res = await api.get(`/registrations/event/${eventId}`);
      setRegistrations(prev => ({ ...prev, [eventId]: res.data }));
      setExpandedEvent(eventId);
    } catch {
      showMessage('Could not load registrations.', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage volunteering events and view registrations</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {showForm ? '✕ Cancel' : '+ New Event'}
        </button>
      </div>

      {/* Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error'   ? 'bg-red-500 text-white' :
                                       'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* ── CREATE / EDIT FORM ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-5">
            {editingId ? '✏️ Edit Event' : '➕ Create New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input
                type="text" name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. Tree Plantation Drive at City Park"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="What will volunteers do? What impact will it create?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cause *</label>
              <select
                name="cause" value={form.cause} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                {CAUSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text" name="location" value={form.location} onChange={handleChange} required
                placeholder="e.g. City Park, Bangalore"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date" name="date" value={form.date} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number" name="duration_hrs" value={form.duration_hrs} onChange={handleChange}
                min="0.5" max="24" step="0.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Volunteers</label>
              <input
                type="number" name="max_volunteers" value={form.max_volunteers} onChange={handleChange}
                min="1" max="1000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── EVENTS TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">All Events ({events.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No events yet. Create your first event!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map(event => (
              <div key={event.id}>
                {/* Event row */}
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{event.cause}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>📍 {event.location}</span>
                        <span>⏱ {event.duration_hrs}h</span>
                        <span className={`font-medium ${event.registered_count >= event.max_volunteers ? 'text-red-500' : 'text-green-600'}`}>
                          👥 {event.registered_count}/{event.max_volunteers} registered
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* View registrations toggle */}
                      <button
                        onClick={() => loadRegistrations(event.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {expandedEvent === event.id ? 'Hide' : 'View'} Volunteers
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-xs text-gray-600 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id, event.title)}
                        className="text-xs text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded registrations list */}
                {expandedEvent === event.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Registered Volunteers ({registrations[event.id]?.length || 0})
                    </h4>
                    {!registrations[event.id] || registrations[event.id].length === 0 ? (
                      <p className="text-sm text-gray-400">No volunteers registered yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {registrations[event.id].map(reg => (
                          <div key={reg.id} className="bg-white rounded-lg px-3 py-2 text-sm border border-gray-100 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {reg.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-700 truncate">{reg.name}</div>
                              <div className="text-gray-400 text-xs truncate">{reg.company}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
