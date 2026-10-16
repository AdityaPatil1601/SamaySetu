import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Search,
  Check,
  ChevronRight,
  UserCheck,
  AlertOctagon,
} from 'lucide-react';
import {
  TIME_SLOTS,
  ROOMS,
  DIVISIONS,
  FACULTY_MEMBERS,
  INITIAL_TIMETABLE,
} from '../data/timetableData';
import {
  repairRoomDisruption,
  repairFacultyDisruption,
  validateSlotConflicts,
} from '../utils/timetableRepair';

const STORAGE_KEY = 'samaysetu_repaired_timetable_v1';

export default function EmergencyTimetableRepair() {
  // --- Timetable State ---
  const [timetable, setTimetable] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load timetable from storage', e);
    }
    return INITIAL_TIMETABLE;
  });

  // --- Filter State ---
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Repair Form State ---
  // disruptionType: 'FACULTY' | 'ROOM'
  const [disruptionType, setDisruptionType] = useState('FACULTY');
  const [selectedFaculty, setSelectedFaculty] = useState('Prof. Priya Verma');
  const [selectedRoom, setSelectedRoom] = useState('Room 301');
  const [selectedLectureId, setSelectedLectureId] = useState('lec-201'); // 10:00 AM Prof. Priya Verma
  const [repairStrategy, setRepairStrategy] = useState('auto'); // 'auto' | 'substitute' | 'reschedule'

  // --- Resolution / Staging State ---
  const [repairResult, setRepairResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentlyRepairedId, setRecentlyRepairedId] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timetable));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [timetable]);

  // Lectures affected by selected faculty or room
  const availableLecturesForSelection = useMemo(() => {
    if (disruptionType === 'FACULTY') {
      return timetable.filter((lec) => lec.faculty === selectedFaculty);
    } else {
      return timetable.filter((lec) => lec.room === selectedRoom);
    }
  }, [timetable, disruptionType, selectedFaculty, selectedRoom]);

  // Keep selectedLectureId valid when faculty/room changes
  useEffect(() => {
    if (availableLecturesForSelection.length > 0) {
      const exists = availableLecturesForSelection.some((l) => l.id === selectedLectureId);
      if (!exists) {
        setSelectedLectureId(availableLecturesForSelection[0].id);
      }
    } else {
      setSelectedLectureId('');
    }
    // Clear staged repair result when inputs change
    setRepairResult(null);
  }, [disruptionType, selectedFaculty, selectedRoom, availableLecturesForSelection]);

  // Handle Quick Scenario presets
  const applyPresetScenario = (scenario) => {
    setRepairResult(null);
    if (scenario === 'priya_absence') {
      setDisruptionType('FACULTY');
      setSelectedFaculty('Prof. Priya Verma');
      setSelectedLectureId('lec-201');
      setRepairStrategy('auto');
    } else if (scenario === 'room301_failure') {
      setDisruptionType('ROOM');
      setSelectedRoom('Room 301');
      setSelectedLectureId('lec-201');
    } else if (scenario === 'sharma_absence') {
      setDisruptionType('FACULTY');
      setSelectedFaculty('Dr. Rajesh Sharma');
      setSelectedLectureId('lec-101');
      setRepairStrategy('substitute');
    }
  };

  // Run the Repair Algorithm
  const handleRepairTimetable = () => {
    const lectureToRepair = timetable.find((lec) => lec.id === selectedLectureId);
    if (!lectureToRepair) {
      setNotification({
        type: 'error',
        message: 'Please select a valid scheduled lecture to repair.',
      });
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      let result = null;
      if (disruptionType === 'ROOM') {
        result = repairRoomDisruption({
          timetable,
          lecture: lectureToRepair,
          unavailableRoom: selectedRoom,
        });
      } else {
        result = repairFacultyDisruption({
          timetable,
          lecture: lectureToRepair,
          unavailableFaculty: selectedFaculty,
          preferredStrategy: repairStrategy,
        });
      }

      setRepairResult(result);
      setIsCalculating(false);
    }, 280);
  };

  // Confirm and Apply the Repair
  const handleConfirmRepair = () => {
    if (!repairResult || !repairResult.proposedLecture) return;

    const updatedLecture = repairResult.proposedLecture;

    // Safety check: Validate no conflicts before applying
    const conflictCheck = validateSlotConflicts(timetable, {
      slotId: updatedLecture.slotId,
      room: updatedLecture.room,
      faculty: updatedLecture.faculty,
      division: updatedLecture.division,
      excludeLectureId: updatedLecture.id,
    });

    if (conflictCheck.hasConflict) {
      setNotification({
        type: 'error',
        message: `Safety Block: Cannot apply due to clash: ${conflictCheck.details.join(' ')}`,
      });
      return;
    }

    setTimetable((prev) =>
      prev.map((lec) => (lec.id === updatedLecture.id ? updatedLecture : lec))
    );

    setRecentlyRepairedId(updatedLecture.id);
    setNotification({
      type: 'success',
      message: `Emergency Repair Applied: ${updatedLecture.subject} successfully updated without any schedule conflicts.`,
    });
    setRepairResult(null);

    // Scroll to the updated row
    setTimeout(() => {
      const el = document.getElementById(`row-${updatedLecture.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Reset to initial sample timetable
  const handleResetTimetable = () => {
    if (window.confirm('Reset timetable back to original sample schedule?')) {
      setTimetable(INITIAL_TIMETABLE);
      localStorage.removeItem(STORAGE_KEY);
      setRepairResult(null);
      setRecentlyRepairedId(null);
      setNotification({
        type: 'info',
        message: 'Timetable reset to baseline sample data.',
      });
    }
  };

  // Filtered timetable for viewing
  const filteredTimetable = useMemo(() => {
    return timetable.filter((item) => {
      const matchesDivision =
        selectedDivisionFilter === 'ALL' || item.division === selectedDivisionFilter;
      const matchesSearch =
        searchQuery === '' ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDivision && matchesSearch;
    });
  }, [timetable, selectedDivisionFilter, searchQuery]);

  // Selected lecture object for details preview in form
  const activeSelectedLecture = timetable.find((l) => l.id === selectedLectureId);

  return (
    <div className="space-y-8">
      {/* Top Banner Alert (if any) */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs uppercase tracking-wider font-semibold opacity-70 hover:opacity-100 ml-4 px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Disruption Selection Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Report Emergency Disruption
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure unexpected absence or facility failure
              </p>
            </div>
          </div>

          {/* Quick Demo Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Demo Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPresetScenario('priya_absence')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs text-slate-700 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold block text-slate-900 group-hover:text-blue-600">
                    Prof. Verma Sick Leave
                  </span>
                  <span className="text-[11px] text-slate-500">Div A (10:00 AM)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => applyPresetScenario('room301_failure')}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-xs text-slate-700 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold block text-slate-900 group-hover:text-blue-600">
                    Room 301 Breakdown
                  </span>
                  <span className="text-[11px] text-slate-500">Projector / AC Fault</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Disruption Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              1. Disruption Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDisruptionType('FACULTY')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  disruptionType === 'FACULTY'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    disruptionType === 'FACULTY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Faculty Absence</div>
                  <div className="text-xs text-slate-500">Educator unavailable</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDisruptionType('ROOM')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  disruptionType === 'ROOM'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    disruptionType === 'ROOM'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Room Offline</div>
                  <div className="text-xs text-slate-500">Hall unavailable</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Entity Selection */}
          {disruptionType === 'FACULTY' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                  2. Select Affected Faculty Member
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {FACULTY_MEMBERS.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name} — {fac.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Repair Strategy Preference for Faculty */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Resolution Strategy Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRepairStrategy('auto')}
                    className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      repairStrategy === 'auto'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Smart Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepairStrategy('substitute')}
                    className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      repairStrategy === 'substitute'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Substitute
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepairStrategy('reschedule')}
                    className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      repairStrategy === 'reschedule'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                2. Select Offline Room / Lab
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {ROOMS.map((rm) => (
                  <option key={rm.id} value={rm.name}>
                    {rm.name} ({rm.type}) — Cap: {rm.capacity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Select Specific Lecture to Reschedule */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              3. Affected Lecture to Reschedule
            </label>
            {availableLecturesForSelection.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                No lectures currently scheduled for this selection today.
              </div>
            ) : (
              <select
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {availableLecturesForSelection.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.time} | {lec.subject} ({lec.division}) [{lec.room}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Preview of Selected Lecture */}
          {activeSelectedLecture && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Selected Class Details:</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Needs Attention
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">SUBJECT:</span>
                  <span className="font-medium text-slate-900">{activeSelectedLecture.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DIVISION:</span>
                  <span className="font-medium text-slate-900">{activeSelectedLecture.division}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TIME:</span>
                  <span className="font-medium text-slate-900">{activeSelectedLecture.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ROOM:</span>
                  <span className="font-medium text-slate-900">{activeSelectedLecture.room}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button: Repair Timetable */}
          <button
            type="button"
            onClick={handleRepairTimetable}
            disabled={!selectedLectureId || isCalculating}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Scanning Free Slots & Conflict Matrix...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-blue-200" />
                Repair Timetable
              </>
            )}
          </button>
        </div>

        {/* Right Column: Intelligent Solution & Side-by-Side Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Repair Analysis & Conflict-Free Resolution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validates faculty, room, and student division constraints
                </p>
              </div>

              {repairResult && repairResult.success && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  0 Conflicts Detected
                </span>
              )}
            </div>

            {/* Content Area: Empty State or Results */}
            {!repairResult ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-auto">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Ready for Timetable Repair</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  Select a disruption scenario on the left and click{' '}
                  <span className="font-semibold text-blue-600">"Repair Timetable"</span> to calculate a
                  conflict-free alternative.
                </p>
                <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Division Clashes Checked
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Room Occupancy Checked
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Faculty Availability Checked
                  </span>
                </div>
              </div>
            ) : repairResult.success ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Success Header Message */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      Optimal Conflict-Free Alternative Found!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      {repairResult.explanation}
                    </p>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Side-by-Side Comparison</span>
                    <span className="text-[11px] text-blue-600 font-normal">
                      Changes highlighted in green
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Left: Original Lecture */}
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 relative shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Original (Disrupted)
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {repairResult.originalLecture.subjectCode}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-2.5">
                        {repairResult.originalLecture.subject}
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Division:</span>
                          <span className="font-semibold text-slate-800">
                            {repairResult.originalLecture.division}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Time Slot:</span>
                          <span className="font-semibold text-slate-800">
                            {repairResult.originalLecture.time}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 ${
                            disruptionType === 'FACULTY'
                              ? 'text-rose-700 font-bold bg-rose-100/70 p-1 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Faculty:</span>
                          <span>{repairResult.originalLecture.faculty}</span>
                        </div>

                        <div
                          className={`flex items-center gap-2 ${
                            disruptionType === 'ROOM'
                              ? 'text-rose-700 font-bold bg-rose-100/70 p-1 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Room:</span>
                          <span>{repairResult.originalLecture.room}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Repaired Lecture */}
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/30 relative shadow-sm ring-1 ring-emerald-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Proposed Repair
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {repairResult.proposedLecture.subjectCode}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-2.5">
                        {repairResult.proposedLecture.subject}
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Division:</span>
                          <span className="font-semibold text-slate-800">
                            {repairResult.proposedLecture.division}
                          </span>
                        </div>

                        {/* Highlight Time if changed */}
                        <div
                          className={`flex items-center gap-2 ${
                            repairResult.proposedLecture.time !== repairResult.originalLecture.time
                              ? 'text-emerald-800 font-bold bg-emerald-100/80 p-1 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Time Slot:</span>
                          <span>{repairResult.proposedLecture.time}</span>
                          {repairResult.proposedLecture.time !==
                            repairResult.originalLecture.time && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 rounded ml-auto">
                              Rescheduled
                            </span>
                          )}
                        </div>

                        {/* Highlight Faculty if changed */}
                        <div
                          className={`flex items-center gap-2 ${
                            repairResult.proposedLecture.faculty !==
                            repairResult.originalLecture.faculty
                              ? 'text-emerald-800 font-bold bg-emerald-100/80 p-1 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Faculty:</span>
                          <span>{repairResult.proposedLecture.faculty}</span>
                          {repairResult.proposedLecture.faculty !==
                            repairResult.originalLecture.faculty && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 rounded ml-auto">
                              Substitute
                            </span>
                          )}
                        </div>

                        {/* Highlight Room if changed */}
                        <div
                          className={`flex items-center gap-2 ${
                            repairResult.proposedLecture.room !== repairResult.originalLecture.room
                              ? 'text-emerald-800 font-bold bg-emerald-100/80 p-1 rounded'
                              : 'text-slate-600'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Room:</span>
                          <span>{repairResult.proposedLecture.room}</span>
                          {repairResult.proposedLecture.room !==
                            repairResult.originalLecture.room && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 rounded ml-auto">
                              Relocated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conflict Prevention Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Conflict Prevention Verification:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {repairResult.validationChecks.map((chk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">{chk.label}</div>
                          <div className="text-[11px] text-slate-500 leading-tight">
                            {chk.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Failure state with clear explanation */
              <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Repair Blocked: No Conflict-Free Option Found
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {repairResult.explanation}
                </p>
                <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-rose-200">
                  <span className="font-semibold">Next Administrative Action:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                    <li>Try changing strategy from Substitute to Reschedule or vice-versa.</li>
                    <li>Verify whether other divisions can swap lecture hours.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          {repairResult && repairResult.success && (
            <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
              <button
                type="button"
                onClick={() => setRepairResult(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Discard Staged Repair
              </button>

              <button
                type="button"
                onClick={handleConfirmRepair}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirm Repair & Apply to Timetable
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Timetable View Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Table Controls & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Live College Timetable (Monday)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any lecture row to quickly stage it for emergency repair
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Division Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs">
              <button
                type="button"
                onClick={() => setSelectedDivisionFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedDivisionFilter === 'ALL'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Divisions
              </button>
              {DIVISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDivisionFilter(d.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedDivisionFilter === d.id
                      ? 'bg-white text-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetTimetable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              title="Reset all confirmed repairs to default sample state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Timetable
            </button>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4">Classroom</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTimetable.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No lectures match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTimetable.map((lec) => {
                  const isRepaired = lec.status === 'repaired';
                  const isRecentlyRepaired = lec.id === recentlyRepairedId;
                  const isSelectedInForm = lec.id === selectedLectureId;

                  return (
                    <tr
                      id={`row-${lec.id}`}
                      key={lec.id}
                      onClick={() => {
                        setSelectedLectureId(lec.id);
                        if (disruptionType === 'FACULTY') {
                          setSelectedFaculty(lec.faculty);
                        } else {
                          setSelectedRoom(lec.room);
                        }
                      }}
                      className={`transition-all duration-150 cursor-pointer ${
                        isSelectedInForm
                          ? 'bg-blue-50/70 hover:bg-blue-50'
                          : isRecentlyRepaired
                          ? 'bg-emerald-50/60 hover:bg-emerald-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Time Slot */}
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lec.time}</span>
                        </div>
                      </td>

                      {/* Division */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-700">
                          {lec.division}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{lec.subject}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {lec.subjectCode}
                        </div>
                      </td>

                      {/* Faculty */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lec.faculty}</span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lec.room}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isRepaired ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                            title={lec.repairHistory?.action || 'Repaired'}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Repaired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLectureId(lec.id);
                            if (disruptionType === 'FACULTY') {
                              setSelectedFaculty(lec.faculty);
                            } else {
                              setSelectedRoom(lec.room);
                            }
                          }}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                            isSelectedInForm
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 hover:bg-white'
                          }`}
                        >
                          {isSelectedInForm ? 'Selected' : 'Repair'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Timetable Legend & Helper Note */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              Scheduled Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Repaired & Conflict-Free
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Selected in Form
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Confirmed timetable repairs automatically persist in your browser (localStorage).
          </div>
        </div>
      </div>
    </div>
  );
}
