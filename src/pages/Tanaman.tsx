import { useState } from 'react';
import { useLahan, useTanaman } from '../hooks/useFirestore';
import type { Tanaman as TanamanType } from '../types';
import './Tanaman.css';

export default function Tanaman() {
  const { lahan } = useLahan();
  const { tanaman, loading, addTanaman, updateTanaman, deleteTanaman } = useTanaman();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lahanId: '',
    nama: '',
    jenis: '',
    varietas: '',
    tanggalTanam: new Date().toISOString().split('T')[0],
    status: 'semai' as TanamanType['status'],
    jumlah: 1,
    catatan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: Omit<TanamanType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      lahanId: formData.lahanId,
      nama: formData.nama,
      jenis: formData.jenis,
      tanggalTanam: new Date(formData.tanggalTanam),
      status: formData.status,
      jumlah: formData.jumlah,
      ...(formData.varietas ? { varietas: formData.varietas } : {}),
      ...(formData.catatan ? { catatan: formData.catatan } : {}),
    };

    if (editingId) {
      await updateTanaman(editingId, data);
      setEditingId(null);
    } else {
      await addTanaman(data);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (item: typeof tanaman[0]) => {
    setFormData({
      lahanId: item.lahanId,
      nama: item.nama,
      jenis: item.jenis,
      varietas: item.varietas || '',
      tanggalTanam: item.tanggalTanam.toISOString().split('T')[0],
      status: item.status,
      jumlah: item.jumlah,
      catatan: item.catatan || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tanaman ini? Semua aktivitas juga akan dihapus.')) {
      await deleteTanaman(id);
    }
  };

  const resetForm = () => {
    setFormData({
      lahanId: '',
      nama: '',
      jenis: '',
      varietas: '',
      tanggalTanam: new Date().toISOString().split('T')[0],
      status: 'semai',
      jumlah: 1,
      catatan: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      semai: '🌱 Semai',
      tumbuh: '🌿 Tumbuh',
      berbunga: '🌸 Berbunga',
      berbuah: '🍎 Berbuah',
      panen: '🌾 Panen',
      gagal: '❌ Gagal',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      semai: '#8bc34a',
      tumbuh: '#4caf50',
      berbunga: '#e91e63',
      berbuah: '#ff9800',
      panen: '#795548',
      gagal: '#f44336',
    };
    return colors[status] || '#999';
  };

  const getLahanName = (lahanId: string) => {
    const found = lahan.find(l => l.id === lahanId);
    return found?.nama || 'Lahan tidak diketahui';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manajemen Tanaman</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn btn-primary"
        >
          <span>+</span>
          <span>Tambah Tanaman</span>
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingId ? 'Edit Tanaman' : 'Tambah Tanaman Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Lahan *</label>
                <select
                  value={formData.lahanId}
                  onChange={(e) => setFormData({ ...formData, lahanId: e.target.value })}
                  required
                >
                  <option value="">Pilih Lahan</option>
                  {lahan.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nama Tanaman *</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Tomat, Cabai"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jenis *</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    required
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="Sayur">🥬 Sayur</option>
                    <option value="Buah">🍎 Buah</option>
                    <option value="Hias">🌺 Hias</option>
                    <option value="Karnivora">🪴 Karnivora</option>
                    <option value="Lainnya">🌿 Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Varietas</label>
                  <input
                    type="text"
                    value={formData.varietas}
                    onChange={(e) => setFormData({ ...formData, varietas: e.target.value })}
                    placeholder="Contoh: F1, Lokal"
                  />
                </div>
                <div className="form-group">
                  <label>Tanggal Tanam *</label>
                  <input
                    type="date"
                    value={formData.tanggalTanam}
                    onChange={(e) => setFormData({ ...formData, tanggalTanam: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TanamanType['status'] })}
                    required
                  >
                    <option value="semai">Semai</option>
                    <option value="tumbuh">Tumbuh</option>
                    <option value="berbunga">Berbunga</option>
                    <option value="berbuah">Berbuah</option>
                    <option value="panen">Panen</option>
                    <option value="gagal">Gagal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Jumlah Tanaman *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan tambahan..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Tanaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tanaman.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <h3>Belum ada tanaman</h3>
          <p>Tambahkan tanaman pertama Anda untuk mulai mencatat aktivitas budidaya.</p>
        </div>
      ) : (
        <div className="tanaman-grid">
          {tanaman.map((item) => (
            <div key={item.id} className="tanaman-card">
              <div className="tanaman-header">
                <div className="tanaman-status" style={{ background: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>
                  {getStatusLabel(item.status)}
                </div>
                <div className="tanaman-actions">
                  <button onClick={() => handleEdit(item)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon" title="Hapus">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="tanaman-body">
                <h3>{item.nama}</h3>
                <p className="tanaman-jenis">{item.jenis} {item.varietas && `• ${item.varietas}`}</p>
                <div className="tanaman-info">
                  <span>📍 {getLahanName(item.lahanId)}</span>
                  <span>📅 {item.tanggalTanam.toLocaleDateString('id-ID')}</span>
                  <span>🔢 {item.jumlah} tanaman</span>
                </div>
                {item.catatan && (
                  <p className="tanaman-catatan">{item.catatan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
