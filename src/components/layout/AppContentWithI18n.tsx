import { I18nProvider } from "@/context/I18nContext";
import type { ReactNode } from "react";

type AppContentWithI18nProps = {
  children: ReactNode;
};

export function AppContentWithI18n({ children }: AppContentWithI18nProps) {
  return <I18nProvider>{children}</I18nProvider>;
}
