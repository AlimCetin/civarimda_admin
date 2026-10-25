'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { User, UserRole } from '../../lib/types';

export default function UsersPage() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isWarnModalOpen, setIsWarnModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Form states
  const [banDuration, setBanDuration] = useState('7');
  const [banPermanent, setBanPermanent] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [warnReason, setWarnReason] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        isBanned: bannedFilter === 'banned' ? true : bannedFilter === 'active' ? false : undefined,
      });

      setUsers(res.users || res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Kullanıcılar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, bannedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast('Kullanıcı ID panoya kopyalandı', 'info');
  };

  // --- Ban Action ---
  const handleOpenBanModal = (u: User) => {
    setSelectedUser(u);
    setBanReason('');
    setBanPermanent(false);
    setBanDuration('7');
    setIsBanModalOpen(true);
  };

  const submitBan = async () => {
    if (!selectedUser) return;
    if (!banReason.trim()) {
      showToast('Lütfen yasaklama sebebi belirtin.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await api.banUser(selectedUser.id, {
        reason: banReason.trim(),
        durationDays: banPermanent ? undefined : parseInt(banDuration, 10),
        isPermanent: banPermanent,
      });
      showToast(`${selectedUser.fullName} başarıyla yasaklandı.`, 'success');
      setIsBanModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Yasaklama işlemi başarısız oldu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Unban Action ---
  const handleUnban = async (u: User) => {
    if (!confirm(`${u.fullName} kullanıcısının yasağını kaldırmak istediğinize emin misiniz?`)) return;

    try {
      await api.unbanUser(u.id);
      showToast(`${u.fullName} kullanıcısının yasağı kaldırıldı.`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Yasak kaldırma işlemi başarısız.', 'error');
    }
  };

  // --- Warn Action ---
  const handleOpenWarnModal = (u: User) => {
    setSelectedUser(u);
    setWarnReason('');
    setIsWarnModalOpen(true);
  };

  const submitWarn = async () => {
    if (!selectedUser) return;
    if (!warnReason.trim()) {
      showToast('Lütfen uyarı sebebi belirtin.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await api.warnUser(selectedUser.id, warnReason.trim());
      showToast(`${selectedUser.fullName} kullanıcısına uyarı iletildi.`, 'success');
      setIsWarnModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Uyarı gönderilemedi.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Role Action ---
  const handleOpenRoleModal = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setIsRoleModalOpen(true);
  };

  const submitRoleChange = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await api.changeUserRole(selectedUser.id, newRole);
      showToast(`${selectedUser.fullName} kullanıcısının rolü '${newRole}' olarak güncellendi.`, 'success');
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Rol değiştirme işlemi başarısız.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} color="var(--primary)" />
            <span>Kullanıcı Yönetimi</span>
          </h1>
          <p className="page-subtitle">Platformdaki tüm hesapları denetleyin, rolleri düzenleyin ve güvenlik kısıtlamalarını yönetin</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={fetchUsers} className="btn btn-secondary">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <input
              type="text"
              className="input-field"
              placeholder="İsim veya UUID ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
            <Search
              size={16}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Role Filter */}
          <select
            className="select-field"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 160 }}
          >
            <option value="">Tüm Roller</option>
            <option value="user">Kullanıcı (User)</option>
            <option value="moderator">Moderatör</option>
            <option value="admin">Yönetici (Admin)</option>
            <option value="super_admin">Süper Admin</option>
          </select>

          {/* Ban Filter */}
          <select
            className="select-field"
            value={bannedFilter}
            onChange={(e) => {
              setBannedFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 160 }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Yalnızca Aktifler</option>
            <option value="banned">Yalnızca Yasaklılar</option>
          </select>

          <button type="submit" className="btn btn-primary">
            <span>Filtrele</span>
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>UUID</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Uyarılar</th>
                <th>Kayıt Tarihi</th>
                <th style={{ textAlign: 'right' }}>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Kullanıcılar getiriliyor...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
                    Kriterlere uygun kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isBanned = u.isPermanentlyBanned || (u.bannedUntil && new Date(u.bannedUntil) > new Date());
                  return (
                    <tr key={u.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(99, 102, 241, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: '#a5b4fc',
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, color: '#fff' }}>{u.fullName}</span>
                              {u.isVerified && <CheckCircle2 size={13} color="#38bdf8" />}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{u.bio ? u.bio.slice(0, 30) : 'Biyografi yok'}</span>
                          </div>
                        </div>
                      </td>

                      {/* UUID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                            {u.id.substring(0, 8)}...
                          </span>
                          <button
                            onClick={() => handleCopyId(u.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            title="Tam UUID'yi Kopyala"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'super_admin'
                              ? 'badge-danger'
                              : u.role === 'admin'
                              ? 'badge-primary'
                              : u.role === 'moderator'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        {isBanned ? (
                          <span className="badge badge-danger">
                            {u.isPermanentlyBanned ? 'Kalıcı Ban' : 'Süreli Ban'}
                          </span>
                        ) : (
                          <span className="badge badge-success">Aktif</span>
                        )}
                      </td>

                      {/* Warnings */}
                      <td>
                        <span
                          className={`badge ${
                            u.warningCount > 2
                              ? 'badge-danger'
                              : u.warningCount > 0
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          {u.warningCount} Uyarı
                        </span>
                      </td>

                      {/* Created */}
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDate(u.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {isBanned ? (
                            <button
                              onClick={() => handleUnban(u)}
                              className="btn btn-success btn-sm"
                              title="Yasağı Kaldır"
                            >
                              <CheckCircle2 size={13} />
                              <span>Yasağı Kaldır</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBanModal(u)}
                              className="btn btn-danger btn-sm"
                              title="Yasakla"
                            >
                              <Ban size={13} />
                              <span>Banla</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenWarnModal(u)}
                            className="btn btn-secondary btn-sm"
                            title="Uyarı Gönder"
                          >
                            <AlertTriangle size={13} />
                            <span>Uyar</span>
                          </button>

                          {currentUser?.role === 'admin' || currentUser?.role === 'super_admin' ? (
                            <button
                              onClick={() => handleOpenRoleModal(u)}
                              className="btn btn-secondary btn-sm"
                              title="Rol Değiştir"
                            >
                              <Shield size={13} />
                              <span>Rol</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            Toplam <strong>{total}</strong> kullanıcı arasından gösteriliyor (Sayfa {page} / {totalPages})
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

      {/* --- BAN MODAL --- */}
      <Modal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        title="Kullanıcıyı Yasakla (Ban)"
        subtitle={`${selectedUser?.fullName} (${selectedUser?.id})`}
        footer={
          <>
            <button onClick={() => setIsBanModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
              İptal
            </button>
            <button onClick={submitBan} className="btn btn-danger" disabled={actionLoading}>
              {actionLoading ? 'İşleniyor...' : 'Yasaklamayı Onayla'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Yasaklama Süresi</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="banType"
                checked={!banPermanent}
                onChange={() => setBanPermanent(false)}
              />
              <span>Süreli Ban</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#f87171' }}>
              <input
                type="radio"
                name="banType"
                checked={banPermanent}
                onChange={() => setBanPermanent(true)}
              />
              <span>Kalıcı Ban (Süresiz)</span>
            </label>
          </div>

          {!banPermanent && (
            <select
              className="select-field"
              value={banDuration}
              onChange={(e) => setBanDuration(e.target.value)}
            >
              <option value="1">1 Gün</option>
              <option value="3">3 Gün</option>
              <option value="7">7 Gün (1 Hafta)</option>
              <option value="14">14 Gün (2 Hafta)</option>
              <option value="30">30 Gün (1 Ay)</option>
              <option value="90">90 Gün (3 Ay)</option>
            </select>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Yasaklama Gerekçesi (Kullanıcıya Gösterilir)</label>
          <textarea
            className="textarea-field"
            placeholder="Örn: Topluluk kurallarına aykırı hakaret ve spam paylaşımı tespit edildi."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* --- WARN MODAL --- */}
      <Modal
        isOpen={isWarnModalOpen}
        onClose={() => setIsWarnModalOpen(false)}
        title="Kullanıcıya Uyarı Gönder"
        subtitle={`${selectedUser?.fullName} (Mevcut Uyarı: ${selectedUser?.warningCount || 0})`}
        footer={
          <>
            <button onClick={() => setIsWarnModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
              İptal
            </button>
            <button onClick={submitWarn} className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'İletiliyor...' : 'Uyarıyı Kaydet'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Uyarı Nedeni / Açıklaması</label>
          <textarea
            className="textarea-field"
            placeholder="Örn: Uygunsuz görsel paylaşımı. Tekrarında hesabınız askıya alınabilir."
            value={warnReason}
            onChange={(e) => setWarnReason(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* --- ROLE MODAL --- */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Kullanıcı Rolünü Değiştir"
        subtitle={`${selectedUser?.fullName} (${selectedUser?.role})`}
        footer={
          <>
            <button onClick={() => setIsRoleModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
              İptal
            </button>
            <button onClick={submitRoleChange} className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Güncelleniyor...' : 'Rolü Değiştir'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Yeni Yetki Rolü</label>
          <select
            className="select-field"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
          >
            <option value="user">Standart Kullanıcı (user)</option>
            <option value="moderator">Moderatör (moderator)</option>
            <option value="admin">Yönetici (admin)</option>
            <option value="super_admin">Süper Admin (super_admin)</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
