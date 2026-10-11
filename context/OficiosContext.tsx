import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CATEGORIAS_OFICIOS, CategoriaOficio, Trabajador } from '../data/oficios';

interface OficiosContextType {
  categorias: CategoriaOficio[];
  trabajadores: Trabajador[];
  agregarTrabajador: (t: Trabajador) => void;
  eliminarTrabajador: (id: string) => Promise<void> | void;
  agregarCategoria: (c: CategoriaOficio) => void;
  eliminarCategoria: (id: string) => void;
  cargando: boolean;
  limpiarMemoria?: () => void;
  restaurarPrueba?: () => void;
}

const OficiosContext = createContext<OficiosContextType | undefined>(undefined);

export const OficiosProvider = ({ children }: { children: React.ReactNode }) => {
  const [categorias, setCategorias] = useState<CategoriaOficio[]>(CATEGORIAS_OFICIOS);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);

  // Escuchar los oficios de Firebase en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'oficios'),
      (snapshot) => {
        const lista: Trabajador[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          lista.push({
            id: docSnap.id,
            nombre: data.nombre || '',
            categoriaId: data.categoriaId || '',
            telefono: data.telefono || '',
            ubicacion: data.ubicacion || '',
            descripcion: data.descripcion || '',
            fotos: data.fotos || [],
          });
        });
        setTrabajadores(lista);
        setCargando(false);
      },
      (error) => {
        console.error('Error escuchando colección de oficios en Firestore:', error);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const agregarTrabajador = (t: Trabajador) => {
    setTrabajadores((prev) => (prev.some((item) => item.id === t.id) ? prev : [...prev, t]));
  };

  const eliminarTrabajador = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'oficios', id));
    } catch (error) {
      console.error('Error al eliminar oficio de Firestore:', error);
      throw error;
    }
  };

  const agregarCategoria = (c: CategoriaOficio) => setCategorias((prev) => [...prev, c]);
  const eliminarCategoria = (id: string) => setCategorias((prev) => prev.filter((c) => c.id !== id));

  const limpiarMemoria = () => {};
  const restaurarPrueba = () => {};

  return (
    <OficiosContext.Provider
      value={{
        categorias,
        trabajadores,
        agregarTrabajador,
        eliminarTrabajador,
        agregarCategoria,
        eliminarCategoria,
        cargando,
        limpiarMemoria,
        restaurarPrueba,
      }}
    >
      {children}
    </OficiosContext.Provider>
  );
};

export const useOficios = () => {
  const context = useContext(OficiosContext);
  if (!context) throw new Error('useOficios debe usarse dentro de OficiosProvider');
  return context;
};

