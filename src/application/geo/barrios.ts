// Barrios tradicionales del Centro Histórico de Puebla considerados por el
// programa "Mi Barrio, Mi Patrimonio". El sistema detecta "solito" a qué
// barrio pertenece una escuela a partir de sus coordenadas (lat, lng),
// asignándola al barrio cuyo CENTRO esté más cerca, dentro de un radio máximo.
//
// Este enfoque (centroide + radio) evita dibujar fronteras y es fácil de
// ajustar: si un barrio queda mal ubicado, solo se corrige su lat/lng aquí.
// Las coordenadas son APROXIMADAS (referencia: el templo/plaza del barrio).

export interface Barrio {
  readonly nombre: string;
  readonly lat: number;
  readonly lng: number;
}

export const BARRIOS: ReadonlyArray<Barrio> = [
  { nombre: "Analco", lat: 19.0388, lng: -98.1862 },
  { nombre: "El Alto", lat: 19.0512, lng: -98.1903 },
  { nombre: "Xanenetla", lat: 19.0495, lng: -98.1846 },
  { nombre: "La Luz", lat: 19.0438, lng: -98.1852 },
  { nombre: "San Miguelito", lat: 19.0378, lng: -98.2028 },
  { nombre: "San Pablo de los Frailes", lat: 19.0492, lng: -98.1968 },
];

// Lista de nombres, para validar el DTO y poblar el desplegable del formulario.
export const BARRIO_NOMBRES: ReadonlyArray<string> = BARRIOS.map((b) => b.nombre);

// Radio máximo (km) para considerar que una escuela pertenece a un barrio.
const RADIO_MAX_KM = 0.6;

// Distancia aproximada en km entre dos coordenadas (equirectangular: exacta
// para distancias cortas como las de una ciudad).
function distanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const grados = Math.PI / 180;
  const x = (lng2 - lng1) * Math.cos(((lat1 + lat2) / 2) * grados);
  const y = lat2 - lat1;
  return Math.sqrt(x * x + y * y) * 111.32;
}

// Devuelve el nombre del barrio más cercano dentro del radio, o null si la
// escuela está fuera del Centro Histórico (no pertenece a ningún barrio).
export function detectarBarrio(lat: number, lng: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let mejor: string | null = null;
  let mejorDist = Infinity;
  for (const b of BARRIOS) {
    const d = distanciaKm(lat, lng, b.lat, b.lng);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = b.nombre;
    }
  }
  return mejorDist <= RADIO_MAX_KM ? mejor : null;
}
