'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Ticket,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building,
} from 'lucide-react';
import api from '../../lib/api';
import { Campaign } from '../../lib/types';
import { Modal } from '../../components/Modal';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    businessName: '',
    city: '',
    discountRate: '20',
    maxClaims: '100',
    startDate: '',
    endDate: '',
    imageUrl: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error('Kampanyalar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setForm({
      title: '',
      description: '',
      businessName: '',
      city: 'Kastamonu',
      discountRate: '20',
      maxClaims: '100',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      imageUrl: '',
      latitude: '',
      longitude: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Campaign) => {
    setEditingCampaign(item);
    setForm({
      title: item.title,
      description: item.description,
      businessName: item.businessName,
      city: item.city,
      discountRate: item.discountRate || '20',
      maxClaims: item.maxClaims?.toString() || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      imageUrl: item.imageUrl || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Silme işlemi başarısız oldu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.businessName) {
      alert('Lütfen başlık ve işletme adını doldurunuz.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<Campaign> = {
        title: form.title,
        description: form.description,
        businessName: form.businessName,
        city: form.city,
        discountRate: form.discountRate,
        maxClaims: form.maxClaims ? parseInt(form.maxClaims, 10) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        imageUrl: form.imageUrl || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (editingCampaign) {
        const updated = await api.updateCampaign(editingCampaign.id, payload);
        setCampaigns((prev) => prev.map((c) => (c.id === editingCampaign.id ? updated : c)));
      } else {
        const created = await api.createCampaign(payload);
        setCampaigns((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase());
    const matchCity = !selectedCity || c.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchSearch && matchCity;
  });

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Üst Bar */}
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
              <Tag size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Yerel Kampanyalar ve İndirimler
            </h1>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Civarımda yerel işletmelerin indirimlerini, kupon kodlarını ve kampanyalarını yönetin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadCampaigns} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={15} />
            <span>Yenile</span>
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} />
            <span>Yeni Kampanya Ekle</span>
          </button>
        </div>
      </div>

      {/* Arama ve Filtre */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Kampanya başlığı veya işletme adına göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <input
          type="text"
          className="input"
          style={{ width: 200 }}
          placeholder="Şehir filtrele (örn: Kastamonu)"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <RefreshCw className="spin" size={28} color="var(--primary)" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <AlertCircle size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Kampanya Bulunamadı</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Henüz eklenmiş aktif bir kampanya bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>İşletme & Başlık</th>
                <th>Şehir / Konum</th>
                <th>İndirim</th>
                <th>Kullanım / Kota</th>
                <th>Tarih Aralığı</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Building size={12} /> {item.businessName}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#fff' }}>
                      <MapPin size={13} color="#38BDF8" /> {item.city}
                    </div>
                    {item.latitude && item.longitude ? (
                      <span className="badge badge-success" style={{ fontSize: 9, marginTop: 4, padding: '2px 5px' }}>
                        GPS Koordinatlı
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className="badge badge-primary" style={{ fontSize: 12, fontWeight: 800 }}>
                      %{item.discountRate} İndirim
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
                      {item.currentClaims || 0} / {item.maxClaims ? item.maxClaims : 'Sınırsız'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Alınan Kupon</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      {item.startDate ? item.startDate.split('T')[0] : 'Süresiz'}
                      {item.endDate ? ` - ${item.endDate.split('T')[0]}` : ''}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 10px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekleme / Düzenleme Modalı */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Ekle'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Kampanya Başlığı *</label>
            <input
              type="text"
              required
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn: Hafta Sonuna Özel %30 İndirim"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>İşletme Adı *</label>
              <input
                type="text"
                required
                className="input"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Örn: Asil Kebap"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Şehir *</label>
              <input
                type="text"
                required
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Kastamonu"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>İndirim Oranı (%)</label>
              <input
                type="number"
                className="input"
                value={form.discountRate}
                onChange={(e) => setForm({ ...form, discountRate: e.target.value })}
                placeholder="20"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Maksimum Kupon Kotası</label>
              <input
                type="number"
                className="input"
                value={form.maxClaims}
                onChange={(e) => setForm({ ...form, maxClaims: e.target.value })}
                placeholder="100 (Boş = Sınırsız)"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Açıklama</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kampanya koşulları, geçerlilik detayları..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Başlangıç Tarihi</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Bitiş Tarihi</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Enlem (Latitude)</label>
              <input
                type="text"
                className="input"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="örn: 41.3887"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Boylam (Longitude)</label>
              <input
                type="text"
                className="input"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="örn: 33.7827"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Görsel URL</label>
            <input
              type="text"
              className="input"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
