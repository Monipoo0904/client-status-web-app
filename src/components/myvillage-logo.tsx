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
      <rect x="14" y="20" width="10" height="56" rx="2" fill="currentColor" />
      <rect x="72" y="20" width="10" height="56" rx="2" fill="currentColor" />
      <path
        d="M31 20H39L48 34L57 20H65V37L50.6 59.2C49.8 60.4 48.2 60.4 47.4 59.2L31 35V20Z"
        fill="currentColor"
      />
      <circle cx="48" cy="16" r="6.2" fill="currentColor" />
    </svg>
  );
}
