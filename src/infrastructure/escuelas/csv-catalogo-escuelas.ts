import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  type CatalogoEscuelas,
  type EscuelaCatalogo,
} from "../../application/ports/catalogo-escuelas.ts";

const aquí = dirname(fileURLToPath(import.meta.url));
// El CSV vive en la raíz del proyecto. Desde src/infrastructure/escuelas
// son tres niveles hacia arriba.
const RUTA_CSV_DEFECTO = join(aquí, "../../../EscuelasPrimariaPuebla.csv");

// Parser de una línea CSV que respeta comillas dobles (campos con comas) y
// el escape de comilla por duplicado (""). Evita meter una dependencia.
function parseLinea(linea: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (entreComillas) {
      if (c === '"') {
        if (linea[i + 1] === '"') {
          actual += '"';
          i++;
        } else entreComillas = false;
      } else actual += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ",") {
      campos.push(actual);
      actual = "";
    } else actual += c;
  }
  campos.push(actual);
  return campos;
}

function sostenimientoDe(nombreAct: string): EscuelaCatalogo["sostenimiento"] {
  const s = nombreAct.toLowerCase();
  if (s.includes("privad")) return "Privada";
  if (s.includes("public") || s.includes("públic")) return "Pública";
  return "Desconocido";
}

// Lee el catálogo del CSV una sola vez y lo cachea en memoria: el archivo no
// cambia en tiempo de ejecución, así que no tiene sentido releerlo por petición.
export class CsvCatalogoEscuelas implements CatalogoEscuelas {
  private cache: ReadonlyArray<EscuelaCatalogo> | null = null;
  constructor(private readonly ruta: string = RUTA_CSV_DEFECTO) {}

  async todas(): Promise<ReadonlyArray<EscuelaCatalogo>> {
    if (this.cache) return this.cache;

    // Quitamos el BOM inicial (U+FEFF) que añaden Excel/INEGI a los CSV UTF-8;
    // si no, el primer encabezado sería "﻿id" y no cruzaría por nombre.
    let texto = readFileSync(this.ruta, "utf8");
    if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
    const lineas = texto.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lineas.length === 0) {
      this.cache = [];
      return this.cache;
    }

    // Mapeamos columnas por NOMBRE de encabezado, no por posición: el export
    // del DENUE puede traer columnas extra o en otro orden sin rompernos.
    const cabecera = parseLinea(lineas[0] ?? "");
    const col = (n: string): number => cabecera.indexOf(n);
    const iId = col("id"),
      iNom = col("nom_estab"),
      iAct = col("nombre_act");
    const iTipoVial = col("tipo_vial"),
      iVial = col("nom_vial"),
      iNumExt = col("numero_ext");
    const iAsent = col("nomb_asent"),
      iCp = col("cod_postal"),
      iLoc = col("localidad");
    const iTel = col("telefono"),
      iCorreo = col("correoelec");
    const iLat = col("latitud"),
      iLng = col("longitud");

    const escuelas: EscuelaCatalogo[] = [];
    for (let i = 1; i < lineas.length; i++) {
      const c = parseLinea(lineas[i] ?? "");
      const g = (j: number): string => (j >= 0 ? (c[j] ?? "").trim() : "");
      const lat = Number.parseFloat(g(iLat));
      const lng = Number.parseFloat(g(iLng));
      // Sin coordenadas válidas no hay punto que pintar: descartamos la fila.
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const numExt = g(iNumExt);
      const domicilio = [
        [g(iTipoVial), g(iVial), numExt && numExt !== "SN" ? numExt : ""]
          .filter(Boolean)
          .join(" "),
        g(iAsent) ? `Col. ${g(iAsent)}` : "",
        g(iCp) ? `C.P. ${g(iCp)}` : "",
        g(iLoc),
      ]
        .filter(Boolean)
        .join(", ");

      escuelas.push({
        id: g(iId) || String(i),
        nombre: g(iNom),
        sostenimiento: sostenimientoDe(g(iAct)),
        domicilio,
        telefono: g(iTel),
        correo: g(iCorreo),
        lat,
        lng,
      });
    }
    this.cache = escuelas;
    return escuelas;
  }
}
