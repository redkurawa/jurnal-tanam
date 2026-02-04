import { useState } from 'react';
import { useLahan, useTanaman, useAktivitas } from '../hooks/useFirestore';
import type { Aktivitas as AktivitasType, JenisAktivitas } from '../types';
import './Aktivitas.css';

const jenisAktivitasOptions: { value: JenisAktivitas; label: string; icon: string }[] = [
  { value: 'pemupukan', label: 'Pemupukan', icon: '💩' },
  { value: 'penyemprotan_fungisida', label: 'Fungisida', icon: '🧪' },
  { value: 'penyemprotan_insektisida', label: 'Insektisida', icon: '🦟' },
  { value: 'penyiraman', label: 'Penyiraman', icon: '💧' },
  { value: 'pangkas', label: 'Pangkas', icon: '✂️' },
  { value: 'okulasi', label: 'Okulasi', icon: '🔬' },
  { value: 'semai', label: 'Semai', icon: '🌱' },
  { value: 'hama_penyakit', label: 'Hama/Penyakit', icon: '🐛' },
  { value: 'panen', label: 'Panen', icon: '🌾' },
  { value: 'lainnya', label: 'Lainnya', icon: '📝' },
];

const cuacaOptions = [
  { value: 'cerah', label: 'Cerah', icon: '☀️' },
  { value: 'berawan', label: 'Berawan', icon: '⛅' },
  { value: 'mendung', label: 'Mendung', icon: '☁️' },
  { value: 'hujan', label: 'Hujan', icon: '🌧️' },
  { value: 'hujan_der', label: 'Hujan Deras', icon: '⛈️' },
];

export default function Aktivitas() {
  const { lahan } = useLahan();
  const { tanaman } = useTanaman();
  const { aktivitas, loading, addAktivitas, updateAktivitas, deleteAktivitas } = useAktivitas();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jenisAktivitas, setJenisAktivitas] = useState<JenisAktivitas>('pemupukan');
  
  const [formData, setFormData] = useState({
    lahanId: '',
    tanamanId: '',
    jenis: 'pemupukan' as JenisAktivitas,
    tanggal: new Date().toISOString().split('T')[0],
    namaProduk: '',
    dosis: '',
    volume: '',
    caraAplikasi: '',
    caraAplikasiLainnya: '',
    hasil: '',
    gejala: '',
    tingkatSerangan: 'ringan' as 'ringan' | 'sedang' | 'berat',
    tindakan: '',
    jumlahPanen: '',
    satuanPanen: 'kg',
    kualitas: 'baik' as 'baik' | 'sedang' | 'buruk',
    biaya: '',
    cuaca: '' as typeof cuacaOptions[0]['value'] | '',
    catatan: '',
  });

  const getFilteredTanaman = (lahanId: string) => {
    if (!lahanId) return tanaman;
    return tanaman.filter(t => t.lahanId === lahanId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const detail: AktivitasType['detail'] = {};
    
    if (['pemupukan', 'penyemprotan_fungisida', 'penyemprotan_insektisida'].includes(formData.jenis)) {
      if (formData.namaProduk) detail.namaProduk = formData.namaProduk;
      if (formData.dosis) detail.dosis = formData.dosis;
      if (formData.volume) detail.volume = formData.volume;
      // Combine caraAplikasi dropdown with custom text if "lainnya" selected
      if (formData.caraAplikasi) {
        if (formData.caraAplikasi === 'lainnya' && formData.caraAplikasiLainnya) {
          detail.caraAplikasi = formData.caraAplikasiLainnya;
        } else if (formData.caraAplikasi !== 'lainnya') {
          detail.caraAplikasi = formData.caraAplikasi;
        }
      }
    }
    
    if (['pemupukan', 'penyemprotan_fungisida', 'penyemprotan_insektisida', 'penyiraman', 'pangkas', 'okulasi', 'semai'].includes(formData.jenis)) {
      if (formData.hasil) detail.hasil = formData.hasil;
    }
    
    if (formData.jenis === 'hama_penyakit') {
      if (formData.gejala) detail.gejala = formData.gejala;
      detail.tingkatSerangan = formData.tingkatSerangan;
      if (formData.tindakan) detail.tindakan = formData.tindakan;
    }
    
    if (formData.jenis === 'panen') {
      if (formData.jumlahPanen) detail.jumlahPanen = parseFloat(formData.jumlahPanen);
      if (formData.satuanPanen) detail.satuanPanen = formData.satuanPanen;
      detail.kualitas = formData.kualitas;
    }

    const data: Omit<AktivitasType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      tanamanId: formData.tanamanId,
      lahanId: formData.lahanId,
      jenis: formData.jenis,
      tanggal: new Date(formData.tanggal),
      detail,
      foto: [],
      ...(formData.biaya ? { biaya: parseFloat(formData.biaya) } : {}),
      ...(formData.cuaca ? { cuaca: formData.cuaca as AktivitasType['cuaca'] } : {}),
      ...(formData.catatan ? { catatan: formData.catatan } : {}),
    };

    if (editingId) {
      await updateAktivitas(editingId, data);
      setEditingId(null);
    } else {
      await addAktivitas(data);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (item: typeof aktivitas[0]) => {
    const caraAplikasiValue = item.detail.caraAplikasi || '';
    const isStandardMethod = ['kocor', 'spray'].includes(caraAplikasiValue.toLowerCase());
    
    setFormData({
      lahanId: item.lahanId,
      tanamanId: item.tanamanId,
      jenis: item.jenis,
      tanggal: item.tanggal.toISOString().split('T')[0],
      namaProduk: item.detail.namaProduk || '',
      dosis: item.detail.dosis || '',
      volume: item.detail.volume || '',
      caraAplikasi: isStandardMethod ? caraAplikasiValue.toLowerCase() : (caraAplikasiValue ? 'lainnya' : ''),
      caraAplikasiLainnya: isStandardMethod ? '' : caraAplikasiValue,
      hasil: item.detail.hasil || '',
      gejala: item.detail.gejala || '',
      tingkatSerangan: item.detail.tingkatSerangan || 'ringan',
      tindakan: item.detail.tindakan || '',
      jumlahPanen: item.detail.jumlahPanen?.toString() || '',
      satuanPanen: item.detail.satuanPanen || 'kg',
      kualitas: item.detail.kualitas || 'baik',
      biaya: item.biaya?.toString() || '',
      cuaca: item.cuaca || '',
      catatan: item.catatan || '',
    });
    setJenisAktivitas(item.jenis);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus aktivitas ini?')) {
      await deleteAktivitas(id);
    }
  };

  const resetForm = () => {
    setFormData({
      lahanId: '',
      tanamanId: '',
      jenis: 'pemupukan',
      tanggal: new Date().toISOString().split('T')[0],
      namaProduk: '',
      dosis: '',
      volume: '',
      caraAplikasi: '',
      caraAplikasiLainnya: '',
      hasil: '',
      gejala: '',
      tingkatSerangan: 'ringan',
      tindakan: '',
      jumlahPanen: '',
      satuanPanen: 'kg',
      kualitas: 'baik',
      biaya: '',
      cuaca: '',
      catatan: '',
    });
    setJenisAktivitas('pemupukan');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const getLahanName = (lahanId: string) => {
    const found = lahan.find(l => l.id === lahanId);
    return found?.nama || 'Lahan tidak diketahui';
  };

  const getTanamanName = (tanamanId: string) => {
    const found = tanaman.find(t => t.id === tanamanId);
    return found?.nama || 'Tanaman tidak diketahui';
  };

  const getJenisLabel = (jenis: string) => {
    const found = jenisAktivitasOptions.find(j => j.value === jenis);
    return found ? `${found.icon} ${found.label}` : jenis;
  };

  const renderFormFields = () => {
    switch (jenisAktivitas) {
      case 'pemupukan':
      case 'penyemprotan_fungisida':
      case 'penyemprotan_insektisida':
        return (
          <>
            <div className="form-group">
              <label>Nama Produk</label>
              <input
                type="text"
                value={formData.namaProduk}
                onChange={(e) => setFormData({ ...formData, namaProduk: e.target.value })}
                placeholder="Contoh: NPK 16-16-16, Dithane M-45"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dosis</label>
                <input
                  type="text"
                  value={formData.dosis}
                  onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                  placeholder="Contoh: 2 g/liter"
                />
              </div>
              <div className="form-group">
                <label>Volume</label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="Contoh: 10 liter"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cara Aplikasi</label>
              <select
                value={formData.caraAplikasi}
                onChange={(e) => setFormData({ ...formData, caraAplikasi: e.target.value, caraAplikasiLainnya: '' })}
              >
                <option value="">Pilih Cara Aplikasi</option>
                <option value="kocor">Kocor</option>
                <option value="spray">Spray</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            {formData.caraAplikasi === 'lainnya' && (
              <div className="form-group">
                <label>Cara Aplikasi Lainnya</label>
                <input
                  type="text"
                  value={formData.caraAplikasiLainnya}
                  onChange={(e) => setFormData({ ...formData, caraAplikasiLainnya: e.target.value })}
                  placeholder="Contoh: Tabur, Injeksi, dll"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Hasil/Evaluasi</label>
              <textarea
                value={formData.hasil}
                onChange={(e) => setFormData({ ...formData, hasil: e.target.value })}
                placeholder="Bagaimana hasilnya?"
                rows={2}
              />
            </div>
          </>
        );
      
      case 'penyiraman':
      case 'pangkas':
      case 'okulasi':
      case 'semai':
        return (
          <div className="form-group">
            <label>Hasil/Evaluasi</label>
            <textarea
              value={formData.hasil}
              onChange={(e) => setFormData({ ...formData, hasil: e.target.value })}
              placeholder="Bagaimana hasilnya?"
              rows={3}
            />
          </div>
        );
      
      case 'hama_penyakit':
        return (
          <>
            <div className="form-group">
              <label>Gejala yang Ditemukan</label>
              <textarea
                value={formData.gejala}
                onChange={(e) => setFormData({ ...formData, gejala: e.target.value })}
                placeholder="Deskripsikan gejala yang ditemukan..."
                rows={3}
                required
              />
            </div>
            <div className="form-group">
              <label>Tingkat Serangan</label>
              <select
                value={formData.tingkatSerangan}
                onChange={(e) => setFormData({ ...formData, tingkatSerangan: e.target.value as typeof formData.tingkatSerangan })}
              >
                <option value="ringan">Ringan</option>
                <option value="sedang">Sedang</option>
                <option value="berat">Berat</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tindakan yang Dilakukan</label>
              <textarea
                value={formData.tindakan}
                onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
                placeholder="Tindakan penanganan yang dilakukan..."
                rows={2}
              />
            </div>
          </>
        );
      
      case 'panen':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Panen</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.jumlahPanen}
                  onChange={(e) => setFormData({ ...formData, jumlahPanen: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Satuan</label>
                <select
                  value={formData.satuanPanen}
                  onChange={(e) => setFormData({ ...formData, satuanPanen: e.target.value })}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="buah">Buah</option>
                  <option value="ikat">Ikat</option>
                  <option value="keranjang">Keranjang</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Kualitas Hasil</label>
              <select
                value={formData.kualitas}
                onChange={(e) => setFormData({ ...formData, kualitas: e.target.value as typeof formData.kualitas })}
              >
                <option value="baik">Baik</option>
                <option value="sedang">Sedang</option>
                <option value="buruk">Buruk</option>
              </select>
            </div>
          </>
        );
      
      default:
        return null;
    }
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
        <h1 className="page-title">Catat Aktivitas</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn btn-primary"
        >
          <span>+</span>
          <span>Tambah Aktivitas</span>
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <h2>{editingId ? 'Edit Aktivitas' : 'Catat Aktivitas Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="jenis-selector">
                {jenisAktivitasOptions.map((jenis) => (
                  <button
                    key={jenis.value}
                    type="button"
                    className={`jenis-btn ${jenisAktivitas === jenis.value ? 'active' : ''}`}
                    onClick={() => {
                      setJenisAktivitas(jenis.value);
                      setFormData({ ...formData, jenis: jenis.value });
                    }}
                  >
                    <span>{jenis.icon}</span>
                    <span>{jenis.label}</span>
                  </button>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lahan *</label>
                  <select
                    value={formData.lahanId}
                    onChange={(e) => {
                      setFormData({ ...formData, lahanId: e.target.value, tanamanId: '' });
                    }}
                    required
                  >
                    <option value="">Pilih Lahan</option>
                    {lahan.map((l) => (
                      <option key={l.id} value={l.id}>{l.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tanaman *</label>
                  <select
                    value={formData.tanamanId}
                    onChange={(e) => setFormData({ ...formData, tanamanId: e.target.value })}
                    required
                    disabled={!formData.lahanId}
                  >
                    <option value="">Pilih Tanaman</option>
                    {getFilteredTanaman(formData.lahanId).map((t) => (
                      <option key={t.id} value={t.id}>{t.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal *</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cuaca</label>
                  <select
                    value={formData.cuaca}
                    onChange={(e) => setFormData({ ...formData, cuaca: e.target.value })}
                  >
                    <option value="">Pilih Cuaca</option>
                    {cuacaOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {renderFormFields()}

              <div className="form-group">
                <label>Biaya (Opsional)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.biaya}
                  onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                  placeholder="Rp 0"
                />
              </div>

              <div className="form-group">
                <label>Catatan Tambahan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {aktivitas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>Belum ada aktivitas</h3>
          <p>Mulai catat aktivitas budidaya Anda sekarang.</p>
        </div>
      ) : (
        <div className="aktivitas-list">
          {aktivitas.map((item) => (
            <div key={item.id} className="aktivitas-card">
              <div className="aktivitas-header">
                <div className="aktivitas-jenis">
                  {getJenisLabel(item.jenis)}
                </div>
                <div className="aktivitas-actions">
                  <button onClick={() => handleEdit(item)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon" title="Hapus">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="aktivitas-body">
                <div className="aktivitas-info">
                  <span>📅 {item.tanggal.toLocaleDateString('id-ID')}</span>
                  <span>🌱 {getTanamanName(item.tanamanId)}</span>
                  <span>📍 {getLahanName(item.lahanId)}</span>
                  {item.cuaca && (
                    <span>
                      {cuacaOptions.find(c => c.value === item.cuaca)?.icon} {cuacaOptions.find(c => c.value === item.cuaca)?.label}
                    </span>
                  )}
                </div>
                
                {item.detail.namaProduk && (
                  <p className="aktivitas-detail"><strong>Produk:</strong> {item.detail.namaProduk}</p>
                )}
                {(item.detail.dosis || item.detail.volume) && (
                  <p className="aktivitas-detail">
                    <strong>Dosis:</strong> {item.detail.dosis} {item.detail.volume && `/ ${item.detail.volume}`}
                  </p>
                )}
                {item.detail.gejala && (
                  <p className="aktivitas-detail"><strong>Gejala:</strong> {item.detail.gejala}</p>
                )}
                {item.detail.tingkatSerangan && (
                  <p className="aktivitas-detail">
                    <strong>Tingkat Serangan:</strong> {item.detail.tingkatSerangan}
                  </p>
                )}
                {item.detail.jumlahPanen && (
                  <p className="aktivitas-detail">
                    <strong>Panen:</strong> {item.detail.jumlahPanen} {item.detail.satuanPanen} ({item.detail.kualitas})
                  </p>
                )}
                {item.detail.hasil && (
                  <p className="aktivitas-hasil">{item.detail.hasil}</p>
                )}
                {item.biaya && (
                  <p className="aktivitas-biaya">Biaya: Rp {item.biaya.toLocaleString('id-ID')}</p>
                )}
                {item.catatan && (
                  <p className="aktivitas-catatan">{item.catatan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
