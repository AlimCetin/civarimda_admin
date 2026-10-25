'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  MapPin,
  Clock,
  Phone,
  RefreshCw,
  AlertCircle,
  Building2,
  Navigation,
} from 'lucide-react';
import api from '../../lib/api';
import { Place } from '../../lib/types';
import { Modal } from '../../components/Modal';

const CATEGORIES = [
  'Tümü',
  'Doğa & Park',
  'Tarih & Kültür',
  'Yeme & İçme',
  'Müze & Sanat',
  'Otel & Konaklama',
  'Eğlence & Etkinlik',
  'Alışveriş & Çarşı',
  'Diğer',
];

export default function PlacesPage() {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedCity, setSelectedCity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Doğa & Park',
    city: 'Kastamonu',
    address: '',
    phone: '',
    workingHours: '09:00 - 18:00',
    entryFee: 'Ücretsiz',
    imageUrl: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await api.getPlaces();
      setPlaces(data || []);
    } catch (err) {
      console.error('Mekanlar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlace(null);
    setForm({
      name: '',
      description: '',
      category: 'Doğa & Park',
      city: 'Kastamonu',
      address: '',
      phone: '',
      workingHours: '09:00 - 18:00',
      entryFee: 'Ücretsiz',
      imageUrl: '',
      latitude: '',
      longitude: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Place) => {
    setEditingPlace(item);
    setForm({
      name: item.name || item.title || '',
      description: item.description || '',
      category: item.category || 'Doğa & Park',
      city: item.city || '',
      address: item.address || '',
      phone: item.phone || '',
      workingHours: item.workingHours || '',
      entryFee: item.entryFee || 'Ücretsiz',
      imageUrl: item.imageUrl || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yeri silmek istediğinize emin misiniz?')) return;
    try {
      await api.deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Silme işlemi başarısız oldu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city) {
      alert('Lütfen yer adı ve şehir alanlarını doldurunuz.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<Place> = {
        name: form.name,
        title: form.name,
        description: form.description,
        category: form.category,
        city: form.city,
        address: form.address,
        phone: form.phone,
        workingHours: form.workingHours,
        entryFee: form.entryFee,
        imageUrl: form.imageUrl || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (editingPlace) {
        const updated = await api.updatePlace(editingPlace.id, payload);
        setPlaces((prev) => prev.map((p) => (p.id === editingPlace.id ? updated : p)));
      } else {
        const created = await api.createPlace(payload);
        setPlaces((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = places.filter((p) => {
    const matchSearch =
      !search.trim() ||
      (p.name || p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === 'Tümü' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchCity = !selectedCity || (p.city || '').toLowerCase().includes(selectedCity.toLowerCase());

    return matchSearch && matchCategory && matchCity;
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
              <Compass size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Şehir & Turizm Keşif Yerleri
            </h1>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Civarımda gezilecek yerleri, turistik noktaları ve öne çıkan işletmeleri yönetin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadPlaces} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={15} />
            <span>Yenile</span>
          </button>
          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} />
            <span>Yeni Yer Ekle</span>
          </button>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Mekan adına veya açıklamasına göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          style={{ width: 180 }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="input"
          style={{ width: 180 }}
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Mekan Bulunamadı</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Seçilen kriterlere uygun keşif yeri veya işletme bulunamadı.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Yer Adı & Kategori</th>
                <th>Şehir / Adres</th>
                <th>Saatler & Ücret</th>
                <th>İletişim</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{item.name || item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>{item.category || 'Doğa'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#fff' }}>
                      <MapPin size={13} color="#38BDF8" /> {item.city}
                    </div>
                    {item.address ? (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.address}
                      </div>
                    ) : null}
                    {item.latitude && item.longitude ? (
                      <span className="badge badge-success" style={{ fontSize: 9, marginTop: 4, padding: '2px 5px' }}>
                        GPS Koordinatlı
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color="var(--text-dim)" /> {item.workingHours || 'Belirtilmedi'}
                    </div>
                    <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 2 }}>
                      {item.entryFee || 'Ücretsiz'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} /> {item.phone || 'Yok'}
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
        title={editingPlace ? 'Mekanı Düzenle' : 'Yeni Keşif Yeri Ekle'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Yer Adı *</label>
            <input
              type="text"
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Ilgaz Dağı Milli Parkı"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Kategori</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'Tümü').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Açıklama</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tarihi ve doğal güzellikleri, özellikleri..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Açık Adres</label>
            <input
              type="text"
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Mahalle, Cadde, Sokak No..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Telefon</label>
              <input
                type="text"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0366 123 45 67"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Çalışma Saatleri</label>
              <input
                type="text"
                className="input"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                placeholder="09:00 - 18:00 (Her gün)"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Giriş Ücreti</label>
              <input
                type="text"
                className="input"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                placeholder="Ücretsiz veya 50 TL"
              />
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Enlem (Latitude)</label>
              <input
                type="text"
                className="input"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="örn: 41.0772"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Boylam (Longitude)</label>
              <input
                type="text"
                className="input"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="örn: 33.7258"
              />
            </div>
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
