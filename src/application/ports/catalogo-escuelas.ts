// Puerto del catálogo de escuelas (fuente externa: export del DENUE/INEGI).
// La aplicación declara QUÉ necesita; la infraestructura decide CÓMO (CSV,
// API, base de datos…). El dominio nunca conoce el origen de los datos.
export interface EscuelaCatalogo {
  readonly id: string;
  readonly nombre: string;
  readonly sostenimiento: "Pública" | "Privada" | "Desconocido";
  readonly domicilio: string;
  readonly telefono: string;
  readonly correo: string;
  readonly lat: number;
  readonly lng: number;
}

export interface CatalogoEscuelas {
  todas(): Promise<ReadonlyArray<EscuelaCatalogo>>;
}
