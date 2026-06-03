// pages/Events.jsx — The main events listing page for employees.
//
// What this page does:
//   1. On load: fetches all events AND the user's current registrations
//   2. Shows each event as a card with: title, date, location, cause, spots left
//   3. If already registered → shows a "Cancel" button instead of "Register"
//   4. Handles full events gracefully

import { useState, useEffect } from 'react';
import api from '../api/axios';

// Cause badges get different colors (makes it look professional)
const CAUSE_COLORS = {
  'Environment':  'bg-green-100 text-green-700',
  'Education':    'bg-blue-100 text-blue-700',
  'Food':         'bg-orange-100 text-orange-700',
  'Health':       'bg-red-100 text-red-700',
  'Animals':      'bg-yellow-100 text-yellow-700',
  'Community':    'bg-purple-100 text-purple-700',
  'Technology':   'bg-indigo-100 text-indigo-700',
};

function getCauseColor(cause) {
  return CAUSE_COLORS[cause] || 'bg-gray-100 text-gray-700';
}

export default function Events() {
  const [events, setEvents]           = useState([]);
  const [myRegistrations, setMyReg]   = useState(new Set()); // Set of event IDs I'm registered for
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID of event being registered/cancelled
  const [message, setMessage]         = useState('');
  const [filter, setFilter]           = useState('all'); // Filter by cause

  // Fetch events and my registrations when the page loads
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Run both requests at the same time (faster than doing them one after another)
      const [eventsRes, myRegRes] = await Promise.all([
        api.get('/events'),
        api.get('/registrations/my'),
      ]);
      setEvents(eventsRes.data);
      // Store only the event IDs I'm registered for in a Set (fast O(1) lookup)
      setMyReg(new Set(myRegRes.data.map(r => r.event_id)));
    } catch (err) {
      setMessage('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setActionLoading(eventId);
    try {
      const res = await api.post(`/registrations/${eventId}`);
      setMyReg(prev => new Set([...prev, eventId])); // Optimistically update UI
      showMessage(res.data.message, 'success');
      fetchAll(); // Refresh to update spot count
    } catch (err) {
      showMessage(err.response?.data?.error || 'Registration failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (eventId) => {
    setActionLoading(eventId);
    try {
      await api.delete(`/registrations/${eventId}`);
      setMyReg(prev => { const s = new Set(prev); s.delete(eventId); return s; });
      showMessage('Registration cancelled.', 'info');
      fetchAll();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Cancellation failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showMessage = (msg, type) => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000); // Auto-hide after 3 seconds
  };

  // Get unique causes for filter dropdown
  const causes = ['all', ...new Set(events.map(e => e.cause))];

  // Filter events based on selected cause
  const filtered = filter === 'all' ? events : events.filter(e => e.cause === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">🌀</div>
        <p>Loading events...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Volunteering Events</h1>
        <p className="text-gray-500 mt-1">Browse and sign up for upcoming events. Make a difference!</p>
      </div>

      {/* Toast notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error'   ? 'bg-red-500 text-white' :
                                       'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{events.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Events</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{myRegistrations.size}</div>
          <div className="text-xs text-gray-500 mt-1">My Registrations</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {events.filter(e => new Date(e.date) > new Date()).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Upcoming Events</div>
        </div>
      </div>

      {/* Filter by Cause */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {causes.map(cause => (
          <button
            key={cause}
            onClick={() => setFilter(cause)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === cause
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'
            }`}
          >
            {cause === 'all' ? 'All Causes' : cause}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(event => {
            const isRegistered = myRegistrations.has(event.id);
            const isFull = event.registered_count >= event.max_volunteers;
            const isPast = new Date(event.date) < new Date();
            const spotsLeft = event.max_volunteers - event.registered_count;

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                {/* Card header with cause badge */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCauseColor(event.cause)}`}>
                      {event.cause}
                    </span>
                    {isRegistered && (
                      <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full font-medium">
                        ✓ Registered
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-800 mb-2 leading-tight">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{event.description}</p>
                  )}

                  {/* Event details */}
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>{event.duration_hrs} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span className={isFull ? 'text-red-500 font-medium' : ''}>
                        {isFull ? 'Full' : `${spotsLeft} spots left`} / {event.max_volunteers} total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer with action button */}
                <div className="px-5 pb-5">
                  {isPast ? (
                    <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl text-sm font-medium cursor-not-allowed">
                      Event Ended
                    </button>
                  ) : isRegistered ? (
                    <button
                      onClick={() => handleCancel(event.id)}
                      disabled={actionLoading === event.id}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      {actionLoading === event.id ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull || actionLoading === event.id}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      {actionLoading === event.id ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
