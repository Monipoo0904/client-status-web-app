type MyVillageLogoProps = {
  size?: number;
  className?: string;
};

export default function MyVillageLogo({ size = 52, className }: MyVillageLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="MyVillage logo"
      className={className}
    >
      <rect x="4" y="4" width="88" height="88" rx="24" fill="currentColor" fillOpacity="0.12" />
      <rect x="4" y="4" width="88" height="88" rx="24" stroke="currentColor" strokeWidth="4" />
      <path
        d="M22 64L40 40L52 54L74 26"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="74" cy="26" r="6" fill="currentColor" />
    </svg>
  );
}
