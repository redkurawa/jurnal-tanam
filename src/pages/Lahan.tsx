import { useState } from 'react';
import { useLahan } from '../hooks/useFirestore';
import type { Lahan as LahanType } from '../types';
import './Lahan.css';

export default function Lahan() {
  const { lahan, loading, addLahan, updateLahan, deleteLahan } = useLahan();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    lokasi: '',
    luas: '',
    satuan: 'm2' as 'm2' | 'ha',
    catatan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: Omit<LahanType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      nama: formData.nama,
      lokasi: formData.lokasi,
      satuan: formData.satuan,
      ...(formData.luas ? { luas: parseFloat(formData.luas) } : {}),
      ...(formData.catatan ? { catatan: formData.catatan } : {}),
    };

    if (editingId) {
      await updateLahan(editingId, data);
      setEditingId(null);
    } else {
      await addLahan(data);
    }

    setFormData({ nama: '', lokasi: '', luas: '', satuan: 'm2', catatan: '' });
    setShowForm(false);
  };

  const handleEdit = (item: typeof lahan[0]) => {
    setFormData({
      nama: item.nama,
      lokasi: item.lokasi,
      luas: item.luas?.toString() || '',
      satuan: item.satuan || 'm2',
      catatan: item.catatan || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus lahan ini? Semua tanaman dan aktivitas di lahan ini juga akan dihapus.')) {
      await deleteLahan(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nama: '', lokasi: '', luas: '', satuan: 'm2', catatan: '' });
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
        <h1 className="page-title">Manajemen Lahan</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn btn-primary"
        >
          <span>+</span>
          <span>Tambah Lahan</span>
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? 'Edit Lahan' : 'Tambah Lahan Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Lahan *</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Lahan A, Kebun Belakang"
                  required
                />
              </div>

              <div className="form-group">
                <label>Lokasi *</label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Contoh: Desa X, Kecamatan Y"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Luas</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.luas}
                    onChange={(e) => setFormData({ ...formData, luas: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Satuan</label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value as 'm2' | 'ha' })}
                  >
                    <option value="m2">m²</option>
                    <option value="ha">Hektar</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan tambahan tentang lahan..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Lahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lahan.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏞️</span>
          <h3>Belum ada lahan</h3>
          <p>Tambahkan lahan pertama Anda untuk mulai mencatat aktivitas budidaya.</p>
        </div>
      ) : (
        <div className="lahan-grid">
          {lahan.map((item) => (
            <div key={item.id} className="lahan-card">
              <div className="lahan-header">
                <h3>{item.nama}</h3>
                <div className="lahan-actions">
                  <button onClick={() => handleEdit(item)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon" title="Hapus">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="lahan-body">
                <p className="lahan-lokasi">
                  <span>📍</span>
                  {item.lokasi}
                </p>
                {item.luas && (
                  <p className="lahan-luas">
                    <span>📐</span>
                    {item.luas} {item.satuan}
                  </p>
                )}
                {item.catatan && (
                  <p className="lahan-catatan">{item.catatan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
