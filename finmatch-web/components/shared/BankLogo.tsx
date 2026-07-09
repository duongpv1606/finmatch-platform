export function BankLogo({
  name,
  logoUrl,
  size = 32,
}: {
  name: string;
  logoUrl?: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          objectFit: "cover",
          flexShrink: 0,
          background: "white",
          border: "1px solid var(--gray-100)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "var(--gray-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.34,
        color: "var(--navy)",
        flexShrink: 0,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
