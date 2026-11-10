/**
 * Utilitaires pour la gestion des couleurs d'instruments et du thème UI
 */

export function hexToRgba(hex: string, alpha: number = 1): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getStatusBadgeColor(status: 'detected' | 'tracking' | 'occluded' | 'lost'): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case 'detected':
      return {
        bg: 'bg-emerald-950/70',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        label: 'DÉTECTÉ'
      };
    case 'tracking':
      return {
        bg: 'bg-cyan-950/70',
        text: 'text-cyan-400',
        border: 'border-cyan-500/40',
        label: 'SUIVI'
      };
    case 'occluded':
      return {
        bg: 'bg-amber-950/70',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        label: 'OCCULTÉ'
      };
    case 'lost':
    default:
      return {
        bg: 'bg-rose-950/70',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        label: 'PERDU'
      };
  }
}

