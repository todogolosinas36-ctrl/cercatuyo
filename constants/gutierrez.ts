import gutierrezData from '../data/colectivos/gutierrez.json';

export type TipoDiaGutierrez = 'habiles' | 'sabados' | 'domingos';

export interface ServicioGutierrezIda {
  id: string;
  salidaTerminal?: string | null;
  salidaItaliaColon?: string;
  salidaConcepcion24Colon?: string;
  pasoTerminal?: string | null;
  llegadaTrinidad?: string | null;
  llegadaMedinas?: string | null;
  llegadaMonteagudo?: string | null;
  destinoFinal: string;
  nota?: string | null;
}

export interface ServicioGutierrezVuelta {
  id: string;
  salidaMonteagudo?: string | null;
  salidaMedinas?: string | null;
  salidaTrinidad?: string | null;
  pasoTrinidad?: string | null;
  llegadaConcepcion: string;
  llegadaTerminal?: string | null;
  destinoEspecial?: string | null;
  nota?: string | null;
}

export interface CuadroDiaGutierrez {
  ida: ServicioGutierrezIda[];
  vuelta: ServicioGutierrezVuelta[];
}

export interface CuadroGutierrez {
  empresa: string;
  linea: string;
  vigencia: string;
  tipoDia: string;
  ida: ServicioGutierrezIda[];
  vuelta: ServicioGutierrezVuelta[];
  habiles: CuadroDiaGutierrez;
  sabados: CuadroDiaGutierrez;
  domingos: CuadroDiaGutierrez;
}

export const GUTIERREZ_DATA: CuadroGutierrez = gutierrezData as unknown as CuadroGutierrez;
export default GUTIERREZ_DATA;
