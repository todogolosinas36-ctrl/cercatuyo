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

export const TRABAJADORES_PRUEBA: Trabajador[] = [
  {
    id: 'prueba_carp_1',
    nombre: 'Carlos Ruiz',
    categoriaId: 'carpinteria',
    telefono: '5493810000000',
    ubicacion: 'Monteros',
    descripcion: 'Muebles a medida en MDF y melamina. Restauración de muebles antiguos. Trabajos a domicilio en toda la zona sur.',
    fotos: [
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop',
    ],
  },
  {
    id: 'prueba_elec_1',
    nombre: 'Miguel Ángel',
    categoriaId: 'electricidad',
    telefono: '5493865000000',
    ubicacion: 'Concepción',
    descripcion: 'Instalaciones eléctricas, tableros, cableado, urgencias 24hs.',
  },
  {
    id: 'prueba_plom_1',
    nombre: 'Roberto Gómez',
    categoriaId: 'plomeria',
    telefono: '5493865111111',
    ubicacion: 'Aguilares',
    descripcion: 'Reparaciones sanitarias, destapes de cañerías, bombas de agua y termotanques.',
  },
  {
    id: 'prueba_alb_1',
    nombre: 'Marcos Benítez',
    categoriaId: 'albanileria',
    telefono: '5493815222222',
    ubicacion: 'San Miguel de Tucumán',
    descripcion: 'Contrapisos, revoques, colocación de cerámicos y porcelanatos.',
  },
];

