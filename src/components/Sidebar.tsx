'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Megaphone,
  ShieldCheck,
  Activity,
  LogOut,
  Sparkles,
  Tag,
  Compass,
  MessageSquare,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Genel Bakış', href: '/', icon: LayoutDashboard },
    { label: 'Kullanıcılar', href: '/users', icon: Users },
    { label: 'Kampanyalar', href: '/campaigns', icon: Tag },
    { label: 'Keşif Yerleri', href: '/places', icon: Compass },
    { label: 'Geri Bildirim & Öneri', href: '/feedback', icon: MessageSquare },
    { label: 'Şikayet & Denetim', href: '/reports', icon: AlertTriangle },
    { label: 'Reklam Yönetimi', href: '/ads', icon: Megaphone },
    { label: 'Sistem & Depolama', href: '/settings', icon: Sliders },
    { label: 'Güvenlik Logları', href: '/activity-logs', icon: ShieldCheck },
    { label: 'Sistem Durumu', href: '/health', icon: Activity },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--primary-glow)',
          }}
        >
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Civarımda
            </span>
            <span className="badge badge-primary" style={{ fontSize: 9, padding: '2px 5px' }}>
              PRO
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Yönetim Konsolu</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            padding: '0 12px',
            marginBottom: 6,
            letterSpacing: '0.06em',
          }}
        >
          Ana Menü
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.35)' : 'transparent'}`,
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#818cf8' : 'var(--text-dim)'}
                style={{ transition: 'color 0.15s ease' }}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div
        style={{
          padding: 16,
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.fullName || 'Yönetici'}
              </p>
              <span
                className={`badge ${
                  user?.role === 'super_admin'
                    ? 'badge-danger'
                    : user?.role === 'admin'
                    ? 'badge-primary'
                    : 'badge-warning'
                }`}
                style={{ fontSize: 9, padding: '1px 5px' }}
              >
                {user?.role || 'admin'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Güvenli Çıkış"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
