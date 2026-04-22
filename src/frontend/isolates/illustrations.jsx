export function SnowflakeIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" />
      <polyline points="9 4 12 2 15 4" />
      <polyline points="9 20 12 22 15 20" />
      <polyline points="4 9 2 12 4 15" />
      <polyline points="20 9 22 12 20 15" />
    </svg>
  );
}

export function SoilIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14 L8 9 L13 14 L17 10 L21 14" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <circle cx="7" cy="21" r="0.6" fill={stroke} stroke="none" />
      <circle cx="12" cy="21" r="0.6" fill={stroke} stroke="none" />
      <circle cx="17" cy="21" r="0.6" fill={stroke} stroke="none" />
      <circle cx="10" cy="22.5" r="0.4" fill={stroke} stroke="none" />
      <circle cx="15" cy="22.5" r="0.4" fill={stroke} stroke="none" />
    </svg>
  );
}

export function DnaIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 2 C 7 6, 17 8, 17 12" />
      <path d="M7 12 C 7 16, 17 18, 17 22" />
      <path d="M17 2 C 17 6, 7 8, 7 12" />
      <path d="M17 12 C 17 16, 7 18, 7 22" />
      <line x1="8.5" y1="5" x2="15.5" y2="5" />
      <line x1="8.5" y1="9" x2="15.5" y2="9" />
      <line x1="8.5" y1="15" x2="15.5" y2="15" />
      <line x1="8.5" y1="19" x2="15.5" y2="19" />
    </svg>
  );
}

export function SummitIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20 L10 7 L14 14 L17 10 L21 20 Z" />
      <path d="M8 11 L10 9 L12 11" strokeWidth="1" />
    </svg>
  );
}

export function PinIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22 C 7 15, 5 11, 5 9 A 7 7 0 0 1 19 9 C 19 11, 17 15, 12 22 Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function ClockIcon({ size = 18, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

export function CameraIcon({ size = 14, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8 L7 8 L9 5 L15 5 L17 8 L20 8 A1 1 0 0 1 21 9 L21 18 A1 1 0 0 1 20 19 L4 19 A1 1 0 0 1 3 18 L3 9 A1 1 0 0 1 4 8 Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function SearchIcon({ size = 16, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="21" y1="21" x2="15" y2="15" />
    </svg>
  );
}

export function ExternalIcon({ size = 13, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3 L21 3 L21 10" />
      <line x1="21" y1="3" x2="12" y2="12" />
      <path d="M19 14 L19 20 A1 1 0 0 1 18 21 L4 21 A1 1 0 0 1 3 20 L3 6 A1 1 0 0 1 4 5 L10 5" />
    </svg>
  );
}

export function MapIcon({ size = 12, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4 L3 6 L3 20 L9 18 L15 20 L21 18 L21 4 L15 6 L9 4 Z" />
      <line x1="9" y1="4" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="20" />
    </svg>
  );
}

export function CloseIcon({ size = 14, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function HabitatGlyph({ habitat, size = 24 }) {
  if (habitat === 'Snow') return <SnowflakeIcon size={size} />;
  if (habitat === 'Soil') return <SoilIcon size={size} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12 Q12 6 16 12 Q12 18 8 12 Z" />
    </svg>
  );
}
