import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Search,
  Filter,
  Phone,
  Building,
} from 'lucide-react';
import {
  Faculty,
  ScheduleVersion,
  CollegeSettings,
  Division,
  SubstitutionRequest,
  DayOfWeek,
  ScheduleAssignment,
} from '../../types';

interface TeacherSubstitutionViewProps {
  currentFaculty: Faculty;
  allFaculty: Faculty[];
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
  divisions: Division[];
  substitutions: SubstitutionRequest[];
  onSaveSubstitutions: (newSubstitutions: SubstitutionRequest[]) => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TeacherSubstitutionView: React.FC<TeacherSubstitutionViewProps> = ({
  currentFaculty,
  allFaculty,
  activeVersion,
  settings,
  divisions,
  substitutions,
  onSaveSubstitutions,
  onAddToast,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'incoming' | 'outgoing'>('create');

  // Form states for creating a new request
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [targetFacultyId, setTargetFacultyId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState<string>('');

  // Colleague radar filter & search
  const [colleagueSearch, setColleagueSearch] = useState<string>('');
  const [colleagueFilter, setColleagueFilter] = useState<'all' | 'free' | 'department'>('all');

  // My teaching assignments
  const myAssignments = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.assignments.filter(a => a.facultyId === currentFaculty.id);
  }, [activeVersion, currentFaculty.id]);

  // Auto-select first lecture if none selected
  React.useEffect(() => {
    if (!selectedAssignmentId && myAssignments.length > 0) {
      setSelectedAssignmentId(myAssignments[0].id);
    }
  }, [myAssignments, selectedAssignmentId]);

  // Selected assignment object
  const selectedAssignment = useMemo(() => {
    return myAssignments.find(a => a.id === selectedAssignmentId) || null;
  }, [myAssignments, selectedAssignmentId]);

  // Map each faculty's availability during the selected assignment slot
  const facultyAvailabilityList = useMemo(() => {
    if (!selectedAssignment || !activeVersion) {
      return allFaculty
        .filter(f => f.id !== currentFaculty.id && f.active)
        .map(fac => ({
          faculty: fac,
          isFree: true,
          conflictingAssignment: null as ScheduleAssignment | null,
        }));
    }

    const day = selectedAssignment.day;
    const start = selectedAssignment.startSlotIndex;
    const duration = selectedAssignment.durationSlots;

    return allFaculty
      .filter(fac => fac.id !== currentFaculty.id && fac.active)
      .map(fac => {
        const conflict = activeVersion.assignments.find(a => {
          if (a.facultyId !== fac.id) return false;
          if (a.day !== day) return false;

          const aStart = a.startSlotIndex;
          const aEnd = aStart + a.durationSlots;
          const reqStart = start;
          const reqEnd = start + duration;

          return Math.max(aStart, reqStart) < Math.min(aEnd, reqEnd);
        });

        return {
          faculty: fac,
          isFree: !conflict,
          conflictingAssignment: conflict || null,
        };
      });
  }, [selectedAssignment, activeVersion, allFaculty, currentFaculty.id]);

  const freeFacultyList = useMemo(() => {
    return facultyAvailabilityList.filter(item => item.isFree).map(item => item.faculty);
  }, [facultyAvailabilityList]);

  // Filtered radar list for display
  const filteredRadarList = useMemo(() => {
    return facultyAvailabilityList.filter(item => {
      const fac = item.faculty;
      // Search text
      if (colleagueSearch.trim()) {
        const query = colleagueSearch.toLowerCase();
        const matches =
          fac.name.toLowerCase().includes(query) ||
          fac.department.toLowerCase().includes(query) ||
          (fac.cabin && fac.cabin.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Filter
      if (colleagueFilter === 'free') {
        return item.isFree;
      }
      if (colleagueFilter === 'department') {
        return fac.department === currentFaculty.department;
      }
      return true;
    });
  }, [facultyAvailabilityList, colleagueSearch, colleagueFilter, currentFaculty.department]);

  // Incoming requests for this faculty
  const incomingRequests = useMemo(() => {
    return substitutions.filter(
      s => (s.targetFacultyId === currentFaculty.id || !s.targetFacultyId) && s.requestingFacultyId !== currentFaculty.id
    );
  }, [substitutions, currentFaculty.id]);

  // Outgoing requests created by this faculty
  const outgoingRequests = useMemo(() => {
    return substitutions.filter(s => s.requestingFacultyId === currentFaculty.id);
  }, [substitutions, currentFaculty.id]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) {
      onAddToast('error', 'Select Lecture', 'Please select which scheduled lecture you want covered.');
      return;
    }
    if (!reason.trim()) {
      onAddToast('error', 'Reason Required', 'Please enter a brief explanation for leave coverage.');
      return;
    }

    const target = allFaculty.find(f => f.id === targetFacultyId);

    const newRequest: SubstitutionRequest = {
      id: `subst-${Date.now()}`,
      requestingFacultyId: currentFaculty.id,
      requestingFacultyName: currentFaculty.name,
      targetFacultyId: target ? target.id : undefined,
      targetFacultyName: target ? target.name : undefined,
      assignmentId: selectedAssignment.id,
      subjectCode: selectedAssignment.subjectCode,
      subjectName: selectedAssignment.subjectName,
      divisionId: selectedAssignment.divisionId,
      divisionName: selectedAssignment.divisionName,
      batchName: selectedAssignment.batchName,
      roomNumber: selectedAssignment.roomNumber,
      day: selectedAssignment.day,
      slotIndex: selectedAssignment.startSlotIndex,
      timeRange: selectedAssignment.timeRange,
      date: requestDate,
      status: 'PENDING',
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    onSaveSubstitutions([newRequest, ...substitutions]);
    onAddToast(
      'success',
      'Substitution Request Broadcast',
      target
        ? `Request sent directly to ${target.name} for ${selectedAssignment.subjectCode} (${selectedAssignment.day} ${selectedAssignment.timeRange}).`
        : `Open pool request posted for ${selectedAssignment.subjectCode}. Available colleagues can accept.`
    );

    // Reset form
    setTargetFacultyId('');
    setReason('');
    setNotes('');
    setActiveTab('outgoing');
  };

  const handleRespond = (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const updated = substitutions.map(s => {
      if (s.id === requestId) {
        return {
          ...s,
          status,
          targetFacultyId: currentFaculty.id,
          targetFacultyName: currentFaculty.name,
        };
      }
      return s;
    });

    onSaveSubstitutions(updated);
    onAddToast(
      status === 'ACCEPTED' ? 'success' : 'info',
      status === 'ACCEPTED' ? 'Substitution Accepted' : 'Request Declined',
      status === 'ACCEPTED'
        ? 'You have agreed to cover this session. It will reflect on your daily schedule.'
        : 'The requesting faculty has been notified.'
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Faculty Collaboration</span>
            <span aria-hidden="true">·</span>
            <span>Leave Coverage & Peer Proxy Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Substitution & Proxy Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Request colleague coverage for upcoming leaves with automatic clash detection across all {allFaculty.length} faculty profiles.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Request Cover
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'incoming'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incoming ({incomingRequests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'outgoing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Requests ({outgoingRequests.length})
          </button>
        </div>
      </div>

      {/* Tab: Request Cover Form & Colleague Availability Radar */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Request Details */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Select Lecture & Submit Proxy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the class you need covered. The system computes free colleagues automatically.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Lecture to be Covered *
                </label>
                <select
                  value={selectedAssignmentId}
                  onChange={e => setSelectedAssignmentId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose from your weekly timetable --</option>
                  {myAssignments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.day} {a.timeRange} · {a.subjectName} ({a.divisionName}
                      {a.batchName ? ` - ${a.batchName}` : ''}) · Room: {a.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAssignment && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-emerald-950">
                    {selectedAssignment.subjectName} ({selectedAssignment.subjectCode})
                  </div>
                  <div className="text-emerald-800 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{selectedAssignment.day}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{selectedAssignment.timeRange}</span>
                    <span aria-hidden="true">·</span>
                    <span>Room: {selectedAssignment.roomNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Class: {selectedAssignment.divisionName}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Substitution *
                  </label>
                  <input
                    type="date"
                    value={requestDate}
                    onChange={e => setRequestDate(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Substitute Faculty (Optional)
                  </label>
                  <select
                    value={targetFacultyId}
                    onChange={e => setTargetFacultyId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Open Pool (Any free colleague can accept)</option>
                    <optgroup label="✨ Confirmed Free in this Slot">
                      {freeFacultyList.map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} ({fac.department}) · Free
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Faculty Members">
                      {allFaculty
                        .filter(f => f.id !== currentFaculty.id)
                        .map(fac => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name} ({fac.department})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leave / Substitution *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Attending University Academic Council Meeting / Medical leave"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions or Topics for Substitute
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Supervise Binary Search Tree coding exercise; test cases are in LAB-101 server."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Dispatch Substitution Request</span>
              </button>
            </form>
          </div>

          {/* Right Colleague Availability Radar: Interactive List of all teachers */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Colleague Availability Radar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live occupancy status of all {allFaculty.length - 1} faculty members for{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedAssignment ? `${selectedAssignment.day} ${selectedAssignment.timeRange}` : 'current slot'}
                  </span>
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                {freeFacultyList.length} Free
              </span>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by teacher name or department..."
                  value={colleagueSearch}
                  onChange={e => setColleagueSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setColleagueFilter('all')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded ${
                    colleagueFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  All ({facultyAvailabilityList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setColleagueFilter('free')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded ${
                    colleagueFilter === 'free' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-600'
                  }`}
                >
                  Free Only ({freeFacultyList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setColleagueFilter('department')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded ${
                    colleagueFilter === 'department' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  My Dept
                </button>
              </div>
            </div>

            {/* List of Teachers */}
            <div className="flex-1 max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {filteredRadarList.map(item => {
                const fac = item.faculty;
                const isSelected = targetFacultyId === fac.id;

                return (
                  <div
                    key={fac.id}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {fac.name}
                        </span>
                        {item.isFree ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            Free
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            In Class
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{fac.department}</span>
                        {fac.cabin && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{fac.cabin}</span>
                          </>
                        )}
                      </div>
                      {!item.isFree && item.conflictingAssignment && (
                        <div className="text-[10px] text-amber-700 mt-1 font-mono truncate">
                          Teaching: {item.conflictingAssignment.subjectCode} in {item.conflictingAssignment.roomNumber} ({item.conflictingAssignment.divisionName})
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTargetFacultyId(fac.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Pick as Proxy'}
                    </button>
                  </div>
                );
              })}
              {filteredRadarList.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No teachers found matching your filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Incoming Requests */}
      {activeTab === 'incoming' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Colleague Coverage Requests Received
              </h2>
              <p className="text-xs text-slate-500">
                Requests directed to you or posted to the open departmental coverage pool.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {incomingRequests.map(req => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {req.subjectName} ({req.subjectCode})
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : req.status === 'DECLINED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800">By: {req.requestingFacultyName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Date: {req.date} ({req.day})</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-emerald-700 font-semibold">{req.timeRange}</span>
                    <span aria-hidden="true">·</span>
                    <span>Room: {req.roomNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Class: {req.divisionName}</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-700">Reason:</span> {req.reason}
                    {req.notes && (
                      <div className="mt-1 text-slate-500 italic">
                        Notes: {req.notes}
                      </div>
                    )}
                  </div>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, 'ACCEPTED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Proxy</span>
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'DECLINED')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {incomingRequests.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No incoming substitution requests right now.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: My Outgoing Requests */}
      {activeTab === 'outgoing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                My Outgoing Substitution Requests
              </h2>
              <p className="text-xs text-slate-500">
                Track status of cover requests you have submitted.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {outgoingRequests.map(req => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {req.subjectName} ({req.subjectCode})
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : req.status === 'DECLINED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span>Date: {req.date} ({req.day})</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-emerald-700 font-semibold">{req.timeRange}</span>
                    <span aria-hidden="true">·</span>
                    <span>Room: {req.roomNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Class: {req.divisionName}</span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Cover Assigned To: </span>
                    <span className="text-slate-900 font-medium">
                      {req.targetFacultyName || 'Open pool (Broadcasting)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Reason: {req.reason}
                  </div>
                </div>
              </div>
            ))}

            {outgoingRequests.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not submitted any substitution requests yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
