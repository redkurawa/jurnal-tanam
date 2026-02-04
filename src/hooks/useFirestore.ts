import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import type { Lahan, Tanaman, Aktivitas } from '../types';

// LAHAN (Field) Hooks
export function useLahan() {
  const { currentUser } = useAuth();
  const [lahan, setLahan] = useState<Lahan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      return () => {
        setLahan([]);
        setLoading(false);
      };
    }

    const q = query(
      collection(db, 'lahan'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lahanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Lahan[];
      // Sort by createdAt desc
      lahanData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setLahan(lahanData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const addLahan = async (data: Omit<Lahan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    await addDoc(collection(db, 'lahan'), {
      ...data,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateLahan = async (id: string, data: Partial<Lahan>) => {
    const lahanRef = doc(db, 'lahan', id);
    await updateDoc(lahanRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteLahan = async (id: string) => {
    // Delete all tanaman and aktivitas first
    const tanamanQuery = query(collection(db, 'tanaman'), where('lahanId', '==', id));
    const tanamanSnap = await getDocs(tanamanQuery);
    
    for (const tanamanDoc of tanamanSnap.docs) {
      // Delete aktivitas for this tanaman
      const aktivitasQuery = query(collection(db, 'aktivitas'), where('tanamanId', '==', tanamanDoc.id));
      const aktivitasSnap = await getDocs(aktivitasQuery);
      
      for (const aktivitasDoc of aktivitasSnap.docs) {
        await deleteDoc(doc(db, 'aktivitas', aktivitasDoc.id));
      }
      
      await deleteDoc(doc(db, 'tanaman', tanamanDoc.id));
    }
    
    await deleteDoc(doc(db, 'lahan', id));
  };

  return { lahan, loading, addLahan, updateLahan, deleteLahan };
}

// TANAMAN (Plant) Hooks
export function useTanaman(lahanId?: string) {
  const { currentUser } = useAuth();
  const [tanaman, setTanaman] = useState<Tanaman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      return () => {
        setTanaman([]);
        setLoading(false);
      };
    }

    let q;
    if (lahanId) {
      q = query(
        collection(db, 'tanaman'),
        where('lahanId', '==', lahanId)
      );
    } else {
      q = query(
        collection(db, 'tanaman'),
        where('userId', '==', currentUser.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tanamanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggalTanam: doc.data().tanggalTanam?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Tanaman[];
      // Sort by createdAt desc
      tanamanData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setTanaman(tanamanData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, lahanId]);

  const addTanaman = async (data: Omit<Tanaman, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    await addDoc(collection(db, 'tanaman'), {
      ...data,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateTanaman = async (id: string, data: Partial<Tanaman>) => {
    const tanamanRef = doc(db, 'tanaman', id);
    await updateDoc(tanamanRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTanaman = async (id: string) => {
    // Delete all aktivitas first
    const aktivitasQuery = query(collection(db, 'aktivitas'), where('tanamanId', '==', id));
    const aktivitasSnap = await getDocs(aktivitasQuery);
    
    for (const doc of aktivitasSnap.docs) {
      await deleteDoc(doc.ref);
    }
    
    await deleteDoc(doc(db, 'tanaman', id));
  };

  return { tanaman, loading, addTanaman, updateTanaman, deleteTanaman };
}

// AKTIVITAS (Activity) Hooks
export function useAktivitas(tanamanId?: string) {
  const { currentUser } = useAuth();
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      return () => {
        setAktivitas([]);
        setLoading(false);
      };
    }

    let q;
    if (tanamanId) {
      q = query(
        collection(db, 'aktivitas'),
        where('tanamanId', '==', tanamanId)
      );
    } else {
      q = query(
        collection(db, 'aktivitas'),
        where('userId', '==', currentUser.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const aktivitasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tanggal: doc.data().tanggal?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Aktivitas[];
      // Sort by tanggal desc (most recent first)
      aktivitasData.sort((a, b) => (b.tanggal?.getTime() || 0) - (a.tanggal?.getTime() || 0));
      setAktivitas(aktivitasData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, tanamanId]);

  const addAktivitas = async (data: Omit<Aktivitas, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    await addDoc(collection(db, 'aktivitas'), {
      ...data,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateAktivitas = async (id: string, data: Partial<Aktivitas>) => {
    const aktivitasRef = doc(db, 'aktivitas', id);
    await updateDoc(aktivitasRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteAktivitas = async (id: string) => {
    await deleteDoc(doc(db, 'aktivitas', id));
  };

  return { aktivitas, loading, addAktivitas, updateAktivitas, deleteAktivitas };
}
