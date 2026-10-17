import React from 'react';
import { Leaf, Sprout, Trees, Sun, Sparkles, Flower2 } from 'lucide-react';

interface BulbasaurNatureHeroProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showBulbasaurPills?: boolean;
}

export const BulbasaurNatureHero: React.FC<BulbasaurNatureHeroProps> = ({
  title = "SamaySetu · Bulbasaur Edition",
  subtitle = "Optimized academic timetable orchestration powered by nature-inspired efficiency.",
  badgeText = "TWIST 1: BULBASAUR THEME",
  showBulbasaurPills = true,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#A7F3D0] shadow-sm mb-6 bg-gradient-to-r from-[#126652] via-[#198268] to-[#259E81] text-white">
      {/* Decorative SVG Nature Scenery (Hills, Trees, Foliage, Sunlight) */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <svg
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          viewBox="0 0 1200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Distant Hills */}
          <path
            d="M0 160 C300 90, 600 180, 1200 110 L1200 240 L0 240 Z"
            fill="#38A3A5"
            fillOpacity="0.5"
          />
          {/* Midground Hills */}
          <path
            d="M0 180 C240 120, 720 220, 1200 150 L1200 240 L0 240 Z"
            fill="#57CC99"
            fillOpacity="0.4"
          />
          {/* Foreground Foliage Mound */}
          <path
            d="M0 200 C360 170, 840 230, 1200 190 L1200 240 L0 240 Z"
            fill="#80ED99"
            fillOpacity="0.3"
          />
          {/* Subtle Sun Glow */}
          <circle cx="1080" cy="50" r="45" fill="#FEF08A" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Floating Botanical Leaf Accents */}
      <div className="absolute top-2 right-12 text-[#80ED99]/40 pointer-events-none animate-pulse">
        <Leaf className="w-10 h-10 rotate-12" />
      </div>
      <div className="absolute bottom-2 right-48 text-[#57CC99]/30 pointer-events-none">
        <Sprout className="w-8 h-8 -rotate-12" />
      </div>
      <div className="absolute top-3 right-80 text-[#80ED99]/20 pointer-events-none hidden md:block">
        <Trees className="w-12 h-12" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* Twist 1 Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#80ED99] text-[#0A2620] shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-[#0A2620]" />
              <span>{badgeText}</span>
            </span>

            {/* Bulbasaur Pokédex Tag */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-[#D1FAE5] backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-[#FDE047]" />
              <span>Seed Pokémon #001</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FB7185]/20 text-[#FFE4E6] border border-[#FB7185]/30">
              <Flower2 className="w-3 h-3 text-[#FB7185]" />
              <span>Bulb Flower Blooming</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-xs">
            <span>{title}</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#D1FAE5]/90 leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>

        {/* Right Info Chips: Clean Nature Vibe */}
        {showBulbasaurPills && (
          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/15">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#80ED99] animate-ping" />
              <span>Nature Mode: Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-[#A7F3D0]">
              <Sun className="w-3 h-3 text-[#FDE047]" />
              <span>Solar Powered Clashing Matrix</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
