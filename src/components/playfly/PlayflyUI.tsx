import { useEffect, useMemo, useRef, useState, type ReactNode, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const PlayflyTheme = {
  colors: {
    primary: '#1770C0',
    secondary: '#3B9FD9',
    ink: '#0B1220',
    slate: '#5B6B7E',
    surface: 'rgba(255, 255, 255, 0.72)',
    surfaceStrong: 'rgba(255, 255, 255, 0.86)',
    border: 'rgba(15, 23, 42, 0.12)',
    glow: 'rgba(23, 112, 192, 0.25)'
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '22px',
    xl: '28px'
  },
  shadow: {
    soft: '0 14px 40px rgba(15, 23, 42, 0.12)',
    lift: '0 24px 60px rgba(15, 23, 42, 0.18)'
  },
  typography: {
    display: "'Avenir Next', 'Avenir', 'Helvetica Neue', 'Segoe UI', sans-serif",
    body: "'Inter', 'Avenir Next', 'Helvetica Neue', 'Segoe UI', sans-serif"
  }
};

export function GlassCard({
  children,
  className,
  hover = true,
  as: As = 'div',
  onClick,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
} & HTMLAttributes<HTMLElement>) {
  return (
    <As
      onClick={onClick}
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className || ''}`}
      {...rest}
    >
      {children}
    </As>
  );
}

export function GlassPill({
  children,
  active,
  onClick,
  className,
  ...rest
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={`glass-pill ${active ? 'glass-pill-active' : ''} ${className || ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function StatChip({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`stat-chip ${className || ''}`}>
      {children}
    </span>
  );
}

export function CommandBar({
  left,
  center,
  right,
  className
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`command-bar ${className || ''}`}>
      <div className="command-bar-left">{left}</div>
      <div className="command-bar-center">{center}</div>
      <div className="command-bar-right">{right}</div>
    </div>
  );
}

export function Sparkline({
  values,
  color = '#1770C0'
}: {
  values: number[];
  color?: string;
}) {
  const points = useMemo(() => {
    if (!values.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1 || 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values]);

  return (
    <svg viewBox="0 0 100 100" className="sparkline" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polyline
        fill="none"
        stroke="rgba(23,112,192,0.2)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) {
      setDisplay(value);
      return;
    }

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        doneRef.current = true;
      }
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, duration]);

  return display;
}

export function MetricCard({
  title,
  value,
  subtitle,
  accent,
  sparkline,
  icon,
  format,
  meta
}: {
  title: string;
  value: number;
  subtitle?: string;
  accent?: string;
  sparkline?: number[];
  icon?: ReactNode;
  format?: (value: number) => string;
  meta?: ReactNode;
}) {
  const displayValue = useCountUp(value);
  return (
    <GlassCard className="metric-card">
      <div className="metric-card-top">
        <div>
          <div className="metric-card-title">{title}</div>
          <div className="metric-card-value" style={{ color: accent }}>
            {format ? format(displayValue) : displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
        </div>
        {icon && <div className="metric-card-icon">{icon}</div>}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="metric-card-sparkline">
          <Sparkline values={sparkline} color={accent} />
        </div>
      )}
      {meta && <div className="metric-card-meta">{meta}</div>}
    </GlassCard>
  );
}

export function DrawerPanel({
  open,
  onClose,
  title,
  children,
  side = 'right'
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'right' | 'bottom';
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`drawer-panel drawer-${side}`}
            initial={{ x: side === 'right' ? '100%' : 0, y: side === 'bottom' ? '100%' : 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: side === 'right' ? '100%' : 0, y: side === 'bottom' ? '100%' : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="drawer-header">
              <div className="drawer-title">{title}</div>
              <button className="drawer-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TabTransition({
  children,
  tabKey
}: {
  children: ReactNode;
  tabKey: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PremiumTable({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`premium-table ${className || ''}`}>{children}</div>;
}

export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="skeleton-line" />
      ))}
    </div>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const handler = () => setReduced(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useReducedTransparency() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-transparency: reduce)');
    setReduced(media.matches);
    const handler = () => setReduced(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return reduced;
}
