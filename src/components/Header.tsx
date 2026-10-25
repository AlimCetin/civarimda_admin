'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Globe, RefreshCw, Server } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export const Header: React.FC = () => {
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setCurrentApiUrl(api.getBaseUrl());
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await api.getHealth();
      setIsHealthy(res.status === 'ok');
    } catch {
      setIsHealthy(false);
    } finally {
      setChecking(false);
    }
  };

  const toggleApiEnvironment = () => {
    const isCloud = currentApiUrl.includes('render.com');
    const newUrl = isCloud ? 'http://localhost:3000/api' : 'https://civarimda-api.onrender.com/api';
    api.setBaseUrl(newUrl);
    setCurrentApiUrl(newUrl);
    showToast(`API sunucusu değiştirildi: ${isCloud ? 'Yerel (Localhost)' : 'Canlı Bulut (Render)'}`, 'info');
    setTimeout(() => {
      checkHealth();
    }, 500);
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(13, 18, 31, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server size={16} color="var(--primary)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
            Civarımda Admin Engine
          </span>
        </div>

        {/* Server Health Badge */}
        <div
          onClick={checkHealth}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: isHealthy ? 'var(--success-bg)' : isHealthy === false ? 'var(--danger-bg)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isHealthy ? 'var(--success-border)' : isHealthy === false ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
            fontSize: 11,
            fontWeight: 600,
          }}
          title="Tıklayarak bağlantıyı yenileyin"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isHealthy ? '#10b981' : isHealthy === false ? '#ef4444' : '#94a3b8',
              boxShadow: isHealthy ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span style={{ color: isHealthy ? '#34d399' : isHealthy === false ? '#f87171' : '#94a3b8' }}>
            {checking ? 'Kontrol ediliyor...' : isHealthy ? 'API Çevrimiçi' : 'Bağlantı Kesik'}
          </span>
          <RefreshCw size={11} className={checking ? 'animate-spin' : ''} style={{ marginLeft: 2 }} />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Toggle Backend Endpoint Button */}
        <button
          onClick={toggleApiEnvironment}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          title="Yerel ve Canlı API arasında geçiş yap"
        >
          <Globe size={14} color="#818cf8" />
          <span>
            {currentApiUrl.includes('render.com') ? 'Render Bulut API' : 'Localhost:3000'}
          </span>
        </button>

        {/* Live System Status Link */}
        <a
          href="/health"
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Activity size={14} color="#10b981" />
          <span>Metrikler</span>
        </a>
      </div>
    </header>
  );
};
