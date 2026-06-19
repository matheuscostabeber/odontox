import { useState, useMemo, type CSSProperties } from "react";
import { useClinic } from "@/context/ClinicContext";
import { useModal } from "@/context/ModalContext";
import { fmtDate, addDays, plural } from "@/lib/odontox/format";
import { TODAY } from "@/lib/odontox/constants";
import { ChevronLeft, ChevronRight, Plus } from "@/components/odontox/icons";
import Button from "@/components/odontox/Button";
import WeekStrip from "@/components/odontox/agenda/WeekStrip";
import FilterChips, { type AgendaFilter } from "@/components/odontox/agenda/FilterChips";
import AgendaBoard from "@/components/odontox/agenda/AgendaBoard";

export default function AgendaPage() {
  const { consultas, dentists, patient } = useClinic();
  const { open } = useModal();
  const [viewDate, setViewDate] = useState<string>(TODAY);
  const [filter, setFilter] = useState<AgendaFilter>("all");

  const activeDentists = useMemo(() => dentists.filter((d) => d.ativo), [dentists]);
  const columns = filter === "all" ? activeDentists : dentists.filter((d) => d.id === filter);
  const dayConsultas = useMemo(() => consultas.filter((c) => c.date === viewDate), [consultas, viewDate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <header style={{ padding: "24px 32px 18px", background: "#fff", borderBottom: "1px solid #E6ECEC", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 3px", color: "#0F2225" }}>Agenda</h1>
            <p style={{ fontSize: 14, color: "#5B6B6E", margin: 0 }}>{fmtDate(viewDate, true)} · {plural(dayConsultas.length, "consulta", "consultas")}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #DCE5E5", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <button onClick={() => setViewDate((d) => addDays(d, -1))} style={navBtn}><ChevronLeft /></button>
              <button onClick={() => setViewDate(TODAY)} style={{ ...navBtn, borderLeft: "1px solid #E6ECEC", borderRight: "1px solid #E6ECEC", padding: "10px 16px", color: "#33484B", fontSize: 13.5, fontWeight: 700 }}>Hoje</button>
              <button onClick={() => setViewDate((d) => addDays(d, 1))} style={navBtn}><ChevronRight /></button>
            </div>
            <Button onClick={() => open("consultaForm", { prefill: { data: viewDate } })}>
              <Plus /> Nova consulta
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <WeekStrip viewDate={viewDate} onSelect={setViewDate} />
          <FilterChips dentists={activeDentists} filter={filter} onChange={setFilter} />
        </div>
      </header>

      <AgendaBoard
        dentists={columns}
        consultas={dayConsultas}
        patientById={patient}
        onConsultaClick={(id) => open("consultaDetail", { id })}
      />
    </div>
  );
}

const navBtn: CSSProperties = { background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer", color: "#5B6B6E", display: "flex" };
