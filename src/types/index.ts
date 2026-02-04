export interface User {
  uid: string;
  googleId: string;
  nama: string;
  email: string;
  foto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lahan {
  id: string;
  userId: string;
  nama: string;
  lokasi: string;
  luas?: number;
  satuan?: 'm2' | 'ha';
  catatan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tanaman {
  id: string;
  lahanId: string;
  userId: string;
  nama: string;
  jenis: string;
  varietas?: string;
  tanggalTanam: Date;
  status: 'semai' | 'tumbuh' | 'berbunga' | 'berbuah' | 'panen' | 'gagal';
  jumlah: number;
  foto?: string;
  catatan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JenisAktivitas = 
  | 'pemupukan'
  | 'penyemprotan_fungisida'
  | 'penyemprotan_insektisida'
  | 'penyiraman'
  | 'pangkas'
  | 'okulasi'
  | 'semai'
  | 'hama_penyakit'
  | 'panen'
  | 'lainnya';

export interface Aktivitas {
  id: string;
  tanamanId: string;
  lahanId: string;
  userId: string;
  jenis: JenisAktivitas;
  tanggal: Date;
  detail: {
    namaProduk?: string;
    dosis?: string;
    volume?: string;
    caraAplikasi?: string;
    hasil?: string;
    gejala?: string;
    tingkatSerangan?: 'ringan' | 'sedang' | 'berat';
    tindakan?: string;
    jumlahPanen?: number;
    satuanPanen?: string;
    kualitas?: 'baik' | 'sedang' | 'buruk';
  };
  biaya?: number;
  foto?: string[];
  cuaca?: 'cerah' | 'berawan' | 'hujan' | 'hujan_der' | 'mendung';
  catatan?: string;
  createdAt: Date;
  updatedAt: Date;
}
