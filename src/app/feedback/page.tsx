'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Bug,
  Lightbulb,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Smartphone,
  User,
} from 'lucide-react';
import api from '../../lib/api';
import { Feedback, FeedbackStats } from '../../lib/types';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filterType, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;

      const [list, statRes] = await Promise.all([
        api.getFeedbacks(params),
        api.getFeedbackStats(),
      ]);

      setFeedbacks(list || []);
      setStats(statRes);
    } catch (err) {
      console.error('Feedback verileri yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.updateFeedbackStatus(id, newStatus);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus as any } : f)),
      );
    } catch (err: any) {
      alert(err.message || 'Durum güncellenemedi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      f.userName.toLowerCase().includes(term) ||
      f.title?.toLowerCase().includes(term) ||
      f.message.toLowerCase().includes(term) ||
      f.userEmail?.toLowerCase().includes(term)
    );
  });

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            fill={s <= rating ? '#F59E0B' : 'transparent'}
            color={s <= rating ? '#F59E0B' : '#6B7280'}
          />
        ))}
      </div>
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'suggestion':
        return (
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lightbulb size={12} /> Öneri & Fikir
          </span>
        );
      case 'bug':
        return (
          <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bug size={12} /> Hata Bildirimi
          </span>
        );
      case 'rating':
        return (
          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} /> Değerlendirme
          </span>
        );
      default:
        return <span className="badge badge-neutral">Geri Bildirim</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Beklemede</span>;
      case 'reviewed':
        return <span className="badge badge-primary">İncelendi</span>;
      case 'resolved':
        return <span className="badge badge-success">Çözüldü</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Kullanıcı Değerlendirmeleri ve Öneriler
            </h1>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Mobil uygulamadan gelen yıldızlı puanlamalar, öneriler ve hata geri bildirimleri.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={15} />
          <span>Yenile</span>
        </button>
      </div>

      {/* İstatistik Sayaçları */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Ortalama Puan</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>⭐ {stats.avgRating.toFixed(1)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>/ 5.0</span>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Toplam Bildirim</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 8 }}>{stats.totalCount}</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Öneriler & Fikirler</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#38BDF8', marginTop: 8 }}>{stats.suggestionCount}</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Hata Bildirimleri</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#EF4444', marginTop: 8 }}>{stats.bugCount}</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Bekleyenler</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 8 }}>{stats.pendingCount}</div>
          </div>
        </div>
      )}

      {/* Arama ve Filtreler */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Kullanıcı, başlık veya mesaja göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          style={{ width: 170 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tüm Türler</option>
          <option value="suggestion">Öneriler</option>
          <option value="rating">Puanlamalar</option>
          <option value="bug">Hatalar</option>
        </select>

        <select
          className="input"
          style={{ width: 170 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="reviewed">İncelendi</option>
          <option value="resolved">Çözüldü</option>
        </select>
      </div>

      {/* Tablo */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <RefreshCw className="spin" size={28} color="var(--primary)" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <AlertCircle size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Geri Bildirim Bulunamadı</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Seçilen filtrelere uygun kullanıcı değerlendirmesi veya önerisi mevcut değil.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Kullanıcı / Cihaz</th>
                <th>Tür & Puan</th>
                <th>Mesaj / Öneri</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th style={{ textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={16} color="var(--text-dim)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{f.userName}</div>
                        {f.userEmail ? (
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{f.userEmail}</div>
                        ) : null}
                        {f.deviceInfo ? (
                          <div style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                            <Smartphone size={10} /> {f.deviceInfo}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {getTypeBadge(f.type)}
                      {f.rating ? renderStars(f.rating) : null}
                    </div>
                  </td>
                  <td style={{ maxWidth: 360 }}>
                    {f.title ? (
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2 }}>
                        {f.title}
                      </div>
                    ) : null}
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                      {f.message}
                    </div>
                    {f.adminNote ? (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '4px 8px', borderRadius: 6 }}>
                        <strong>Yönetici Notu:</strong> {f.adminNote}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      {new Date(f.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td>{getStatusBadge(f.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {f.status !== 'reviewed' && (
                        <button
                          disabled={updatingId === f.id}
                          onClick={() => handleStatusChange(f.id, 'reviewed')}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                        >
                          İncele
                        </button>
                      )}
                      {f.status !== 'resolved' && (
                        <button
                          disabled={updatingId === f.id}
                          onClick={() => handleStatusChange(f.id, 'resolved')}
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                        >
                          Çözüldü
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
