export interface CategoriaOficio {
  id: string;
  nombre: string;
  icono: string; // Nombre del ícono de Ionicons
}

export interface Trabajador {
  id: string;
  nombre: string;
  categoriaId: string;
  telefono: string;
  ubicacion: string; // Ej: 'Monteros', 'Concepción', 'San Miguel de Tucumán'
  descripcion: string;
  fotos?: string[]; // Array opcional de URLs o rutas de imágenes
}

export const CATEGORIAS_OFICIOS: CategoriaOficio[] = [
  { id: 'carpinteria', nombre: 'Carpinteros', icono: 'hammer-outline' },
  { id: 'plomeria', nombre: 'Plomeros', icono: 'water-outline' },
  { id: 'electricidad', nombre: 'Electricistas', icono: 'flash-outline' },
  { id: 'albanileria', nombre: 'Albañiles', icono: 'construct-outline' },
  { id: 'refrigeracion', nombre: 'Refrigeración', icono: 'snow-outline' },
  { id: 'pintura', nombre: 'Pintores', icono: 'color-palette-outline' },
];

export const TRABAJADORES_OFICIOS: Trabajador[] = [
  {
    id: 'carp_1',
    nombre: 'Carlos Ruiz',
    categoriaId: 'carpinteria',
    telefono: '5493810000000',
    ubicacion: 'Monteros',
    descripcion: 'Muebles a medida en MDF y melamina. Restauración de muebles antiguos. Trabajos a domicilio en toda la zona sur.',
    fotos: [
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622372738946-647bf046522c?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    id: 'elec_1',
    nombre: 'Miguel Ángel',
    categoriaId: 'electricidad',
    telefono: '5493865000000',
    ubicacion: 'Concepción',
    descripcion: 'Instalaciones eléctricas, tableros, cableado, urgencias 24hs.',
    // Este no tiene fotos cargadas, para probar la vista opcional
  }
];

// Función para obtener las ciudades únicas donde hay trabajadores
export const obtenerCiudadesConOficios = (): string[] => {
  const ciudades = TRABAJADORES_OFICIOS.map(t => t.ubicacion);
  return [...new Set(ciudades)].sort();
};
