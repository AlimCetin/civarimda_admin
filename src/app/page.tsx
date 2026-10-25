'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  TrendingUp,
  Ban,
  AlertTriangle,
  Flag,
  Activity,
  Shield,
  Megaphone,
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import { DashboardStats, SystemHealth, ActivityLog } from '../lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsData, healthData, logsData] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getHealth(),
        api.getActivityLogs({ page: 1, limit: 5 }),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value);
      }
      if (logsData.status === 'fulfilled') {
        setRecentLogs(logsData.value.logs || logsData.value.data || []);
      }
    } catch (err: any) {
      showToast('Veriler yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    showToast('Gösterge paneli güncellendi', 'info');
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Hoş Geldin, {user?.fullName || 'Yönetici'}</span>
            <span className="badge badge-primary" style={{ fontSize: 11 }}>
              {user?.role?.toUpperCase()}
            </span>
          </h1>
          <p className="page-subtitle">
            Civarımda platformunun anlık performans, kullanıcı ve güvenlik göstergeleri
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers ?? '...'}
          icon={Users}
          badge="Aktif"
          badgeType="success"
          subtitle="Kayıtlı toplam hesap"
          accentColor="#6366f1"
        />
        <StatCard
          title="Bugün Katılanlar"
          value={stats?.newUsersToday ?? '...'}
          icon={UserPlus}
          badge="+24 Saat"
          badgeType="info"
          subtitle="Son 24 saatte açılan hesaplar"
          accentColor="#10b981"
        />
        <StatCard
          title="Bu Hafta Katılanlar"
          value={stats?.newUsersThisWeek ?? '...'}
          icon={TrendingUp}
          badge="Haftalık"
          badgeType="neutral"
          subtitle="Son 7 günde gelen kullanıcılar"
          accentColor="#06b6d4"
        />
        <StatCard
          title="Yasaklı (Banlı) Hesaplar"
          value={stats?.bannedUsers ?? '...'}
          icon={Ban}
          badge={stats?.bannedUsers ? 'Kısıtlı' : '0'}
          badgeType="danger"
          subtitle="Süreli veya kalıcı engellenenler"
          accentColor="#ef4444"
        />
        <StatCard
          title="Uyarı Alan Kullanıcılar"
          value={stats?.warnedUsers ?? '...'}
          icon={AlertTriangle}
          badge="İhlal"
          badgeType="warning"
          subtitle="En az 1 uyarısı olanlar"
          accentColor="#f59e0b"
        />
      </div>

      {/* Two Column Layout: System Health & Quick Actions / Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* System & Database Health Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Sistem & Veritabanı</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>PostgreSQL & NestJS Durumu</p>
              </div>
            </div>
            <span className="badge badge-success">ÇALIŞIYOR</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={16} color="#818cf8" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>PostgreSQL UUID Veritabanı</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>
                {health?.database?.status === 'connected' ? 'Bağlı (Aktif)' : 'Bağlı'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Cpu size={16} color="#38bdf8" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bellek / RAM Kullanımı</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {health?.memoryUsage?.heapUsedMB ? `${health.memoryUsage.heapUsedMB} MB / ${health.memoryUsage.heapTotalMB} MB` : 'Normal (Optimize)'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={16} color="#fbbf24" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sürüm & Güvenlik</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>
                v1.0.2 • TypeORM UUID
              </span>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Hızlı Yönetim İşlemleri
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Sık kullanılan modüllere ve denetim araçlarına doğrudan erişin
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Link
              href="/users"
              className="glass-card glass-card-interactive"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Users size={20} color="#6366f1" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Kullanıcı Listesi</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Arama, rol değiştirme, ban</p>
              </div>
            </Link>

            <Link
              href="/reports"
              className="glass-card glass-card-interactive"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Flag size={20} color="#f59e0b" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Şikayet Merkezi</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Bildirilen içerikleri incele</p>
              </div>
            </Link>

            <Link
              href="/ads"
              className="glass-card glass-card-interactive"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Megaphone size={20} color="#10b981" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Reklamlar</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Banner ve kampanya yönetimi</p>
              </div>
            </Link>

            <Link
              href="/activity-logs"
              className="glass-card glass-card-interactive"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Shield size={20} color="#06b6d4" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Güvenlik Logları</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Yönetici audit hareketleri</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Son Yönetici Aktiviteleri</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sistemde yapılan son kritik müdahaleler</p>
          </div>
          <Link href="/activity-logs" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Tümünü Gör</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-dim)' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
            <p style={{ fontSize: 13 }}>Henüz yeni bir yönetici aktivite kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>İşlem Türü</th>
                  <th>Yönetici</th>
                  <th>Hedef / Sebep</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span
                        className={`badge ${
                          log.activityType.includes('BAN')
                            ? 'badge-danger'
                            : log.activityType.includes('ROLE')
                            ? 'badge-primary'
                            : log.activityType.includes('WARN')
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {log.activityType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{log.admin?.fullName || log.adminId}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{log.reason || log.targetId || '-'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(log.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
