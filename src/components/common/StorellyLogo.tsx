import React from 'react';
import { getAppLogo } from '../../utils/branding';

interface StorellyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'text-only';
  badge?: string;
  className?: string;
  onClick?: () => void;
  logoUrl?: string;
}

export const StorellyLogo: React.FC<StorellyLogoProps> = ({
  size = 'md',
  variant = 'full',
  badge,
  className = '',
  onClick,
  logoUrl,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Size dimensions for icon mark
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', badge: 'text-[8px] px-1 py-0.2' },
    sm: { icon: 'w-7 h-7', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
    xl: { icon: 'w-14 h-14', text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
  };

  const dims = sizeMap[size] || sizeMap.md;

  const activeLogoUrl = logoUrl || getAppLogo();

  // Custom Image rendering if provided and not errored
  const showCustomImg = activeLogoUrl && !imgError && activeLogoUrl.trim().length > 0;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {variant !== 'text-only' && (
        <div
          className={`${dims.icon} rounded-xl bg-slate-900 border border-emerald-500/30 overflow-hidden shrink-0 flex items-center justify-center shadow-sm shadow-emerald-950/20 transition-transform ${
            onClick ? 'group-hover:scale-105' : ''
          }`}
        >
          {showCustomImg ? (
            <img
              src={activeLogoUrl}
              alt="Storelly Logo"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              viewBox="0 0 512 512"
              className="w-full h-full p-1"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Storelly Icon Mark"
            >
              <defs>
                <linearGradient id="st_grad_m" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="112" fill="#0f172a" />
              <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="#10b981" strokeWidth="8" strokeOpacity="0.3" />
              <g transform="translate(106, 116)">
                <path d="M150 18 L278 84 C286 88 288 98 284 106 L270 134 C266 142 256 146 248 142 L150 92 L52 142 C44 146 34 142 30 134 L16 106 C12 98 14 88 22 84 Z" fill="url(#st_grad_m)" />
                <path d="M44 150 L84 150 L84 250 L44 250 Z" fill="#ffffff" fillOpacity="0.95" rx="6" />
                <path d="M130 150 L170 150 L170 250 L130 250 Z" fill="#ffffff" fillOpacity="0.95" rx="6" />
                <path d="M216 150 L256 150 L256 250 L216 250 Z" fill="#ffffff" fillOpacity="0.95" rx="6" />
                <rect x="24" y="254" width="252" height="24" rx="8" fill="url(#st_grad_m)" />
                <path d="M250 20 L256 36 L272 42 L256 48 L250 64 L244 48 L228 42 L244 36 Z" fill="#34d399" />
              </g>
            </svg>
          )}
        </div>
      )}

      {variant !== 'mark-only' && (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`font-heading font-black tracking-tight text-[var(--t1)] ${dims.text}`}>
            Storelly<span className="text-emerald-500">.</span>
          </span>
          {badge && (
            <span className={`font-bold uppercase tracking-wider rounded-md border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 ${dims.badge}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StorellyLogo;
