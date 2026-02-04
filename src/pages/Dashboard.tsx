import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLahan, useTanaman, useAktivitas } from '../hooks/useFirestore';
import './Dashboard.css';
import type { Aktivitas } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { lahan, loading: loadingLahan } = useLahan();
  const { tanaman, loading: loadingTanaman } = useTanaman();
  const { aktivitas, loading: loadingAktivitas } = useAktivitas();
  const [selectedAktivitas, setSelectedAktivitas] = useState<Aktivitas | null>(null);

  const loading = loadingLahan || loadingTanaman || loadingAktivitas;

  const stats = {
    totalLahan: lahan.length,
    totalTanaman: tanaman.length,
    totalAktivitas: aktivitas.length,
    tanamanAktif: tanaman.filter(t => t.status !== 'gagal' && t.status !== 'panen').length,
  };

  const recentAktivitas = aktivitas.slice(0, 5);

  const getTanamanName = (tanamanId: string) => {
    const found = tanaman.find(t => t.id === tanamanId);
    return found?.nama || 'Tanaman';
  };

  const getLahanName = (lahanId: string) => {
    const found = lahan.find(l => l.id === lahanId);
    return found?.nama || 'Lahan';
  };

  const getJenisLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      pemupukan: 'Pemupukan',
      penyemprotan_fungisida: 'Fungisida',
      penyemprotan_insektisida: 'Insektisida',
      penyiraman: 'Penyiraman',
      pangkas: 'Pangkas',
      okulasi: 'Okulasi',
      semai: 'Semai',
      hama_penyakit: 'Hama/Penyakit',
      panen: 'Panen',
      lainnya: 'Lainnya',
    };
    return labels[jenis] || jenis;
  };

  const getJenisIcon = (jenis: string) => {
    const icons: Record<string, string> = {
      pemupukan: '💩',
      penyemprotan_fungisida: '🧪',
      penyemprotan_insektisida: '🦟',
      penyiraman: '💧',
      pangkas: '✂️',
      okulasi: '🔬',
      semai: '🌱',
      hama_penyakit: '🐛',
      panen: '🌾',
      lainnya: '📝',
    };
    return icons[jenis] || '📝';
  };

  const handleStatClick = (path: string) => {
    navigate(path);
  };

  const handleAktivitasClick = (item: Aktivitas) => {
    setSelectedAktivitas(item);
  };

  const handleStatusClick = () => {
    navigate('/tanaman');
  };

  const closeModal = () => {
    setSelectedAktivitas(null);
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
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => handleStatClick('/lahan')}>
          <div className="stat-icon">🏞️</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalLahan}</span>
            <span className="stat-label">Total Lahan</span>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => handleStatClick('/tanaman')}>
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalTanaman}</span>
            <span className="stat-label">Total Tanaman</span>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => handleStatClick('/tanaman')}>
          <div className="stat-icon">🌿</div>
          <div className="stat-content">
            <span className="stat-value">{stats.tanamanAktif}</span>
            <span className="stat-label">Tanaman Aktif</span>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => handleStatClick('/aktivitas')}>
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalAktivitas}</span>
            <span className="stat-label">Total Aktivitas</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2 className="section-title">Aktivitas Terbaru</h2>
          {recentAktivitas.length === 0 ? (
            <div className="empty-state-small">
              <p>Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentAktivitas.map((item) => (
                <div 
                  key={item.id} 
                  className="recent-item clickable"
                  onClick={() => handleAktivitasClick(item)}
                >
                  <div className="recent-icon">{getJenisIcon(item.jenis)}</div>
                  <div className="recent-content">
                    <p className="recent-title">
                      {getJenisLabel(item.jenis)} {getTanamanName(item.tanamanId)}
                    </p>
                    <p className="recent-meta">
                      {item.tanggal.toLocaleDateString('id-ID')} • {getLahanName(item.lahanId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Status Tanaman</h2>
          {tanaman.length === 0 ? (
            <div className="empty-state-small">
              <p>Belum ada tanaman</p>
            </div>
          ) : (
            <div className="status-list">
              {['semai', 'tumbuh', 'berbunga', 'berbuah', 'panen', 'gagal'].map((status) => {
                const count = tanaman.filter(t => t.status === status).length;
                if (count === 0) return null;
                return (
                  <div 
                    key={status} 
                    className="status-item clickable"
                    onClick={() => handleStatusClick()}
                  >
                    <span className="status-label">
                      {status === 'semai' && '🌱 Semai'}
                      {status === 'tumbuh' && '🌿 Tumbuh'}
                      {status === 'berbunga' && '🌸 Berbunga'}
                      {status === 'berbuah' && '🍎 Berbuah'}
                      {status === 'panen' && '🌾 Panen'}
                      {status === 'gagal' && '❌ Gagal'}
                    </span>
                    <span className="status-count">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Aktivitas */}
      {selectedAktivitas && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getJenisLabel(selectedAktivitas.jenis)} {getTanamanName(selectedAktivitas.tanamanId)}</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-info">
                <div className="detail-row">
                  <span className="detail-label">Tanggal:</span>
                  <span className="detail-value">{selectedAktivitas.tanggal.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lahan:</span>
                  <span className="detail-value">{getLahanName(selectedAktivitas.lahanId)}</span>
                </div>
                {selectedAktivitas.cuaca && (
                  <div className="detail-row">
                    <span className="detail-label">Cuaca:</span>
                    <span className="detail-value">{selectedAktivitas.cuaca}</span>
                  </div>
                )}
              </div>

              {selectedAktivitas.detail.namaProduk && (
                <div className="detail-section">
                  <h4>Produk</h4>
                  <p>{selectedAktivitas.detail.namaProduk}</p>
                </div>
              )}

              {(selectedAktivitas.detail.dosis || selectedAktivitas.detail.volume) && (
                <div className="detail-section">
                  <h4>Dosis & Volume</h4>
                  <p>
                    {selectedAktivitas.detail.dosis && `Dosis: ${selectedAktivitas.detail.dosis}`}
                    {selectedAktivitas.detail.dosis && selectedAktivitas.detail.volume && ' / '}
                    {selectedAktivitas.detail.volume && `Volume: ${selectedAktivitas.detail.volume}`}
                  </p>
                </div>
              )}

              {selectedAktivitas.detail.caraAplikasi && (
                <div className="detail-section">
                  <h4>Cara Aplikasi</h4>
                  <p>{selectedAktivitas.detail.caraAplikasi}</p>
                </div>
              )}

              {selectedAktivitas.detail.gejala && (
                <div className="detail-section">
                  <h4>Gejala</h4>
                  <p>{selectedAktivitas.detail.gejala}</p>
                </div>
              )}

              {selectedAktivitas.detail.tingkatSerangan && (
                <div className="detail-section">
                  <h4>Tingkat Serangan</h4>
                  <p className={`severity-${selectedAktivitas.detail.tingkatSerangan}`}>
                    {selectedAktivitas.detail.tingkatSerangan === 'ringan' && '🟢 Ringan'}
                    {selectedAktivitas.detail.tingkatSerangan === 'sedang' && '🟡 Sedang'}
                    {selectedAktivitas.detail.tingkatSerangan === 'berat' && '🔴 Berat'}
                  </p>
                </div>
              )}

              {selectedAktivitas.detail.tindakan && (
                <div className="detail-section">
                  <h4>Tindakan</h4>
                  <p>{selectedAktivitas.detail.tindakan}</p>
                </div>
              )}

              {(selectedAktivitas.detail.jumlahPanen || selectedAktivitas.detail.kualitas) && (
                <div className="detail-section">
                  <h4>Hasil Panen</h4>
                  <p>
                    {selectedAktivitas.detail.jumlahPanen && 
                      `Jumlah: ${selectedAktivitas.detail.jumlahPanen} ${selectedAktivitas.detail.satuanPanen || ''}`}
                    {selectedAktivitas.detail.kualitas && 
                      ` (Kualitas: ${selectedAktivitas.detail.kualitas})`}
                  </p>
                </div>
              )}

              {selectedAktivitas.detail.hasil && (
                <div className="detail-section">
                  <h4>Hasil / Evaluasi</h4>
                  <p>{selectedAktivitas.detail.hasil}</p>
                </div>
              )}

              {selectedAktivitas.biaya && (
                <div className="detail-section">
                  <h4>Biaya</h4>
                  <p className="detail-biaya">Rp {selectedAktivitas.biaya.toLocaleString('id-ID')}</p>
                </div>
              )}

              {selectedAktivitas.catatan && (
                <div className="detail-section">
                  <h4>Catatan</h4>
                  <p>{selectedAktivitas.catatan}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
