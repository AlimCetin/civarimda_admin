'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Radio,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';
import { AppSetting } from '../../lib/types';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [settings, setSettings] = useState<Record<string, string>>({
    storage_provider: 'local',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    s3_bucket: '',
    s3_region: 'eu-central-1',
    s3_access_key: '',
    s3_secret_key: '',
    maintenance_mode: 'false',
    min_supported_version: '1.0.3',
    announcement_banner: '',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.civarimda',
    app_store_url: '',
    support_email: 'destek@civarimda.com',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const items: AppSetting[] = await api.getSettings();
      const mapped: Record<string, string> = { ...settings };
      for (const item of items) {
        mapped[item.key] = item.value;
      }
      setSettings(mapped);
    } catch (err: any) {
      console.error('Ayarlar yüklenemedi:', err);
      setErrorMessage('Ayarlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      await api.updateSettings(settings);
      setSuccessMessage('Tüm sistem ve depolama ayarları başarıyla kaydedildi.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestStorage = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testStorage(settings.storage_provider, settings);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Bağlantı testi başarısız oldu.' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <RefreshCw className="spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1000, margin: '0 auto' }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
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
              <Sliders size={20} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
              Sistem & Değişken Proje Ayarları
            </h1>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Yazılımı güncellemeden depolama sağlayıcısını, bakım modunu ve mobil uygulama parametrelerini anında yönetin.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
        >
          {saving ? <RefreshCw className="spin" size={16} /> : <Save size={16} />}
          <span>{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} color="#EF4444" />
          <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>{errorMessage}</span>
        </div>
      )}

      {/* 1. BÖLÜM: MEDYA & BULUT DEPOLAMA YÖNETİMİ */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
          <Cloud size={20} color="#38BDF8" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
            Medya Depolama ve CDN Dağıtımı (Kalıcılık Yönetimi)
          </h2>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
          Sisteminiz şu anda <strong>Yerel Disk (Local Storage)</strong> modunda çalışmaktadır. Bulut hesabınızı açtığınızda buradan sağlayıcıyı ve API anahtarlarınızı tanımlayarak tek tıkla bulut CDN dağıtımına geçebilirsiniz.
        </p>

        {/* Sağlayıcı Seçimi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {/* Local */}
          <div
            onClick={() => setSettings({ ...settings, storage_provider: 'local' })}
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              border: `2px solid ${settings.storage_provider === 'local' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              backgroundColor: settings.storage_provider === 'local' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <HardDrive size={22} color={settings.storage_provider === 'local' ? 'var(--primary)' : 'var(--text-dim)'} />
              <Radio size={16} color={settings.storage_provider === 'local' ? 'var(--primary)' : 'var(--text-dim)'} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>Yerel Disk (Local)</h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
              Sunucu diski (`/uploads`). Sıfır maliyet, bulut ayarlanana kadar varsayılandır.
            </p>
          </div>

          {/* Cloudinary */}
          <div
            onClick={() => setSettings({ ...settings, storage_provider: 'cloudinary' })}
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              border: `2px solid ${settings.storage_provider === 'cloudinary' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              backgroundColor: settings.storage_provider === 'cloudinary' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Cloud size={22} color={settings.storage_provider === 'cloudinary' ? 'var(--primary)' : 'var(--text-dim)'} />
              <Radio size={16} color={settings.storage_provider === 'cloudinary' ? 'var(--primary)' : 'var(--text-dim)'} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>Cloudinary CDN</h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
              Otomatik WebP sıkıştırma, küresel CDN ve video akış optimizasyonu.
            </p>
          </div>

          {/* AWS S3 */}
          <div
            onClick={() => setSettings({ ...settings, storage_provider: 's3' })}
            style={{
              padding: 16,
              borderRadius: 12,
              cursor: 'pointer',
              border: `2px solid ${settings.storage_provider === 's3' ? 'var(--primary)' : 'var(--border-subtle)'}`,
              backgroundColor: settings.storage_provider === 's3' ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Cloud size={22} color={settings.storage_provider === 's3' ? 'var(--primary)' : 'var(--text-dim)'} />
              <Radio size={16} color={settings.storage_provider === 's3' ? 'var(--primary)' : 'var(--text-dim)'} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>AWS S3</h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
              Sonsuz ölçeklenebilir nesne depolama ve CloudFront CDN entegrasyonu.
            </p>
          </div>
        </div>

        {/* Cloudinary Parametreleri */}
        {settings.storage_provider === 'cloudinary' && (
          <div style={{ padding: 18, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Cloudinary API Yapılandırması</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Cloud Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="örn: civarimda-cloud"
                  value={settings.cloudinary_cloud_name || ''}
                  onChange={(e) => setSettings({ ...settings, cloudinary_cloud_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>API Key</label>
                <input
                  type="text"
                  className="input"
                  placeholder="örn: 8371928491823"
                  value={settings.cloudinary_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, cloudinary_api_key: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>API Secret</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••••••••••"
                  value={settings.cloudinary_api_secret || ''}
                  onChange={(e) => setSettings({ ...settings, cloudinary_api_secret: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* AWS S3 Parametreleri */}
        {settings.storage_provider === 's3' && (
          <div style={{ padding: 18, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>AWS S3 Bucket Yapılandırması</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>S3 Bucket Adı</label>
                <input
                  type="text"
                  className="input"
                  placeholder="örn: civarimda-media"
                  value={settings.s3_bucket || ''}
                  onChange={(e) => setSettings({ ...settings, s3_bucket: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Bölge (Region)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="örn: eu-central-1"
                  value={settings.s3_region || ''}
                  onChange={(e) => setSettings({ ...settings, s3_region: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Access Key ID</label>
                <input
                  type="text"
                  className="input"
                  placeholder="AKIA..."
                  value={settings.s3_access_key || ''}
                  onChange={(e) => setSettings({ ...settings, s3_access_key: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Secret Access Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••••••••••"
                  value={settings.s3_secret_key || ''}
                  onChange={(e) => setSettings({ ...settings, s3_secret_key: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bağlantıyı Test Et */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
          <button
            type="button"
            onClick={handleTestStorage}
            disabled={testing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          >
            {testing ? <RefreshCw className="spin" size={14} /> : <CheckCircle2 size={14} />}
            <span>Bağlantıyı Test Et</span>
          </button>
          {testResult && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: testResult.success ? '#10B981' : '#EF4444',
              }}
            >
              {testResult.message}
            </span>
          )}
        </div>
      </div>

      {/* 2. BÖLÜM: UYGULAMA & MOBİL YÖNETİMİ */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
          <Smartphone size={20} color="#10B981" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
            Mobil Uygulama & Genel Proje Değişkenleri
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {/* Bakım Modu */}
          <div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color={settings.maintenance_mode === 'true' ? '#EF4444' : '#9CA3AF'} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Uygulama Bakım Modu</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true' })}
                className={`badge ${settings.maintenance_mode === 'true' ? 'badge-danger' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 11 }}
              >
                {settings.maintenance_mode === 'true' ? 'BAKIMDA (AÇIK)' : 'NORMAL (KAPALI)'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
              Aktif edildiğinde mobil uygulama kullanıcılara bakım ekranı gösterir ve sunucu işlemlerini geçici olarak kilitler.
            </p>
          </div>

          {/* Min Desteklenen Sürüm */}
          <div style={{ padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Minimum Desteklenen Sürüm
            </label>
            <input
              type="text"
              className="input"
              value={settings.min_supported_version || '1.0.3'}
              onChange={(e) => setSettings({ ...settings, min_supported_version: e.target.value })}
              placeholder="1.0.3"
            />
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6, margin: 0 }}>
              Bu sürümün altındaki eski mobil uygulamalar Google Play Store güncelleme uyarısına yönlendirilir.
            </p>
          </div>

          {/* Acil Durum / Kampanya Duyuru Metni */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Mobil Ana Sayfa Duyuru Metni (Opsiyonel)
            </label>
            <textarea
              className="input"
              rows={3}
              value={settings.announcement_banner || ''}
              onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
              placeholder="Örn: Hafta sonuna özel tüm yerel işletmelerde %20 indirim fırsatları başladı!"
            />
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Dolu bırakıldığında mobil ana sayfanın en üstünde dikkat çekici bir duyuru şeridi olarak gösterilir.
            </p>
          </div>

          {/* Mağaza ve Destek Bağlantıları */}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Google Play Store URL</label>
            <input
              type="text"
              className="input"
              value={settings.play_store_url || ''}
              onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Destek E-posta Adresi</label>
            <input
              type="email"
              className="input"
              value={settings.support_email || ''}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
