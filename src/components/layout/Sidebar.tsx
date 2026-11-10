import { memo } from 'react';
import {
  LayoutDashboard,
  Box,
  ScanEye,
  Crosshair,
  ServerCrash,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type NavPageId =
  | 'overview'
  | 'digital-twin'
  | 'detection'
  | 'localization'
  | 'monitoring'
  | 'about'
  | 'annotation-studio';

interface NavItem {
  id: NavPageId;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'digital-twin', label: 'Digital Twin', icon: Box, badge: '3D' },
  { id: 'detection', label: 'Instrument Detection', icon: ScanEye, badge: 'YOLO' },
  { id: 'localization', label: 'Localization', icon: Crosshair },
  { id: 'monitoring', label: 'System Monitoring', icon: ServerCrash },
  { id: 'annotation-studio', label: 'CVAT AI Studio', icon: Sparkles, badge: 'AUTO' },
  { id: 'about', label: 'About Project', icon: Info }
];

interface SidebarProps {
  activePage: NavPageId;
  onNavigate: (page: NavPageId) => void;
  detectedCount: number;
}

export const Sidebar = memo(function Sidebar({
  activePage,
  onNavigate,
  detectedCount
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col flex-shrink-0">
      {/* Navigation principale */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          Supervision Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="font-semibold">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.id === 'digital-twin' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {detectedCount}/8
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition opacity-0 group-hover:opacity-100 ${
                    isActive ? 'opacity-100 text-cyan-400' : 'text-slate-600'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Cartouche d'informations système académique */}
      <div className="mt-auto p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] font-mono text-slate-400 space-y-1.5">
        <div className="text-[10px] text-slate-500 uppercase font-semibold">
          Spécifications Cible
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Modèle IA :</span>
          <span className="text-cyan-400 font-bold">YOLO26s-seg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Classes actives :</span>
          <span className="text-white font-bold">8 classes</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Moteur 3D :</span>
          <span className="text-slate-300">Three.js / R3F</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Format Pose :</span>
          <span className="text-slate-300">XYZ + Yaw (cm/mm)</span>
        </div>
        <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400">
          Projet <strong className="text-slate-300">HUMA-LOG</strong> — Soutenance Univ.
        </div>
      </div>
    </aside>
  );
});

