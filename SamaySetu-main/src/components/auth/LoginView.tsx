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
  Leaf,
  Sprout,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User } from '../../types';
import bulbaBg from '../../assets/bulbasaur-bg.jpg';

export const LoginView: React.FC = () => {
  const { login, availableUsers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-teacher-sharma');

  // Bulbasaur Nature Theme Palette: Jungle Teal, Leaf Mint, Flower Coral, Mint Dew
  const roleMeta = {
    admin: {
      title: 'Administrator',
      roleBadge: '🌿 Administration & Solver Sanctuary',
      icon: ShieldCheck,
      description: 'Institutional timetable generator, room and lab allocation, conflict diagnostics, emergency repairs, and workload reports.',
      demoUsers: availableUsers.filter(u => u.role === 'admin'),
    },
    teacher: {
      title: 'Faculty / Teacher',
      roleBadge: '🍃 Faculty Instruction & Canopy',
      icon: GraduationCap,
      description: 'Personalized weekly schedule, "Schedule a Class" for compensatory lectures, peer proxy requests, and slot preference matrix.',
      demoUsers: availableUsers.filter(u => u.role === 'teacher'),
    },
    student: {
      title: 'Student Portal',
      roleBadge: '🌱 Student Grove & Schedules',
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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 text-[#143D32] font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(240, 253, 244, 0.38), rgba(232, 249, 239, 0.48)), url(${bulbaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-[#A7F3D0] bg-white/95 backdrop-blur-md">
        
        {/* Left Side: Bulbasaur Nature Hero Context */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-[#0D2F27] via-[#133E35] to-[#164E43] text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Decorative ambient leaf pattern */}
          <div className="absolute top-2 right-4 text-[#80ED99]/15 pointer-events-none">
            <Leaf className="w-28 h-28 rotate-12" />
          </div>
          <div className="absolute bottom-4 left-2 text-[#57CC99]/15 pointer-events-none">
            <Sprout className="w-24 h-24 -rotate-12" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center font-black text-lg shadow-md border border-[#80ED99]/50">
                🌿
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white">SamaySetu</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#80ED99] text-[#0A2620]">#001</span>
                </div>
                <p className="text-xs text-[#A7F3D0]">Bulbasaur Nature Edition</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A2620]/60 border border-[#2A9D8F]/30 backdrop-blur-xs space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#80ED99] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
                <span>Twist 1: Bulbasaur Theme</span>
              </div>
              <p className="text-xs text-[#D1FAE5]/90 leading-relaxed font-normal">
                Shree L.R. Tiwari College of Engineering's timetable orchestrator styled with fresh nature palettes, botanical motifs, and clean plant aesthetics.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-[#D1FAE5]">
                <Leaf className="w-4 h-4 text-[#80ED99] shrink-0 mt-0.5" />
                <span>Deterministic constraint-based engine (zero clashes)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#D1FAE5]">
                <Leaf className="w-4 h-4 text-[#80ED99] shrink-0 mt-0.5" />
                <span>Faculty <strong>"Schedule a Class"</strong> compensatory lecture manager</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#D1FAE5]">
                <Leaf className="w-4 h-4 text-[#80ED99] shrink-0 mt-0.5" />
                <span>Peer proxy coverage & automated substitution detection</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1F5448] text-[11px] text-[#A7F3D0]/80 flex items-center justify-between relative z-10">
            <span>Academic Term 2026-27</span>
            <span className="font-mono font-bold text-[#80ED99]">🍃 Verified Matrix</span>
          </div>
        </div>

        {/* Right Side: Role Selector & Direct User Access */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0]">
                  Nature Inspired Clean UI
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#133E35] tracking-tight">
                Sign In to Academic Workspace
              </h2>
              <p className="text-xs text-[#3D6456] mt-1">
                Select your institutional role and profile to enter the portal.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-[#F0F9F5] rounded-2xl border border-[#CCE8DD]">
              {(['admin', 'teacher', 'student'] as UserRole[]).map(roleKey => {
                const meta = roleMeta[roleKey];
                const Icon = meta.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-sm'
                        : 'text-[#3D6456] hover:text-[#133E35] hover:bg-[#CCE8DD]/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#059669]'}`} />
                    <span>{meta.title.split('/')[0].trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Description Card */}
            <div className="mb-5 p-3.5 rounded-2xl bg-[#F0F9F5] border border-[#CCE8DD] text-xs">
              <div className="font-bold text-[#133E35] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>{currentMeta.roleBadge}</span>
              </div>
              <p className="text-[#3D6456] text-[11px] mt-1 leading-relaxed">
                {currentMeta.description}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#132A22] mb-1.5">
                  Select {currentMeta.title} Profile ({currentMeta.demoUsers.length} available)
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-[#CCE8DD] rounded-xl bg-white text-[#132A22] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                >
                  {currentMeta.demoUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.department || user.rollNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserObj && (
                <div className="p-3 bg-[#F0F9F5] border border-[#CCE8DD] rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#132A22]">{selectedUserObj.name}</div>
                    <div className="text-[11px] text-[#3D6456]">{selectedUserObj.email}</div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white text-[#059669] font-bold border border-[#CCE8DD]">
                    {selectedUserObj.department || selectedUserObj.rollNumber}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Enter as {selectedUserObj?.name || currentMeta.title}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-[#3D6456] flex items-center justify-center gap-1.5">
              <span>🌿 Bulbasaur Theme</span>
              <span>·</span>
              <span>Sardar Patel Institute of Technology</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
