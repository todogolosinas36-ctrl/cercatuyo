import gutierrezData from '../data/colectivos/gutierrez.json';
import gutierrezAlpachiriData from '../data/colectivos/gutierrez-alpachiri.json';
import gutierrezSarmientosData from '../data/colectivos/gutierrez-sarmientos.json';
import gutierrezAgudosData from '../data/colectivos/gutierrez-agudos.json';

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

// ===== Ramal Alpachiri / Piedra Grande =====
export type RamalGutierrez = 'medinas' | 'alpachiri' | 'sarmientos' | 'agudos';

export interface ServicioAlpachiriIda {
  id: string;
  salidaTerminal?: string | null;
  salidaItaliaColon: string;
  llegadaMolino: string;
  llegadaAlpachiri: string;
  destinoFinal: string;
  badge?: string | null;
  nota?: string | null;
}

export interface ServicioAlpachiriVuelta {
  id: string;
  salidaOrigen?: string | null;
  salidaAlpachiri: string;
  salidaMolino?: string | null;
  recorrido?: string | null;
  llegadaConcepcion: string;
  badge?: string | null;
  nota?: string | null;
}

export interface CuadroDiaAlpachiri {
  ida: ServicioAlpachiriIda[];
  vuelta: ServicioAlpachiriVuelta[];
}

export interface CuadroAlpachiri {
  empresa: string;
  ramal: string;
  linea: string;
  vigencia: string;
  habiles: CuadroDiaAlpachiri;
  sabados: CuadroDiaAlpachiri;
  domingos: CuadroDiaAlpachiri;
}

export const GUTIERREZ_ALPACHIRI_DATA: CuadroAlpachiri =
  gutierrezAlpachiriData as unknown as CuadroAlpachiri;

// ===== Ramal Aguilares / Los Sarmientos / Monte Bello =====
// Ida (hábiles/sábados): salidaColonItalia, salidaTerminalConcep, pasoAguilares, llegadaSarmientos, llegadaMonteBello
// Ida (domingos): salidaAguilares, llegadaSarmientos, llegadaMonteBello
// Los horarios pueden llevar un flag: T / T.A (Terminal Aguilares), T.C (Terminal Concepción), B.M (Esc. Benjamín Matienzo)
export interface ServicioSarmientosIda {
  id: string;
  salidaColonItalia?: string | null;
  salidaTerminalConcep?: string | null;
  pasoAguilares?: string | null;
  salidaAguilares?: string | null;
  llegadaSarmientos?: string | null;
  llegadaMonteBello?: string | null;
  badge?: string | null;
  nota?: string | null;
}

// Vuelta (hábiles/sábados): salidaMonteBello, salidaSarmientos, salidaAguilares, llegadaConcepcion
// Vuelta (domingos): salidaMonteBello, llegadaSarmientos, llegadaAguilares
export interface ServicioSarmientosVuelta {
  id: string;
  salidaMonteBello?: string | null;
  salidaSarmientos?: string | null;
  salidaAguilares?: string | null;
  llegadaSarmientos?: string | null;
  llegadaAguilares?: string | null;
  llegadaConcepcion?: string | null;
  badge?: string | null;
  nota?: string | null;
}

export interface CuadroDiaSarmientos {
  ida: ServicioSarmientosIda[];
  vuelta: ServicioSarmientosVuelta[];
}

export interface CuadroSarmientos {
  empresa: string;
  ramal: string;
  linea: string;
  vigencia: string;
  habiles: CuadroDiaSarmientos;
  sabados: CuadroDiaSarmientos;
  domingos: CuadroDiaSarmientos;
}

export const GUTIERREZ_SARMIENTOS_DATA: CuadroSarmientos =
  gutierrezSarmientosData as unknown as CuadroSarmientos;

// ===== Ramal Los Agudos / Aguilares =====
export interface ServicioAgudosHaciaAguilares {
  id: string;
  salidaConcepcion?: string | null;
  salidaLosAgudos?: string | null;
  pasoEntradaMedinas?: string | null;
  llegadaAguilares: string;
  dias: string;
  badge: string;
  nota: string;
}

export interface ServicioAgudosDesdeAguilares {
  id: string;
  salidaAguilares: string;
  pasoEntradaMedinas?: string | null;
  llegadaLosAgudos?: string | null;
  llegadaConcepcion?: string | null;
  dias: string;
  badge: string;
  nota: string;
}

export interface CuadroAgudos {
  empresa: string;
  ramal: string;
  linea: string;
  vigencia: string;
  diasOperacion: string;
  notaConcepcion: string;
  haciaAguilares: ServicioAgudosHaciaAguilares[];
  desdeAguilares: ServicioAgudosDesdeAguilares[];
}

export const GUTIERREZ_AGUDOS_DATA: CuadroAgudos =
  gutierrezAgudosData as unknown as CuadroAgudos;
