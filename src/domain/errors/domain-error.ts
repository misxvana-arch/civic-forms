// Error de dominio: una regla de negocio violada, NO un fallo técnico.
// Los controladores lo traducen a HTTP 4xx. Nunca incluye datos personales
// en el mensaje (ZDR): solo el campo y el motivo.
export class DomainError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class CctDuplicadoError extends DomainError {
  constructor() {
    super(
      "CCT_DUPLICADO",
      "Esta escuela (CCT) ya está inscrita.",
      409,
    );
  }
}

export class InscripcionNoEncontradaError extends DomainError {
  constructor() {
    super("INSCRIPCION_NO_ENCONTRADA", "No existe la inscripción.", 404);
  }
}

export class EstadoFinalError extends DomainError {
  constructor() {
    super(
      "ESTADO_FINAL",
      "La inscripción ya está concluida; no puede avanzar más.",
      409,
    );
  }
}

export class ConsentimientoRequeridoError extends DomainError {
  constructor() {
    super(
      "CONSENTIMIENTO_REQUERIDO",
      "Debes aceptar el aviso de privacidad para continuar.",
      422,
    );
  }
}

export class CalificacionInvalidaError extends DomainError {
  constructor() {
    super(
      "CALIFICACION_INVALIDA",
      "La calificación debe ser un número entero del 1 al 5.",
      422,
    );
  }
}

export class EscuelaConcluidaError extends DomainError {
  constructor() {
    super(
      "ESCUELA_CONCLUIDA",
      "Esta escuela ya concluyó su jornada; no puede inscribirse de nuevo.",
      409,
    );
  }
}
