import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIAS_OFICIOS, TRABAJADORES_OFICIOS, CategoriaOficio, Trabajador } from '../data/oficios';

interface OficiosContextType {
  categorias: CategoriaOficio[];
  trabajadores: Trabajador[];
  agregarTrabajador: (t: Trabajador) => void;
  eliminarTrabajador: (id: string) => void;
  agregarCategoria: (c: CategoriaOficio) => void;
  eliminarCategoria: (id: string) => void;
  cargando: boolean; // Para saber si ya leímos de la memoria
  limpiarMemoria: () => void;
  restaurarPrueba: () => void;
}

const OficiosContext = createContext<OficiosContextType | undefined>(undefined);

const TRABAJADORES_STORAGE_KEY = '@CercaTuyo_Trabajadores';

export const OficiosProvider = ({ children }: { children: React.ReactNode }) => {
  const [categorias, setCategorias] = useState<CategoriaOficio[]>(CATEGORIAS_OFICIOS);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. Cargar trabajadores guardados al iniciar la app
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem(TRABAJADORES_STORAGE_KEY);
        if (datosGuardados) {
          setTrabajadores(JSON.parse(datosGuardados));
        } else {
          // Si es la primera vez, cargamos los de prueba
          setTrabajadores(TRABAJADORES_OFICIOS);
        }
      } catch (error) {
        console.error("Error cargando trabajadores", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // 2. Guardar en memoria cada vez que el array de trabajadores cambia
  useEffect(() => {
    // Evitamos guardar un array vacío mientras está cargando
    if (!cargando) {
      AsyncStorage.setItem(TRABAJADORES_STORAGE_KEY, JSON.stringify(trabajadores))
        .catch(err => console.error("Error guardando trabajadores", err));
    }
  }, [trabajadores, cargando]);

  const agregarTrabajador = (t: Trabajador) => {
    setTrabajadores(prev => [...prev, t]);
  };
  
  const eliminarTrabajador = (id: string) => {
    setTrabajadores(prev => prev.filter(t => t.id !== id));
  };
  
  const agregarCategoria = (c: CategoriaOficio) => setCategorias([...categorias, c]);
  const eliminarCategoria = (id: string) => setCategorias(categorias.filter(c => c.id !== id));

  const limpiarMemoria = async () => {
    try {
      await AsyncStorage.removeItem(TRABAJADORES_STORAGE_KEY);
      setTrabajadores([]);
    } catch(e) { console.error(e); }
  };

  const restaurarPrueba = () => {
    setTrabajadores(TRABAJADORES_OFICIOS);
  };

  return (
    <OficiosContext.Provider value={{ categorias, trabajadores, agregarTrabajador, eliminarTrabajador, agregarCategoria, eliminarCategoria, cargando, limpiarMemoria, restaurarPrueba }}>
      {children}
    </OficiosContext.Provider>
  );
};

export const useOficios = () => {
  const context = useContext(OficiosContext);
  if (!context) throw new Error('useOficios debe usarse dentro de OficiosProvider');
  return context;
};
