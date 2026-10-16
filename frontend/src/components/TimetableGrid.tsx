import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  User,
  MapPin,
  Users,
  Clock,
} from 'lucide-react';
import type {
  TimetableConfig,
  ScheduledSession,
} from '../types';

interface TimetableGridProps {
  config: TimetableConfig;
  sessions: ScheduledSession[];
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ config, sessions }) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedDivision !== 'ALL' && s.division_id !== selectedDivision) return false;
      if (selectedFaculty !== 'ALL' && s.faculty_id !== selectedFaculty) return false;
      if (selectedRoom !== 'ALL' && s.room_id !== selectedRoom) return false;
      if (selectedSubject !== 'ALL' && s.subject_id !== selectedSubject) return false;
      return true;
    });
  }, [sessions, selectedDivision, selectedFaculty, selectedRoom, selectedSubject]);

  // Lookup for fast cell indexing: (day, slot_index) -> list of sessions starting or running here
  const { sessionStartingAt, sessionContinuationAt } = useMemo(() => {
    const starting = new Map<string, ScheduledSession[]>();
    const continuation = new Map<string, ScheduledSession>();

    filteredSessions.forEach((sess) => {
      const startKey = `${sess.day}_${sess.start_slot_index}`;
      const currentList = starting.get(startKey) || [];
      currentList.push(sess);
      starting.set(startKey, currentList);

      // Record continuation slots (for multi-hour continuous practical blocks)
      for (let i = 1; i < sess.duration_slots; i++) {
        const contKey = `${sess.day}_${sess.start_slot_index + i}`;
        continuation.set(contKey, sess);
      }
    });

    return { sessionStartingAt: starting, sessionContinuationAt: continuation };
  }, [filteredSessions]);

  const days = config.working_days;
  const timeSlots = config.time_slots;

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <h2 className="cf-card-title">
          <Calendar size={19} color="#7c3aed" />
          Generated Weekly Timetable Schedule
        </h2>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredSessions.length}</strong> of {sessions.length} sessions
        </span>
      </div>

      {/* Filter Bar */}
      <div className="cf-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
          <Filter size={15} />
          Filters:
        </div>

        {/* Division Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label className="cf-label" style={{ fontSize: '11px' }}>Division:</label>
          <select
            className="cf-select"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="ALL">All Divisions</option>
            {config.divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Faculty Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label className="cf-label" style={{ fontSize: '11px' }}>Faculty:</label>
          <select
            className="cf-select"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="ALL">All Faculty</option>
            {config.faculty.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Room Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label className="cf-label" style={{ fontSize: '11px' }}>Room / Lab:</label>
          <select
            className="cf-select"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            <option value="ALL">All Rooms</option>
            {config.rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label className="cf-label" style={{ fontSize: '11px' }}>Subject:</label>
          <select
            className="cf-select"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="ALL">All Subjects</option>
            {config.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {(selectedDivision !== 'ALL' || selectedFaculty !== 'ALL' || selectedRoom !== 'ALL' || selectedSubject !== 'ALL') && (
          <button
            className="cf-btn cf-btn-secondary cf-btn-sm"
            onClick={() => {
              setSelectedDivision('ALL');
              setSelectedFaculty('ALL');
              setSelectedRoom('ALL');
              setSelectedSubject('ALL');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid Table */}
      <div className="cf-grid-table-wrap">
        <table className="cf-grid-table">
          <thead>
            <tr>
              <th className="cf-time-col">Time Slot</th>
              {days.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => {
              // Check if entire row is a break period
              if (slot.is_break) {
                return (
                  <tr key={slot.slot_index}>
                    <td className="cf-time-col">
                      <div>{slot.start_time} - {slot.end_time}</div>
                    </td>
                    <td colSpan={days.length} className="cf-break-cell">
                      🥪 {slot.break_name || 'Break Period'} ({slot.start_time} - {slot.end_time})
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.slot_index}>
                  <td className="cf-time-col">
                    <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{slot.start_time}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>to {slot.end_time}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Slot {slot.slot_index + 1}</div>
                  </td>

                  {days.map((day) => {
                    const cellKey = `${day}_${slot.slot_index}`;
                    const startingSessions = sessionStartingAt.get(cellKey) || [];
                    const contSession = sessionContinuationAt.get(cellKey);

                    // If part of continuous multi-hour block from previous slot
                    if (contSession) {
                      return (
                        <td key={day} style={{ verticalAlign: 'top', padding: '6px' }}>
                          <div
                            className="cf-session-card practical"
                            style={{
                              borderTop: '2px dashed #86efac',
                              opacity: 0.9,
                              minHeight: '60px',
                              justifyContent: 'center',
                            }}
                          >
                            <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#166534' }}>
                              ↳ Continued: {contSession.subject_name} ({contSession.room_name})
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (startingSessions.length === 0) {
                      return (
                        <td key={day}>
                          <div className="cf-empty-slot">Free Period</div>
                        </td>
                      );
                    }

                    return (
                      <td key={day} style={{ verticalAlign: 'top', padding: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {startingSessions.map((sess) => {
                            const isTheory = sess.session_type === 'theory';
                            const cardClass = isTheory ? 'theory' : 'practical';
                            return (
                              <div
                                key={sess.session_id}
                                className={`cf-session-card ${cardClass}`}
                                style={sess.duration_slots > 1 ? { borderLeft: '4px solid #16a34a' } : undefined}
                              >
                                <div className="cf-session-title">
                                  <span>{sess.subject_name}</span>
                                  <span
                                    className={`cf-badge ${isTheory ? 'cf-badge-theory' : 'cf-badge-practical'}`}
                                    style={{ fontSize: '10px', padding: '1px 6px' }}
                                  >
                                    {sess.session_type === 'practical' ? `Lab (${sess.duration_slots}h)` : 'Theory'}
                                  </span>
                                </div>

                                <div className="cf-session-meta">
                                  <span>
                                    <Users size={12} />
                                    <strong>{sess.division_name}</strong>
                                  </span>
                                  <span>
                                    <User size={12} />
                                    {sess.faculty_name}
                                  </span>
                                  <span>
                                    <MapPin size={12} />
                                    {sess.room_name}
                                  </span>
                                  <span style={{ color: '#0369a1', fontWeight: 600 }}>
                                    <Clock size={11} />
                                    {sess.start_time} - {sess.end_time}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
