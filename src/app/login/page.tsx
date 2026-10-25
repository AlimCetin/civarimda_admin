'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, Sparkles, ArrowRight, Server, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => api.getBaseUrl());
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Lütfen e-posta ve şifrenizi girin.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Yönetici girişi başarılı!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    showToast(`Bilgiler dolduruldu: ${demoEmail}`, 'info');
  };

  const handleApiToggle = () => {
    const isCloud = apiUrl.includes('render.com');
    const newUrl = isCloud ? 'http://localhost:3000/api' : 'https://civarimda.onrender.com/api';
    api.setBaseUrl(newUrl);
    setApiUrl(newUrl);
    showToast(`API hedefi: ${isCloud ? 'Localhost' : 'Render Bulut'} olarak ayarlandı`, 'info');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15), transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1), transparent 40%)
        `,
        padding: 24,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 16,
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px var(--primary-glow)',
            }}
          >
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Civarımda Admin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Yönetim ve moderasyon konsoluna erişmek için giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-Posta Adresi</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                placeholder="admin@civarimda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Mail
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Şifre</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Lock
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14 }}
            disabled={loading}
          >
            {loading ? (
              <span>Doğrulanıyor...</span>
            ) : (
              <>
                <span>Güvenli Giriş Yap</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Helpers for Testing */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 10, fontWeight: 600 }}>
            HIZLI TEST HESAPLARI (SEED DATA)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleFillDemo('ali@a.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11 }}
            >
              👑 Yönetici (ali@a.com)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('ali1@a.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11 }}
            >
              🛡️ Moderatör (ali1@a.com)
            </button>
          </div>
        </div>

        {/* API Switcher Footer */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleApiToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: 11,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Server size={12} />
            <span>API: {apiUrl.includes('render.com') ? 'Render Cloud (Canlı)' : 'Localhost (Yerel)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
