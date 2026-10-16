import React, { useState } from 'react';
import {
  Settings,
  GraduationCap,
  Clock,
  BookOpen,
  UserCheck,
  Building2,
  Sliders,
  Save,
} from 'lucide-react';
import type { TimetableConfig } from '../types';

interface ConfigSectionProps {
  config: TimetableConfig;
  onChange: (newConfig: TimetableConfig) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  config,
  onChange,
  onSave,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<
    'academic' | 'slots' | 'subjects' | 'faculty' | 'rooms' | 'solver'
  >('academic');

  // Helpers for immutability
  const updateField = <K extends keyof TimetableConfig>(key: K, value: TimetableConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <h2 className="cf-card-title">
          <Settings size={19} color="#7c3aed" />
          Academic Scheduling Configuration & Constraints
        </h2>
        <button
          className="cf-btn cf-btn-secondary cf-btn-sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save size={14} />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Tabs */}
      <div className="cf-tabs">
        <button
          className={`cf-tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveTab('academic')}
        >
          <GraduationCap size={15} /> Academic & Divisions
        </button>
        <button
          className={`cf-tab-btn ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          <Clock size={15} /> Slots & Breaks
        </button>
        <button
          className={`cf-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <BookOpen size={15} /> Subjects & Requirements
        </button>
        <button
          className={`cf-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <UserCheck size={15} /> Faculty & Availability
        </button>
        <button
          className={`cf-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          <Building2 size={15} /> Rooms & Labs
        </button>
        <button
          className={`cf-tab-btn ${activeTab === 'solver' ? 'active' : ''}`}
          onClick={() => setActiveTab('solver')}
        >
          <Sliders size={15} /> Solver & Weights
        </button>
      </div>

      {/* Tab 1: Academic & Divisions */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cf-form-grid">
            <div className="cf-form-group">
              <label className="cf-label">Academic Year</label>
              <input
                className="cf-input"
                value={config.academic_year}
                onChange={(e) => updateField('academic_year', e.target.value)}
              />
            </div>
            <div className="cf-form-group">
              <label className="cf-label">Semester</label>
              <input
                className="cf-input"
                value={config.semester}
                onChange={(e) => updateField('semester', e.target.value)}
              />
            </div>
            <div className="cf-form-group">
              <label className="cf-label">Department</label>
              <input
                className="cf-input"
                value={config.department}
                onChange={(e) => updateField('department', e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="cf-label">Registered Student Divisions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {config.divisions.map((div, idx) => (
                <div
                  key={div.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                  }}
                >
                  <div style={{ width: '120px' }}>
                    <label className="cf-label" style={{ fontSize: '10px' }}>Div ID</label>
                    <input
                      className="cf-input"
                      style={{ padding: '4px 8px', fontSize: '13px' }}
                      value={div.id}
                      onChange={(e) => {
                        const next = [...config.divisions];
                        next[idx].id = e.target.value;
                        updateField('divisions', next);
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cf-label" style={{ fontSize: '10px' }}>Name</label>
                    <input
                      className="cf-input"
                      style={{ padding: '4px 8px', fontSize: '13px' }}
                      value={div.name}
                      onChange={(e) => {
                        const next = [...config.divisions];
                        next[idx].name = e.target.value;
                        updateField('divisions', next);
                      }}
                    />
                  </div>
                  <div style={{ width: '130px' }}>
                    <label className="cf-label" style={{ fontSize: '10px' }}>Student Strength</label>
                    <input
                      type="number"
                      className="cf-input"
                      style={{ padding: '4px 8px', fontSize: '13px' }}
                      value={div.student_strength}
                      onChange={(e) => {
                        const next = [...config.divisions];
                        next[idx].student_strength = parseInt(e.target.value) || 0;
                        updateField('divisions', next);
                      }}
                    />
                  </div>
                  <div style={{ width: '220px' }}>
                    <label className="cf-label" style={{ fontSize: '10px' }}>Blocked Periods ({div.blocked_slots.length})</label>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {div.blocked_slots.map((b) => `${b.day} slot ${b.slot_index}`).join(', ') || 'None'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Slots & Breaks */}
      {activeTab === 'slots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="cf-label" style={{ marginBottom: '8px', display: 'block' }}>Working Days</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                const active = config.working_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`cf-btn cf-btn-sm ${active ? 'cf-btn-primary' : 'cf-btn-secondary'}`}
                    onClick={() => {
                      const next = active
                        ? config.working_days.filter((d) => d !== day)
                        : [...config.working_days, day];
                      updateField('working_days', next);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="cf-label" style={{ marginBottom: '8px', display: 'block' }}>
              Daily Schedule & Break Periods ({config.time_slots.length} Slots)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.time_slots.map((ts, idx) => (
                <div
                  key={ts.slot_index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: ts.is_break ? 'var(--pastel-yellow-bg)' : '#f8fafc',
                    border: ts.is_break ? '1px solid var(--pastel-yellow-border)' : '1px solid var(--panel-border)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontWeight: 700, width: '60px', fontSize: '12px' }}>
                    Slot {ts.slot_index + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      className="cf-input"
                      style={{ width: '90px', padding: '4px 6px', fontSize: '12px' }}
                      value={ts.start_time}
                      onChange={(e) => {
                        const next = [...config.time_slots];
                        next[idx].start_time = e.target.value;
                        updateField('time_slots', next);
                      }}
                    />
                    <span>to</span>
                    <input
                      className="cf-input"
                      style={{ width: '90px', padding: '4px 6px', fontSize: '12px' }}
                      value={ts.end_time}
                      onChange={(e) => {
                        const next = [...config.time_slots];
                        next[idx].end_time = e.target.value;
                        updateField('time_slots', next);
                      }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ts.is_break}
                      onChange={(e) => {
                        const next = [...config.time_slots];
                        next[idx].is_break = e.target.checked;
                        if (e.target.checked && !next[idx].break_name) {
                          next[idx].break_name = 'Break';
                        }
                        updateField('time_slots', next);
                      }}
                    />
                    Is Break Period (Unavailable for Teaching)
                  </label>

                  {ts.is_break && (
                    <input
                      className="cf-input"
                      placeholder="Break Label (e.g. Lunch Break)"
                      style={{ width: '160px', padding: '4px 6px', fontSize: '12px' }}
                      value={ts.break_name || ''}
                      onChange={(e) => {
                        const next = [...config.time_slots];
                        next[idx].break_name = e.target.value;
                        updateField('time_slots', next);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Subjects & Requirements */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span className="cf-label" style={{ marginBottom: '8px', display: 'block' }}>Subjects ({config.subjects.length})</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {config.subjects.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{sub.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code: {sub.code} | Dept: {sub.department}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="cf-label" style={{ marginBottom: '8px', display: 'block' }}>
              Curriculum Weekly Session Requirements ({config.requirements.length} Requirements)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.requirements.map((req, idx) => {
                const sub = config.subjects.find((s) => s.id === req.subject_id);
                const div = config.divisions.find((d) => d.id === req.division_id);
                return (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      background: req.session_type === 'practical' ? 'var(--pastel-green-bg)' : '#f8fafc',
                      borderRadius: '8px',
                      border: req.session_type === 'practical' ? '1px solid var(--pastel-green-border)' : '1px solid var(--panel-border)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ width: '160px', fontWeight: 600 }}>{sub?.name}</div>
                    <div style={{ width: '80px', color: 'var(--text-muted)' }}>{div?.id}</div>
                    <span
                      className={`cf-badge ${req.session_type === 'practical' ? 'cf-badge-practical' : 'cf-badge-theory'}`}
                      style={{ fontSize: '11px', padding: '2px 6px' }}
                    >
                      {req.session_type}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weekly Count:</span>
                      <input
                        type="number"
                        className="cf-input"
                        style={{ width: '55px', padding: '3px 6px', fontSize: '12px' }}
                        value={req.weekly_count}
                        onChange={(e) => {
                          const next = [...config.requirements];
                          next[idx].weekly_count = parseInt(e.target.value) || 0;
                          updateField('requirements', next);
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration:</span>
                      <input
                        type="number"
                        className="cf-input"
                        style={{ width: '50px', padding: '3px 6px', fontSize: '12px' }}
                        value={req.duration_slots}
                        onChange={(e) => {
                          const next = [...config.requirements];
                          next[idx].duration_slots = parseInt(e.target.value) || 1;
                          updateField('requirements', next);
                        }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>slot(s)</span>
                    </div>

                    {req.requires_lab && (
                      <span className="cf-badge cf-badge-practical" style={{ fontSize: '10px' }}>
                        Requires Lab {req.required_equipment.length > 0 ? `(${req.required_equipment.join(', ')})` : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Faculty & Availability */}
      {activeTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span className="cf-label">Faculty Roster & Workload Constraints ({config.faculty.length} Faculty Members)</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {config.faculty.map((fac, idx) => (
              <div
                key={fac.id}
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>{fac.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fac.department}</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Qualified: {fac.qualified_subject_ids.map((id) => config.subjects.find((s) => s.id === id)?.code || id).join(', ')}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Daily:</span>
                    <input
                      type="number"
                      className="cf-input"
                      style={{ width: '50px', padding: '2px 4px', fontSize: '12px' }}
                      value={fac.max_daily_sessions}
                      onChange={(e) => {
                        const next = [...config.faculty];
                        next[idx].max_daily_sessions = parseInt(e.target.value) || 4;
                        updateField('faculty', next);
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Weekly:</span>
                    <input
                      type="number"
                      className="cf-input"
                      style={{ width: '50px', padding: '2px 4px', fontSize: '12px' }}
                      value={fac.max_weekly_sessions}
                      onChange={(e) => {
                        const next = [...config.faculty];
                        next[idx].max_weekly_sessions = parseInt(e.target.value) || 16;
                        updateField('faculty', next);
                      }}
                    />
                  </div>
                </div>

                {fac.unavailable_slots.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                    Unavailable: {fac.unavailable_slots.map((u) => `${u.day} slot ${u.slot_index}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Rooms & Labs */}
      {activeTab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span className="cf-label">Rooms, Laboratories & Capacities ({config.rooms.length} Rooms)</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {config.rooms.map((rm, idx) => (
              <div
                key={rm.id}
                style={{
                  padding: '12px 16px',
                  background: rm.room_type === 'lab' ? 'var(--pastel-green-bg)' : '#f8fafc',
                  border: rm.room_type === 'lab' ? '1px solid var(--pastel-green-border)' : '1px solid var(--panel-border)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px' }}>{rm.name}</strong>
                  <span className={`cf-badge ${rm.room_type === 'lab' ? 'cf-badge-practical' : 'cf-badge-theory'}`} style={{ fontSize: '10px' }}>
                    {rm.room_type.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Student Capacity:</span>
                  <input
                    type="number"
                    className="cf-input"
                    style={{ width: '65px', padding: '2px 6px', fontSize: '12px' }}
                    value={rm.capacity}
                    onChange={(e) => {
                      const next = [...config.rooms];
                      next[idx].capacity = parseInt(e.target.value) || 0;
                      updateField('rooms', next);
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>students</span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Equipment: {rm.equipment.join(', ') || 'Standard Classroom Equipment'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Solver Settings & Weights */}
      {activeTab === 'solver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cf-form-grid">
            <div className="cf-form-group">
              <label className="cf-label">Solver Time Limit (Seconds)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="120"
                className="cf-input"
                value={config.solver_time_limit}
                onChange={(e) => updateField('solver_time_limit', parseFloat(e.target.value) || 15.0)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Maximum time allowed for Google OR-Tools CP-SAT solver.
              </span>
            </div>

            <div className="cf-form-group">
              <label className="cf-label">Allow Best Partial Solution</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.allow_partial}
                  onChange={(e) => updateField('allow_partial', e.target.checked)}
                />
                Schedule maximal feasible subset if complete is infeasible
              </label>
            </div>
          </div>

          <div>
            <span className="cf-label" style={{ marginBottom: '8px', display: 'block' }}>
              Soft Constraint Optimization Weights
            </span>
            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label className="cf-label" style={{ fontSize: '11px' }}>Minimize Student Gaps ({config.weights.gap_weight})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.weights.gap_weight}
                  onChange={(e) =>
                    updateField('weights', { ...config.weights, gap_weight: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="cf-form-group">
                <label className="cf-label" style={{ fontSize: '11px' }}>Subject Spread Across Week ({config.weights.subject_spread_weight})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.weights.subject_spread_weight}
                  onChange={(e) =>
                    updateField('weights', { ...config.weights, subject_spread_weight: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="cf-form-group">
                <label className="cf-label" style={{ fontSize: '11px' }}>Faculty Preferred Slots ({config.weights.preference_weight})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.weights.preference_weight}
                  onChange={(e) =>
                    updateField('weights', { ...config.weights, preference_weight: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="cf-form-group">
                <label className="cf-label" style={{ fontSize: '11px' }}>Room Capacity Efficiency ({config.weights.room_efficiency_weight})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.weights.room_efficiency_weight}
                  onChange={(e) =>
                    updateField('weights', { ...config.weights, room_efficiency_weight: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
