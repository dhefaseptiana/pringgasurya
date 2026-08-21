import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ControlMode, CropProfile, IrrigationCommand, ScenarioId, ScenarioRecord, SimulationInputs } from "../domain/types";

export const defaultSimulationInputs: SimulationInputs = {
  clockHour: 12,
  simulationStep: 48,
  startDate: "2026-08-21T00:00:00.000Z",
  randomSeed: 260821,
  weather: "clear",
  irradianceScalePercent: 100,
  gridAvailable: true,
  tankStartPercent: 68,
  landAreaHa: 1,
  totalHeadM: 22,
  irrigationDemandPercent: 72,
  pvCapacityKw: 2.4,
  tankCapacityM3: 22,
  shadePercent: 18,
  agrivoltaicLayout: "partial-shade",
  dieselPriceIdrL: 10000,
  gridTariffIdrKwh: 1445,
  activeZoneIds: ["Zona 01"],
};

interface SystemContextValue {
  controlMode: ControlMode;
  setControlMode: (mode: ControlMode) => void;
  crop: CropProfile;
  setCrop: (crop: CropProfile) => void;
  scenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;
  inputs: SimulationInputs;
  updateInput: <K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) => void;
  resetSimulation: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: 1 | 5 | 20;
  setSpeed: (speed: 1 | 5 | 20) => void;
  toggleZone: (zoneId: string) => void;
  savedScenarios: ScenarioRecord[];
  saveScenario: (record: Omit<ScenarioRecord, "id" | "createdAt" | "inputs">) => void;
  clearSavedScenarios: () => void;
  commandHistory: IrrigationCommand[];
  recordCommand: (command: Omit<IrrigationCommand, "id" | "timestamp">) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [controlMode, setControlMode] = useState<ControlMode>("automatic");
  const [crop, setCrop] = useState<CropProfile>("Padi");
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const [inputs, setInputs] = useState<SimulationInputs>(defaultSimulationInputs);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 5 | 20>(5);
  const [savedScenarios, setSavedScenarios] = useState<ScenarioRecord[]>([]);
  const [commandHistory, setCommandHistory] = useState<IrrigationCommand[]>([]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setInputs((current) => ({
        ...current,
        simulationStep: current.simulationStep + speed,
        clockHour: (current.clockHour + 0.25 * speed) % 24,
      }));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed]);

  const updateInput = <K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) => {
    setInputs((current) => {
      if (key === "clockHour") {
        const nextHour = Number(value);
        const currentDay = Math.floor(current.simulationStep / 96);
        return { ...current, clockHour: nextHour, simulationStep: currentDay * 96 + Math.round(nextHour * 4) };
      }
      return { ...current, [key]: value };
    });
  };

  const resetSimulation = () => {
    setInputs(defaultSimulationInputs);
    setScenario("normal");
    setCrop("Padi");
    setIsPlaying(false);
    setControlMode("automatic");
    setCommandHistory([]);
  };

  const toggleZone = (zoneId: string) => {
    setInputs((current) => ({
      ...current,
      activeZoneIds: current.activeZoneIds.includes(zoneId)
        ? current.activeZoneIds.filter((id) => id !== zoneId)
        : [...current.activeZoneIds, zoneId],
    }));
  };

  const saveScenario = (record: Omit<ScenarioRecord, "id" | "createdAt" | "inputs">) => {
    setSavedScenarios((current) => [{
      ...record,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      inputs: { ...inputs, activeZoneIds: [...inputs.activeZoneIds] },
    }, ...current].slice(0, 3));
  };

  const clearSavedScenarios = () => setSavedScenarios([]);
  const recordCommand = (command: Omit<IrrigationCommand, "id" | "timestamp">) => {
    setCommandHistory((current) => [{
      ...command,
      id: `${Date.now()}-${current.length}`,
      timestamp: new Date().toISOString(),
    }, ...current].slice(0, 30));
  };
  const value = useMemo(() => ({
    controlMode, setControlMode, crop, setCrop, scenario, setScenario, inputs, updateInput, resetSimulation,
    isPlaying, setIsPlaying, speed, setSpeed, toggleZone, savedScenarios,
    saveScenario, clearSavedScenarios, commandHistory, recordCommand,
  }), [controlMode, crop, scenario, inputs, isPlaying, speed, savedScenarios, commandHistory]);
  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const value = useContext(SystemContext);
  if (!value) throw new Error("useSystem must be used inside SystemProvider");
  return value;
}
