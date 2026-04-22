import { useEffect, useMemo, useState } from "react";
import { BrandingContext } from "./brandingContext";
import { authApi } from "../services/domain";

const defaultBranding = {
  businessName: "Power Spares",
  businessDescription:
    "Inventory, billing, purchases, sales, customers, and reports for your spare parts shop."
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBranding);

  useEffect(() => {
    authApi.branding().then(setBranding).catch(() => setBranding(defaultBranding));
  }, []);

  const value = useMemo(() => ({ branding, setBranding }), [branding]);

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};
