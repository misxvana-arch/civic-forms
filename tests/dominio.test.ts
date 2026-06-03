import { describe, it, expect } from "vitest";
import {
  ESTADOS,
  ESTADO_INICIAL,
  siguienteEstado,
  esFinal,
} from "../src/domain/entities/estado.ts";
import {
  generarFolio,
  normalizarCct,
} from "../src/domain/entities/inscripcion.ts";
import { EstadoFinalError } from "../src/domain/errors/domain-error.ts";

describe("máquina de estados", () => {
  it("avanza un paso a la vez en orden", () => {
    expect(ESTADO_INICIAL).toBe("En solicitud");
    expect(siguienteEstado("En solicitud")).toBe("Aprobado");
    expect(siguienteEstado("Aprobado")).toBe("Programado");
    expect(siguienteEstado("Programado")).toBe("Concluido");
  });

  it("rechaza avanzar desde el estado final", () => {
    expect(esFinal("Concluido")).toBe(true);
    expect(() => siguienteEstado("Concluido")).toThrow(EstadoFinalError);
  });

  it("define exactamente cuatro estados", () => {
    expect(ESTADOS).toHaveLength(4);
  });
});

describe("folio y CCT", () => {
  it("genera folio con año, CCT y consecutivo a 3 dígitos", () => {
    const anio = new Date().getFullYear();
    expect(generarFolio("21DPR1234X", 5)).toBe(`MBMP-${anio}-21DPR1234X-005`);
  });

  it("normaliza el CCT a mayúsculas sin espacios", () => {
    expect(normalizarCct("  21dpr1234x ")).toBe("21DPR1234X");
  });
});
