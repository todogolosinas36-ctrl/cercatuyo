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
