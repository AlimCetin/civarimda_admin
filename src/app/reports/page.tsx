'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flag,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { Report, ReportStats, ReportStatus, ReportType, ReportPriority } from '../../lib/types';

export default function ReportsPage() {
  const { showToast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [loading, setLoading] = useState(true);

  // Resolution modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.allSettled([
        api.getReports({
          page,
          limit,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        }),
        api.getReportStats(),
      ]);

      if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value.reports || reportsRes.value.data || []);
        setTotal(reportsRes.value.total || 0);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err: any) {
      showToast(err.message || 'Şikayetler yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, typeFilter]);

  const handleOpenReview = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setResolutionNote(report.resolutionNote || '');
    setIsModalOpen(true);
  };

  const submitResolution = async () => {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      await api.updateReport(selectedReport.id, {
        status: newStatus,
        resolutionNote: resolutionNote.trim() || undefined,
      });
      showToast('Şikayet durumu başarıyla güncellendi.', 'success');
      setIsModalOpen(false);
      fetchReports();
    } catch (err: any) {
      showToast(err.message || 'İşlem başarısız oldu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReportedPost = async () => {
    if (!selectedReport || selectedReport.type !== 'post') return;
    if (!confirm('Şikayet edilen bu gönderiyi sistemden tamamen silmek istediğinize emin misiniz?')) return;

    try {
      await api.deletePost(selectedReport.reportedId, 'Şikayet değerlendirmesi sonucu silindi.');
      showToast('Gönderi sistemden kaldırıldı.', 'success');
      // Automatically resolve report
      await api.updateReport(selectedReport.id, {
        status: 'resolved',
        resolutionNote: 'İçerik kurallara aykırı bulundu ve kaldırıldı.',
      });
      setIsModalOpen(false);
      fetchReports();
    } catch (err: any) {
      showToast(err.message || 'Gönderi silinemedi.', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Flag size={24} color="#f59e0b" />
            <span>Şikayet & Moderasyon Merkezi</span>
          </h1>
          <p className="page-subtitle">Kullanıcılar tarafından bildirilen uygunsuz içerikleri, profilleri ve mesajları inceleyin</p>
        </div>
        <button onClick={fetchReports} className="btn btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bekleyen Şikayet</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            {stats?.pending ?? '0'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #38bdf8' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>İnceleniyor</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {stats?.in_progress ?? '0'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Çözümlenen</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {stats?.resolved ?? '0'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #64748b' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reddedilen / Geçersiz</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dim)', marginTop: 4 }}>
            {stats?.rejected ?? '0'}
          </p>
        </div>
      </div>

      {/* Filter Header */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReportStatus | '');
              setPage(1);
            }}
            style={{ width: 180 }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">⏳ Beklemede</option>
            <option value="in_progress">🔍 İnceleniyor</option>
            <option value="resolved">✅ Çözüldü</option>
            <option value="rejected">❌ Reddedildi</option>
          </select>

          <select
            className="select-field"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ReportType | '');
              setPage(1);
            }}
            style={{ width: 180 }}
          >
            <option value="">Tüm İçerik Türleri</option>
            <option value="post">Gönderi (Post)</option>
            <option value="user">Kullanıcı Profili</option>
            <option value="comment">Yorum</option>
            <option value="place">İşletme / Yer</option>
            <option value="campaign">Kampanya / İndirim</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tür</th>
                <th>Şikayet Sebebi & Açıklama</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th style={{ textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Şikayetler getiriliyor...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
                    Herhangi bir şikayet kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <span className="badge badge-primary">{report.type}</span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: '#fff' }}>{report.reason}</p>
                        {report.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{report.description}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          report.priority === 'urgent'
                            ? 'badge-danger'
                            : report.priority === 'high'
                            ? 'badge-warning'
                            : report.priority === 'medium'
                            ? 'badge-info'
                            : 'badge-neutral'
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          report.status === 'resolved'
                            ? 'badge-success'
                            : report.status === 'in_progress'
                            ? 'badge-info'
                            : report.status === 'rejected'
                            ? 'badge-neutral'
                            : 'badge-warning'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(report.createdAt)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReview(report)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Eye size={13} />
                        <span>İncele</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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
            Toplam <strong>{total}</strong> şikayet kaydı (Sayfa {page} / {totalPages})
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

      {/* --- REVIEW & RESOLUTION MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Şikayet İnceleme & Karar"
        subtitle={`Şikayet ID: ${selectedReport?.id}`}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
              Kapat
            </button>
            <button onClick={submitResolution} className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Kaydediliyor...' : 'Kararı Kaydet'}
            </button>
          </>
        }
      >
        {selectedReport && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                İçerik & Hedef Bilgisi
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 4 }}>
                Tür: <span style={{ color: 'var(--primary)' }}>{selectedReport.type.toUpperCase()}</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                Hedef ID: {selectedReport.reportedId}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Bildiren ID: {selectedReport.reporterId}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Şikayet Durumu</label>
              <select
                className="select-field"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
              >
                <option value="pending">⏳ Beklemede</option>
                <option value="in_progress">🔍 İnceleniyor (İşlemde)</option>
                <option value="resolved">✅ Çözüldü (İşlem Yapıldı)</option>
                <option value="rejected">❌ Reddedildi (İhlal Yok)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Yönetici Çözüm Notu</label>
              <textarea
                className="textarea-field"
                placeholder="Örn: İçerik incelendi, topluluk kurallarına aykırı unsur bulunmadı veya kullanıcı uyarıldı."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>

            {selectedReport.type === 'post' && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8, fontWeight: 600 }}>
                  Tehlikeli Bölge
                </p>
                <button
                  type="button"
                  onClick={handleDeleteReportedPost}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  <Trash2 size={14} />
                  <span>Şikayet Edilen Gönderiyi Kaldır (Sil)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
