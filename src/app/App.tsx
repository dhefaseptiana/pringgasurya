import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { SystemProvider } from "../contexts/SystemContext";
import { AppShell } from "../layouts/AppShell";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const SystemOverviewPage = lazy(() => import("../pages/SystemOverviewPage").then((module) => ({ default: module.SystemOverviewPage })));
const LiveMonitoringPage = lazy(() => import("../pages/LiveMonitoringPage").then((module) => ({ default: module.LiveMonitoringPage })));
const WaterManagementPage = lazy(() => import("../pages/WaterManagementPage").then((module) => ({ default: module.WaterManagementPage })));
const EnergyManagementPage = lazy(() => import("../pages/EnergyManagementPage").then((module) => ({ default: module.EnergyManagementPage })));
const IrrigationPage = lazy(() => import("../pages/IrrigationPage").then((module) => ({ default: module.IrrigationPage })));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const InfoPage = lazy(() => import("../pages/InfoPage").then((module) => ({ default: module.InfoPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SystemProvider>
        <HashRouter>
          <Suspense fallback={<div className="page-loading">Memuat modul PRINGGASURYA…</div>}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route path="system-overview" element={<SystemOverviewPage />} />
                <Route path="operate/live" element={<LiveMonitoringPage />} />
                <Route path="operate/water" element={<WaterManagementPage />} />
                <Route path="operate/energy" element={<EnergyManagementPage />} />
                <Route path="operate/irrigation" element={<IrrigationPage />} />
                <Route path="analyze/analytics" element={<AnalyticsPage />} />
                <Route path="operate/water-quality" element={<InfoPage page="water-quality" />} />
                <Route path="operate/alerts" element={<InfoPage page="alerts" />} />
                <Route path="analyze/impact" element={<InfoPage page="impact" />} />
                <Route path="analyze/economics" element={<InfoPage page="economics" />} />
                <Route path="plan/sizing" element={<InfoPage page="sizing" />} />
                <Route path="plan/scalability" element={<InfoPage page="scalability" />} />
                <Route path="plan/deployment" element={<InfoPage page="deployment" />} />
                <Route path="research/study-area" element={<InfoPage page="study-area" />} />
                <Route path="research/methodology" element={<InfoPage page="methodology" />} />
                <Route path="research/references" element={<InfoPage page="references" />} />
                <Route path="settings" element={<InfoPage page="settings" />} />
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </SystemProvider>
    </QueryClientProvider>
  );
}
