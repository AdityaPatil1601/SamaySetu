import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  School,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User } from '../../types';

export const LoginView: React.FC = () => {
  const { login, availableUsers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-teacher-sharma');

  // Strict Hackathon Palette: Forest Green (#244B3B), Terracotta (#C66A4A), Soft Sand (#E2D5B8), Warm Ivory (#F6F1E8)
  const roleMeta = {
    admin: {
      title: 'Administrator',
      roleBadge: 'Administration & Solver Governance',
      icon: ShieldCheck,
      description: 'Institutional timetable generator, room and lab allocation, conflict diagnostics, emergency repairs, and workload reports.',
      demoUsers: availableUsers.filter(u => u.role === 'admin'),
    },
    teacher: {
      title: 'Faculty / Teacher',
      roleBadge: 'Instruction & Compensatory Scheduling',
      icon: GraduationCap,
      description: 'Personalized weekly schedule, "Schedule a Class" for compensatory lectures, peer proxy requests, and slot preference matrix.',
      demoUsers: availableUsers.filter(u => u.role === 'teacher'),
    },
    student: {
      title: 'Student Portal',
      roleBadge: 'Class Schedule & Facilities',
      icon: BookOpen,
      description: 'Division weekly timetable, practical batch filter, real-time vacant classroom & lab locator, and faculty cabin directory.',
      demoUsers: availableUsers.filter(u => u.role === 'student'),
    },
  };

  const currentMeta = roleMeta[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const firstUser = roleMeta[role].demoUsers[0];
    if (firstUser) {
      setSelectedUserId(firstUser.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, selectedUserId);
  };

  const selectedUserObj = availableUsers.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-[#F6F1E8] flex items-center justify-center p-4 sm:p-6 text-[#22252A] font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden shadow-md border border-[#E2D5B8] bg-white">
        
        {/* Left Side: Institutional Context (Forest Green background) */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-[#244B3B] text-white flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E2D5B8] text-[#244B3B] flex items-center justify-center font-extrabold text-base shadow-sm">
                SS
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">SamaySetu</h1>
                <p className="text-xs text-[#E2D5B8]/90">Institutional Timetable Orchestrator</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A372B] border border-[#2D5E4A] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E2D5B8]">
                Sardar Patel Institute of Technology
              </div>
              <p className="text-xs text-[#F6F1E8]/90 leading-relaxed">
                Coordinated multi-department timetable orchestrator managing Computer, IT, Electronics, and Mechanical divisions with deterministic conflict verification.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#F6F1E8]/90">
                <CheckCircle2 className="w-4 h-4 text-[#E2D5B8] shrink-0 mt-0.5" />
                <span>Deterministic constraint-based core (zero room & teacher clashes)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#F6F1E8]/90">
                <CheckCircle2 className="w-4 h-4 text-[#E2D5B8] shrink-0 mt-0.5" />
                <span>Faculty <strong>"Schedule a Class"</strong> compensatory lecture manager</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#F6F1E8]/90">
                <CheckCircle2 className="w-4 h-4 text-[#E2D5B8] shrink-0 mt-0.5" />
                <span>Peer proxy coverage & automated substitution detection</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2D5E4A] text-[11px] text-[#E2D5B8]/80 flex items-center justify-between">
            <span>Academic Term 2026-27</span>
            <span className="font-mono font-bold text-[#E2D5B8]">Verified Matrix</span>
          </div>
        </div>

        {/* Right Side: Role Selector & Direct User Access */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#22252A] tracking-tight">
                Sign In to Academic Workspace
              </h2>
              <p className="text-xs text-[#535965] mt-1">
                Select your institutional role and profile to enter the portal.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-[#F6F1E8] rounded-xl border border-[#E2D5B8]">
              {(['admin', 'teacher', 'student'] as UserRole[]).map(roleKey => {
                const meta = roleMeta[roleKey];
                const Icon = meta.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#244B3B] text-white shadow-xs'
                        : 'text-[#535965] hover:text-[#22252A] hover:bg-[#E2D5B8]/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E2D5B8]' : 'text-[#244B3B]'}`} />
                    <span>{meta.title.split('/')[0].trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Description Card */}
            <div className="mb-5 p-3.5 rounded-xl bg-[#F6F1E8] border border-[#E2D5B8] text-xs">
              <div className="font-bold text-[#244B3B] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C66A4A]" />
                <span>{currentMeta.roleBadge}</span>
              </div>
              <p className="text-[#535965] text-[11px] mt-1 leading-relaxed">
                {currentMeta.description}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#22252A] mb-1.5">
                  Select {currentMeta.title} Profile ({currentMeta.demoUsers.length} available)
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-[#D8CEBA] rounded-xl bg-white text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#244B3B] focus:border-[#244B3B]"
                >
                  {currentMeta.demoUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.department || user.rollNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserObj && (
                <div className="p-3 bg-[#F6F1E8] border border-[#E2D5B8] rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#22252A]">{selectedUserObj.name}</div>
                    <div className="text-[11px] text-[#535965]">{selectedUserObj.email}</div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white text-[#244B3B] font-bold border border-[#E2D5B8]">
                    {selectedUserObj.department || selectedUserObj.rollNumber}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#244B3B] hover:bg-[#1A372B] active:bg-[#1A372B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Enter as {selectedUserObj?.name || currentMeta.title}</span>
                <ArrowRight className="w-4 h-4 text-[#E2D5B8]" />
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-[#535965]">
              Institutional Timetable Orchestration Suite · SPIT
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
