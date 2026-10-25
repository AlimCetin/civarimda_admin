'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCode,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { ActivityLog, ActivityType } from '../../lib/types';

export default function ActivityLogsPage() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const [loading, setLoading] = useState(true);

  // Metadata Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs({
        page,
        limit: 20,
        activityType: typeFilter || undefined,
      });

      setLogs(res.logs || res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Güvenlik günlükleri yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, typeFilter]);

  const totalPages = Math.ceil(total / 20) || 1;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={24} color="#06b6d4" />
            <span>Güvenlik & Yönetici Günlükleri</span>
          </h1>
          <p className="page-subtitle">Tüm yöneticilerin gerçekleştirdiği yetkili işlemlerin (Audit Log) değişmez denetim kaydı</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="select-field"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ActivityType | '');
              setPage(1);
            }}
            style={{ width: 220 }}
          >
            <option value="">Tüm Aktivite Türleri</option>
            <option value="BAN_USER">🚫 BAN_USER (Kullanıcı Yasaklama)</option>
            <option value="UNBAN_USER">✅ UNBAN_USER (Yasak Kaldırma)</option>
            <option value="WARN_USER">⚠️ WARN_USER (Uyarı Gönderme)</option>
            <option value="CHANGE_ROLE">🛡️ CHANGE_ROLE (Rol Değiştirme)</option>
            <option value="DELETE_POST">🗑️ DELETE_POST (Gönderi Silme)</option>
            <option value="UPDATE_REPORT">📋 UPDATE_REPORT (Şikayet Güncelleme)</option>
            <option value="CREATE_AD">📢 CREATE_AD (Reklam Oluşturma)</option>
            <option value="UPDATE_AD">✏️ UPDATE_AD (Reklam Güncelleme)</option>
            <option value="DELETE_AD">❌ DELETE_AD (Reklam Silme)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>İşlem Türü</th>
                <th>Yönetici</th>
                <th>Hedef ID / Tür</th>
                <th>Gerekçe / Detay</th>
                <th>Tarih & Saat</th>
                <th style={{ textAlign: 'right' }}>Meta Detay</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Günlükler yükleniyor...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
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
                      <span style={{ fontWeight: 600, color: '#fff' }}>
                        {log.admin?.fullName || log.adminId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                        {log.targetId ? `${log.targetId.substring(0, 12)}...` : '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{log.reason || '-'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(log.createdAt)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-ghost btn-sm"
                        title="JSON Detayını Gör"
                      >
                        <FileCode size={14} color="#818cf8" />
                        <span>Detay</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Toplam <strong>{total}</strong> denetim kaydı (Sayfa {page} / {totalPages})
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={14} />
              <span>Önceki</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="btn btn-secondary btn-sm"
            >
              <span>Sonraki</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* --- METADATA MODAL --- */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Aktivite Detay & Metadata"
        subtitle={`Log ID: ${selectedLog?.id}`}
        maxWidth={620}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>İŞLEM TÜRÜ</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: 2 }}>{selectedLog.activityType}</p>
              </div>
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>YÖNETİCİ ID</span>
                <p style={{ fontWeight: 600, color: '#818cf8', marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {selectedLog.adminId}
                </p>
              </div>
            </div>

            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>HEDEF BİLGİSİ</span>
              <p style={{ color: '#fff', marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {selectedLog.targetType || 'Entity'}: {selectedLog.targetId || 'Yok'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>HAM JSON METADATA</span>
              <pre
                style={{
                  background: '#090d16',
                  padding: 14,
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#38bdf8',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  marginTop: 6,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
