import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  subtitle?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  subtitle,
  accentColor = '#6366f1',
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: accentColor,
          opacity: 0.12,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${accentColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        {badge && (
          <span className={`badge badge-${badgeType}`} style={{ fontSize: 10 }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
