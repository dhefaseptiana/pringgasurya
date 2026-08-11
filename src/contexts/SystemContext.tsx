import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CropProfile, ScenarioId } from "../domain/types";

interface SystemContextValue {
  crop: CropProfile;
  setCrop: (crop: CropProfile) => void;
  scenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [crop, setCrop] = useState<CropProfile>("Padi");
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const value = useMemo(() => ({ crop, setCrop, scenario, setScenario }), [crop, scenario]);
  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const value = useContext(SystemContext);
  if (!value) throw new Error("useSystem must be used inside SystemProvider");
  return value;
}
