// Ícones SVG (estilo Feather/line). Cada um aceita size, color e strokeWidth.
type IconProps = { size?: number; color?: string; sw?: number };

const base = (size: number, stroke: string, sw = 2) =>
  ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  });

export const Check = ({ size = 20, color = 'currentColor', sw = 2.5 }: IconProps) => (
  <svg {...base(size, color, sw)}><polyline points="20 6 9 17 4 12" /></svg>
);

export const Calendar = ({ size = 19, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const Users = ({ size = 19, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Tooth = ({ size = 19, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M12 3c-2.5 0-3.2 1-5 1S3.5 3.3 3 5.5C2.3 8.7 4 12 5 16c.6 2.4.8 5 2 5s1.2-3 2-3 1.6 3 3 3 1.2-3 2-3 .9 3 2 3c1.4 0 1.4-2.6 2-5 1-4 2.7-7.3 2-10.5C21.5 3.3 20.8 4 19 4s-2.5-1-5-1z" />
  </svg>
);

export const LogOut = ({ size = 18, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const ChevronLeft = ({ size = 18, color = 'currentColor', sw = 2.2 }: IconProps) => (
  <svg {...base(size, color, sw)}><polyline points="15 18 9 12 15 6" /></svg>
);

export const ChevronRight = ({ size = 18, color = 'currentColor', sw = 2.2 }: IconProps) => (
  <svg {...base(size, color, sw)}><polyline points="9 18 15 12 9 6" /></svg>
);

export const ChevronDown = ({ size = 16, color = 'currentColor', sw = 2.2 }: IconProps) => (
  <svg {...base(size, color, sw)}><polyline points="6 9 12 15 18 9" /></svg>
);

export const Plus = ({ size = 17, color = 'currentColor', sw = 2.5 }: IconProps) => (
  <svg {...base(size, color, sw)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export const Search = ({ size = 17, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

export const Edit = ({ size = 16, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

export const Pencil = ({ size = 15, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);

export const Phone = ({ size = 15, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Mail = ({ size = 15, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

export const X = ({ size = 20, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export const AlertTriangle = ({ size = 15, color = 'currentColor', sw = 2 }: IconProps) => (
  <svg {...base(size, color, sw)}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
