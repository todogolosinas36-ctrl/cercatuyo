import gutierrezData from '../data/colectivos/gutierrez.json';

export interface ServicioGutierrezIda {
  id: string;
  salidaTerminal: string | null;
  salidaItaliaColon: string;
  pasoTerminal: string | null;
  llegadaTrinidad: string | null;
  llegadaMedinas: string | null;
  llegadaMonteagudo: string | null;
  destinoFinal: string;
  nota: string | null;
}

export interface ServicioGutierrezVuelta {
  id: string;
  salidaMonteagudo: string | null;
  salidaMedinas: string | null;
  salidaTrinidad: string | null;
  llegadaConcepcion: string;
  llegadaTerminal: string | null;
  destinoEspecial: string | null;
  nota: string | null;
}

export interface CuadroGutierrez {
  empresa: string;
  linea: string;
  vigencia: string;
  tipoDia: string;
  ida: ServicioGutierrezIda[];
  vuelta: ServicioGutierrezVuelta[];
}

export const GUTIERREZ_DATA: CuadroGutierrez = gutierrezData as CuadroGutierrez;
export default GUTIERREZ_DATA;
