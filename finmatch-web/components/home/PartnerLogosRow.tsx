"use client";

import { useQuery } from "@tanstack/react-query";
import { getPartnerLogos } from "@/services/platformService";

export function PartnerLogosRow() {
  const { data: logos } = useQuery({ queryKey: ["platform", "partner-logos"], queryFn: getPartnerLogos });

  if (!logos || logos.length === 0) return null;

  return (
    <div className="partner-logos-row">
      {logos.slice(0, 8).map((l) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={l.bankId}
          src={l.bankLogoUrl}
          alt={l.bankName}
          title={l.bankName}
          className="partner-logo-chip"
          style={{ objectFit: "cover", background: "white" }}
        />
      ))}
      {logos.length > 8 && <span className="partner-logos-more">+{logos.length - 8}</span>}
    </div>
  );
}
