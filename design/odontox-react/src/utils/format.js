// Funções puras de formatação e cálculo de datas/horários
import { TODAY } from './constants';

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const pad = (n) => (n < 10 ? '0' + n : '' + n);

// "HH:MM" -> minutos desde 00:00
export const minutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// minutos -> "HH:MM"
export const toTime = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);

// horário final a partir de início + duração
export const endTime = (hora, dur) => toTime(minutes(hora) + dur);

// "YYYY-MM-DD" -> Date local (sem fuso UTC)
export const parseDate = (d) => {
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, m - 1, dd);
};

// Date -> "YYYY-MM-DD"
export const toISO = (dt) => dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());

export const addDays = (d, n) => {
  const dt = parseDate(d);
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
};

export const fmtDate = (d, withWeekday) => {
  const dt = parseDate(d);
  const base = dt.getDate() + ' de ' + MONTHS[dt.getMonth()] + ' de ' + dt.getFullYear();
  if (!withWeekday) return base;
  const wd = WEEKDAYS[dt.getDay()];
  return wd.charAt(0).toUpperCase() + wd.slice(1) + ', ' + base;
};

export const shortDate = (d) => {
  const dt = parseDate(d);
  return pad(dt.getDate()) + '/' + pad(dt.getMonth() + 1) + '/' + dt.getFullYear();
};

export const idade = (nasc) => {
  const b = parseDate(nasc);
  const ref = parseDate(TODAY);
  let a = ref.getFullYear() - b.getFullYear();
  const mm = ref.getMonth() - b.getMonth();
  if (mm < 0 || (mm === 0 && ref.getDate() < b.getDate())) a--;
  return a;
};

export const initials = (nome) => {
  const p = nome.replace(/^(Dra?\.?)\s+/i, '').trim().split(/\s+/);
  return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || '');
};

const AVATAR_COLORS = ['#0E7A86', '#2563EB', '#7C3AED', '#C2410C', '#0891B2', '#BE123C', '#15803D', '#B45309'];
export const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const STATUS = {
  agendada: { label: 'Agendada', text: '#1D4ED8', bg: '#EAF1FF', border: '#CBDBFF', dot: '#2563EB' },
  atendida: { label: 'Atendida', text: '#047857', bg: '#E6F6EE', border: '#BCE8CF', dot: '#059669' },
  cancelada: { label: 'Cancelada', text: '#BE123C', bg: '#FDEAEE', border: '#F6C9D3', dot: '#E11D48' },
  ausente: { label: 'Ausente', text: '#B45309', bg: '#FEF3E0', border: '#F6DCAE', dot: '#D97706' },
};
export const statusMeta = (s) => STATUS[s] || STATUS.agendada;

// pluralização simples
export const plural = (n, sing, plur) => n + ' ' + (n === 1 ? sing : plur);
