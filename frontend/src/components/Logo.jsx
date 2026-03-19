const ZwigatoLogo = ({ size = 36 }) => (
  <svg width={size * 3.2} height={size} viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7 H30 L8 33 H32" stroke="#E8520A" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <g transform="translate(24, 1) rotate(10)">
      <path d="M0 0 L9 15 L-9 15 Z" fill="#FFA726"/>
      <path d="M0 0 L9 15 L-9 15 Z" fill="none" stroke="#E8520A" strokeWidth="0.8"/>
      <circle cx="-1" cy="9" r="1.6" fill="#c62828"/>
      <circle cx="3.5" cy="7" r="1.3" fill="#c62828"/>
      <circle cx="1" cy="12" r="1.1" fill="#c62828"/>
      <path d="M-5 15 Q0 11.5 5 15" stroke="#795548" strokeWidth="1.5" fill="none"/>
      <path d="M-1.5 0 Q-5 -4 -2.5 -6 Q0.5 -3.5 -1.5 0Z" fill="#388e3c"/>
    </g>
    <text x="48" y="37" fontFamily="'Playfair Display', serif" fontSize="30" fontWeight="700" fill="#E8520A">Zwigato</text>
  </svg>
);

export default ZwigatoLogo;