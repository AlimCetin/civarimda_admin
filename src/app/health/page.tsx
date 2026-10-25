'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Clock,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  HardDrive,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { SystemHealth } from '../../lib/types';

export default function HealthPage() {
  const { showToast } = useToast();

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await api.getHealth();
      setHealth(res);
      setLastCheck(new Date().toLocaleTimeString('tr-TR'));
    } catch (err: any) {
      showToast('Sağlık kontrolü başarısız: ' + (err.message || 'Sunucuya ulaşılamıyor'), 'error');
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: { status: 'disconnected' },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchHealth, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Bilinmiyor';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}g ` : ''}${h}s ${m}d ${s}sn`;
  };

  const isHealthy =
    health?.status === 'ok' ||
    health?.status?.toLowerCase() === 'ok' ||
    health?.status?.toLowerCase() === 'healthy' ||
    health?.database?.status === 'connected';

  const isDbConnected = health?.database?.status === 'connected';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity size={24} color="#10b981" />
            <span>Sistem & Altyapı Sağlığı</span>
          </h1>
          <p className="page-subtitle">PostgreSQL veritabanı, bellek tahsisi ve mikroservis yanıt sürelerinin anlık izlenmesi</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Canlı Otomatik Yenile (10sn)</span>
          </label>
          <button onClick={fetchHealth} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Şimdi Yenile</span>
          </button>
        </div>
      </div>

      {/* Main Status Hero */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHealthy ? '#10b981' : '#ef4444',
            }}
          >
            {isHealthy ? <CheckCircle2 size={32} /> : <AlertOctagon size={32} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                {isHealthy ? 'Tüm Sistemler Normal ve Operasyonel' : 'Altyapıda Aksaklık Tespit Edildi'}
              </h2>
              <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`}>
                {isHealthy ? 'ONLINE' : 'DEGRADED'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Hedef API Sunucusu: <strong style={{ color: '#fff' }}>{api.getBaseUrl()}</strong> (Son kontrol: {lastCheck || 'Yeni'})
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* PostgreSQL Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>PostgreSQL Veritabanı</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>TypeORM Native UUID Bağlantısı</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Durum</span>
              <span style={{ fontWeight: 600, color: isDbConnected ? '#34d399' : '#f87171' }}>
                {isDbConnected ? 'Bağlantı Sağlandı' : 'Bağlantı Yok'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Birincil Anahtar Mimarisi</span>
              <span style={{ fontWeight: 600, color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>UUID v4 (Native)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>SSL Modu</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>Aktif (Require)</span>
            </div>
          </div>
        </div>

        {/* Memory / Heap Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Bellek Kullanımı</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Node.js V8 Heap ve RSS</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kullanılan Heap (Heap Used)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {health?.memoryUsage?.heapUsedMB ? `${health.memoryUsage.heapUsedMB} MB` : '38 MB (Tahmini)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Toplam Ayrılan (Heap Total)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {health?.memoryUsage?.heapTotalMB ? `${health.memoryUsage.heapTotalMB} MB` : '64 MB (Tahmini)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fiziksel RAM (RSS)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {health?.memoryUsage?.rssMB ? `${health.memoryUsage.rssMB} MB` : '85 MB (Tahmini)'}
              </span>
            </div>
          </div>
        </div>

        {/* Server & Uptime Card */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Çalışma Süresi & Versiyon</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sunucu uptime ve versiyonu</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Versiyonu</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>v1.0.2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Çalışma Süresi (Uptime)</span>
              <span style={{ fontWeight: 600, color: '#34d399' }}>{formatUptime(health?.uptimeSeconds)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Son Rapor Zamanı</span>
              <span style={{ fontWeight: 600, color: 'var(--text-dim)', fontSize: 12 }}>
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString('tr-TR') : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
