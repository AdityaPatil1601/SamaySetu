import React from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';
import EmergencyTimetableRepair from './components/EmergencyTimetableRepair';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  SamaySetu
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full">
                  Emergency Repair
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Smart College Timetable Management System
              </p>
            </div>
          </div>

          {/* Right Header Status Badges */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Dept of Computer Science & IT</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Conflict Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Hero Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Automated Rescheduling & Conflict Prevention
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Emergency Timetable Repair
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1.5 leading-relaxed">
            Resolve unexpected faculty absences and room maintenance disruptions instantly.
            The intelligent engine locates zero-conflict substitute educators or alternative slots
            while ensuring division, room, and faculty schedules never collide.
          </p>
        </div>

        {/* Feature Component */}
        <EmergencyTimetableRepair />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <span className="font-semibold text-slate-700">SamaySetu</span> — Smart College Timetable Management System Prototype
          </div>
          <div className="flex items-center gap-3">
            <span>Room • Division • Faculty Conflict Validation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
