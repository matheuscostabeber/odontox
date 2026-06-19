// Estado global da clínica: dados + ações CRUD, sobre a camada de serviço.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const [data, setData] = useState({ dentists: [], patients: [], consultas: [], atendimentos: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getAll().then((d) => {
      if (alive) {
        setData(d);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);

  // ---- seletores ----
  const dentist = useCallback((id) => data.dentists.find((d) => d.id === id), [data.dentists]);
  const patient = useCallback((id) => data.patients.find((p) => p.id === id), [data.patients]);
  const atendimentoFor = useCallback(
    (consultaId) => data.atendimentos.find((a) => a.consultaId === consultaId),
    [data.atendimentos]
  );

  // ---- consultas ----
  const saveConsulta = useCallback(async (form) => {
    const payload = {
      pacienteId: +form.pacienteId, dentistaId: +form.dentistaId, date: form.data,
      hora: form.hora, duracao: +form.duracao, procedimento: form.procedimento,
      status: form.status, obs: form.observacoes,
    };
    if (form.id) {
      const updated = await api.updateConsulta(form.id, payload);
      setData((d) => ({ ...d, consultas: d.consultas.map((c) => (c.id === form.id ? updated : c)) }));
    } else {
      const created = await api.createConsulta(payload);
      setData((d) => ({ ...d, consultas: [...d.consultas, created] }));
    }
  }, []);

  const setConsultaStatus = useCallback(async (id, status) => {
    const updated = await api.setConsultaStatus(id, status);
    setData((d) => ({ ...d, consultas: d.consultas.map((c) => (c.id === id ? updated : c)) }));
  }, []);

  // ---- pacientes ----
  const savePatient = useCallback(async (form) => {
    if (form.id) {
      const updated = await api.updatePatient(form.id, form);
      setData((d) => ({ ...d, patients: d.patients.map((p) => (p.id === form.id ? updated : p)) }));
    } else {
      const created = await api.createPatient(form);
      setData((d) => ({ ...d, patients: [...d.patients, created] }));
    }
  }, []);

  // ---- dentistas ----
  const saveDentist = useCallback(async (form) => {
    if (form.id) {
      const updated = await api.updateDentist(form.id, form);
      setData((d) => ({ ...d, dentists: d.dentists.map((x) => (x.id === form.id ? updated : x)) }));
    } else {
      const created = await api.createDentist(form);
      setData((d) => ({ ...d, dentists: [...d.dentists, created] }));
    }
  }, []);

  const toggleDentist = useCallback(async (id) => {
    const updated = await api.toggleDentist(id);
    setData((d) => ({ ...d, dentists: d.dentists.map((x) => (x.id === id ? updated : x)) }));
  }, []);

  // ---- atendimentos ----
  const saveAtendimento = useCallback(async (consultaId, form, existingId) => {
    const res = await api.saveAtendimento(consultaId, {
      procedimento_realizado: form.procedimento_realizado,
      observacoes_clinicas: form.observacoes_clinicas,
    }, existingId);
    setData((d) => ({
      ...d,
      atendimentos: res.atendimentos,
      consultas: d.consultas.map((c) => (c.id === consultaId ? res.consulta : c)),
    }));
  }, []);

  const value = {
    ...data, loading,
    dentist, patient, atendimentoFor,
    saveConsulta, setConsultaStatus,
    savePatient, saveDentist, toggleDentist, saveAtendimento,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic precisa estar dentro de <ClinicProvider>');
  return ctx;
}
