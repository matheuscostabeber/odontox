import { minutes, endTime, statusMeta } from "@/lib/odontox/format";
import { START_H, HOUR_H } from "@/lib/odontox/constants";
import type { Consulta } from "@/lib/types";

type ConsultaBlockProps = {
  consulta: Consulta;
  patientName: string;
  dentistColor: string;
  onClick: () => void;
};

// Um bloco de consulta posicionado na coluna do dentista.
export default function ConsultaBlock({ consulta, patientName, dentistColor, onClick }: ConsultaBlockProps) {
  const sm = statusMeta(consulta.status);
  const cancel = consulta.status === "cancelada";
  const top = ((minutes(consulta.hora) - START_H * 60) / 60) * HOUR_H;
  // todo bloco ocupa no mínimo o equivalente a 30 min da grade,
  // com piso suficiente para exibir horário, paciente e procedimento sem cortar
  const MIN_H = 64;
  const h = Math.max(MIN_H, (consulta.duracao / 60) * HOUR_H - 4);

  return (
    <div
      onClick={onClick}
      style={{ position: "absolute", top, left: 6, right: 6, height: h, background: sm.bg, borderStyle: "solid", borderWidth: 1, borderColor: sm.border, borderLeftWidth: 3, borderLeftColor: dentistColor, borderRadius: 9, padding: "7px 9px", cursor: "pointer", overflow: "hidden", opacity: cancel ? 0.62 : 1, display: "flex", flexDirection: "column", gap: 1 }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: sm.text, fontVariantNumeric: "tabular-nums" }}>
        {consulta.hora} – {endTime(consulta.hora, consulta.duracao)}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1B2B2E", textDecoration: cancel ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{patientName}</span>
      <span style={{ fontSize: 11.5, color: "#5B6B6E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{consulta.procedimento}</span>
    </div>
  );
}
