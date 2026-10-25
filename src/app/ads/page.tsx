'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  BarChart3,
  Eye,
  MousePointer,
  Trash2,
  Edit,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { Ad, AdStats, AdStatus } from '../../lib/types';

export default function AdsPage() {
  const { showToast } = useToast();

  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AdStatus | ''>('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaType, setFormMediaType] = useState<'image' | 'video'>('image');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formStatus, setFormStatus] = useState<AdStatus>('active');
  const [formBudget, setFormBudget] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const [adsRes, statsRes] = await Promise.allSettled([
        api.getAds({ page, limit: 20, status: statusFilter || undefined }),
        api.getAdStats(),
      ]);

      if (adsRes.status === 'fulfilled') {
        setAds(adsRes.value.ads || adsRes.value.data || []);
        setTotal(adsRes.value.total || 0);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err: any) {
      showToast(err.message || 'Reklamlar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [page, statusFilter]);

  const handleOpenCreate = () => {
    setEditingAd(null);
    setFormTitle('');
    setFormDesc('');
    setFormMediaUrl('');
    setFormMediaType('image');
    setFormTargetUrl('');
    setFormStatus('active');
    setFormBudget('');
    setFormStartDate('');
    setFormEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormTitle(ad.title);
    setFormDesc(ad.description || '');
    setFormMediaUrl(ad.mediaUrl);
    setFormMediaType(ad.mediaType);
    setFormTargetUrl(ad.targetUrl || '');
    setFormStatus(ad.status);
    setFormBudget(ad.budget?.toString() || '');
    setFormStartDate(ad.startDate ? ad.startDate.split('T')[0] : '');
    setFormEndDate(ad.endDate ? ad.endDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const submitAdForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formMediaUrl) {
      showToast('Lütfen başlık ve medya URL alanlarını doldurun.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const payload: Partial<Ad> = {
        title: formTitle,
        description: formDesc,
        mediaUrl: formMediaUrl,
        mediaType: formMediaType,
        targetUrl: formTargetUrl || undefined,
        status: formStatus,
        budget: formBudget ? parseFloat(formBudget) : undefined,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
      };

      if (editingAd) {
        await api.updateAd(editingAd.id, payload);
        showToast('Reklam başarıyla güncellendi.', 'success');
      } else {
        await api.createAd(payload);
        showToast('Yeni reklam başarıyla oluşturuldu.', 'success');
      }

      setIsModalOpen(false);
      fetchAds();
    } catch (err: any) {
      showToast(err.message || 'İşlem başarısız oldu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteAd(id);
      showToast('Reklam silindi.', 'success');
      fetchAds();
    } catch (err: any) {
      showToast(err.message || 'Silme işlemi başarısız.', 'error');
    }
  };

  const toggleAdStatus = async (ad: Ad) => {
    const nextStatus: AdStatus = ad.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateAd(ad.id, { status: nextStatus });
      showToast(`Reklam durumu '${nextStatus}' olarak güncellendi.`, 'success');
      fetchAds();
    } catch (err: any) {
      showToast(err.message || 'Durum değiştirilemedi.', 'error');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Megaphone size={24} color="#10b981" />
            <span>Reklam & Sponsor Yönetimi</span>
          </h1>
          <p className="page-subtitle">Mobil akışta ve haritada gösterilen sponsorlu içeriklerin ve bannerların performansını yönetin</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} />
            <span>Yeni Reklam Ekle</span>
          </button>
          <button onClick={fetchAds} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aktif Kampanyalar</span>
            <Megaphone size={16} color="#10b981" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {stats?.activeAds ?? ads.filter((a) => a.status === 'active').length}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toplam Gösterim</span>
            <Eye size={16} color="#38bdf8" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {stats?.totalImpressions?.toLocaleString('tr-TR') ?? '0'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toplam Tıklanma</span>
            <MousePointer size={16} color="#a855f7" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginTop: 4 }}>
            {stats?.totalClicks?.toLocaleString('tr-TR') ?? '0'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ortalama CTR (Dönüşüm)</span>
            <BarChart3 size={16} color="#fbbf24" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            %{stats?.ctr ? (stats.ctr * 100).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Ads Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kampanya / Başlık</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Gösterim</th>
                <th>Tıklama</th>
                <th>Hedef Bağlantı</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Reklamlar listeleniyor...</p>
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
                    Henüz eklenmiş bir reklam kampanyası bulunmuyor.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: '#fff' }}>{ad.title}</p>
                        {ad.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{ad.description}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{ad.mediaType.toUpperCase()}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ad.status === 'active'
                            ? 'badge-success'
                            : ad.status === 'paused'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ad.impressions || 0}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#818cf8' }}>{ad.clicks || 0}</span>
                    </td>
                    <td>
                      {ad.targetUrl ? (
                        <a
                          href={ad.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#38bdf8',
                            fontSize: 12,
                          }}
                        >
                          <span>Aç</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => toggleAdStatus(ad)}
                          className="btn btn-secondary btn-sm"
                          title={ad.status === 'active' ? 'Durdur' : 'Başlat'}
                        >
                          {ad.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ad)}
                          className="btn btn-secondary btn-sm"
                          title="Düzenle"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="btn btn-danger btn-sm"
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAd ? 'Reklamı Düzenle' : 'Yeni Sponsor / Reklam Oluştur'}
        maxWidth={580}
      >
        <form onSubmit={submitAdForm}>
          <div className="form-group">
            <label className="form-label">Kampanya Başlığı *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Örn: Hafta Sonu %40 İndirim Fırsatı"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea
              className="textarea-field"
              placeholder="Kısa kampanya metni..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Medya Türü</label>
              <select
                className="select-field"
                value={formMediaType}
                onChange={(e) => setFormMediaType(e.target.value as 'image' | 'video')}
              >
                <option value="image">Görsel (Image)</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Durum</label>
              <select
                className="select-field"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as AdStatus)}
              >
                <option value="active">Aktif (Yayımda)</option>
                <option value="paused">Durduruldu (Paused)</option>
                <option value="draft">Taslak (Draft)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Görsel / Video URL *</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://images.unsplash.com/... veya /uploads/..."
              value={formMediaUrl}
              onChange={(e) => setFormMediaUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tıklanınca Yönlendirilecek Link (Hedef URL)</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://isletme.com veya uygulama içi rota"
              value={formTargetUrl}
              onChange={(e) => setFormTargetUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={actionLoading}
            >
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Kaydediliyor...' : editingAd ? 'Güncellemeyi Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
