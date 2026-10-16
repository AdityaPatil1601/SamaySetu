import React, { useMemo, useState } from 'react';
import {
  Building,
  GraduationCap,
  Clock,
  Mail,
  Phone,
  DoorOpen,
  Search,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';
import {
  Student,
  Faculty,
  Subject,
  ScheduleVersion,
  CollegeSettings,
  Division,
  DayOfWeek,
} from '../../types';

interface StudentFacultyDirectoryViewProps {
  currentStudent: Student;
  allFaculty: Faculty[];
  subjects: Subject[];
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
  divisions: Division[];
}

export const StudentFacultyDirectoryView: React.FC<StudentFacultyDirectoryViewProps> = ({
  currentStudent,
  allFaculty,
  subjects,
  activeVersion,
  settings,
  divisions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find subjects for current student's division
  const classSubjects = useMemo(() => {
    return subjects.filter(s => s.divisionIds.includes(currentStudent.divisionId));
  }, [subjects, currentStudent.divisionId]);

  // Find faculty teaching this class or department
  const classFacultyIds = useMemo(() => {
    const ids = new Set<string>();
    if (activeVersion) {
      activeVersion.assignments
        .filter(a => a.divisionId === currentStudent.divisionId)
        .forEach(a => ids.add(a.facultyId));
    }
    classSubjects.forEach(s => s.eligibleFacultyIds.forEach(id => ids.add(id)));
    return Array.from(ids);
  }, [activeVersion, currentStudent.divisionId, classSubjects]);

  const displayFaculty = useMemo(() => {
    let list = allFaculty.filter(f => f.active);

    // If searching, search across all faculty
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q) ||
          (f.cabin && f.cabin.toLowerCase().includes(q)) ||
          f.qualifiedSubjectCodes.some(c => c.toLowerCase().includes(q))
      );
    }

    // Default: prioritize class faculty, then others
    const myTeachers = list.filter(f => classFacultyIds.includes(f.id));
    const otherTeachers = list.filter(f => !classFacultyIds.includes(f.id));
    return [...myTeachers, ...otherTeachers];
  }, [allFaculty, classFacultyIds, searchQuery]);

  // Helper to find when a faculty has a free period
  const getFacultyFreeSlots = (facultyId: string) => {
    if (!activeVersion) return [];
    const busySlots = new Set<string>();

    activeVersion.assignments
      .filter(a => a.facultyId === facultyId)
      .forEach(a => {
        for (let i = 0; i < a.durationSlots; i++) {
          busySlots.add(`${a.day}-${a.startSlotIndex + i}`);
        }
      });

    const freeList: { day: DayOfWeek; timeLabel: string }[] = [];
    for (const day of settings.workingDays.slice(0, 5)) {
      for (const slot of settings.slots) {
        if (!busySlots.has(`${day}-${slot.slotIndex}`)) {
          freeList.push({ day, timeLabel: `Period ${slot.slotIndex + 1} (${slot.startTime})` });
          break;
        }
      }
      if (freeList.length >= 3) break;
    }
    return freeList;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Campus Faculty Directory</span>
            <span aria-hidden="true">·</span>
            <span>Academic Consultation & Cabin Finder</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Faculty Directory & Consultation Hours
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            View cabin locations and verified free consultation slots for faculty teaching your semester courses.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teacher, subject, or cabin..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayFaculty.map(fac => {
          const freeOfficeHours = getFacultyFreeSlots(fac.id);
          const isMyTeacher = classFacultyIds.includes(fac.id);
          const taughtSubjects = classSubjects.filter(s => s.eligibleFacultyIds.includes(fac.id));

          return (
            <div
              key={fac.id}
              className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {fac.name}
                      </h3>
                      {isMyTeacher && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Your Faculty
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {fac.department}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {fac.employeeId}
                  </span>
                </div>

                {/* Cabin and contact */}
                <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{fac.cabin || 'Cabin CS-301, Faculty Block'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.email || `${fac.id}@samaysetu.edu`}</span>
                  </div>
                  {fac.phone && (
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{fac.phone}</span>
                    </div>
                  )}
                </div>

                {/* Subjects Taught */}
                {taughtSubjects.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                      Courses Taught to Your Class
                    </div>
                    <div className="space-y-1">
                      {taughtSubjects.map(sub => (
                        <div key={sub.id} className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-emerald-600" />
                          <span>{sub.name} ({sub.code})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Free Periods from Timetable */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Consultation Slots</span>
                </div>
                <div className="space-y-1">
                  {freeOfficeHours.map((slot, idx) => (
                    <div key={idx} className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{slot.day}</span>
                      <span className="font-mono text-slate-500">{slot.timeLabel}</span>
                    </div>
                  ))}
                  {freeOfficeHours.length === 0 && (
                    <div className="text-[11px] text-slate-400">Available by appointment</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
