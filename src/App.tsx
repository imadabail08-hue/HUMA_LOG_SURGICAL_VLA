import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavPageId } from './components/layout/Sidebar';
import { OverviewPage } from './pages/Overview';
import { DigitalTwinPage } from './pages/DigitalTwin';
import { DetectionPage } from './pages/Detection';
import { LocalizationPage } from './pages/Localization';
import { MonitoringPage } from './pages/Monitoring';
import { AboutPage } from './pages/About';
import { AnnotationStudioPage } from './pages/AnnotationStudio';
import { useDetectionStream } from './hooks/useDetectionStream';

export function App() {
  const [activePage, setActivePage] = useState<NavPageId>('overview');

  const {
    payload,
    status,
    selectedInstanceId,
    hoveredInstanceId,
    isPlaying,
    selectInstance,
    hoverInstance,
    toggleSimulation,
    updatePosition,
    toggleOcclusion,
    resetSimulation,
    switchMode
  } = useDetectionStream();

  // Raccourcis clavier pour fluidifier la démonstration devant le jury
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si l'utilisateur est dans un input de formulaire, ne pas intercepter
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        selectInstance(null);
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleSimulation();
      } else if (e.key === '1') {
        setActivePage('overview');
      } else if (e.key === '2') {
        setActivePage('digital-twin');
      } else if (e.key === '3') {
        setActivePage('detection');
      } else if (e.key === '4') {
        setActivePage('localization');
      } else if (e.key === '5') {
        setActivePage('monitoring');
      } else if (e.key === '6') {
        setActivePage('about');
      } else if (e.key === '7') {
        setActivePage('annotation-studio');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectInstance, toggleSimulation]);

  const detectedCount = payload.detections.filter(
    (d) => d.status === 'detected' || d.status === 'tracking'
  ).length;

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Barre d'en-tête industrielle */}
      <Header
        mode={payload.mode}
        isConnected={status.connected}
        timestamp={payload.timestamp}
        processingTimeMs={payload.processing_time_ms}
        onModeSwitch={switchMode}
      />

      {/* 2. Corps de l'application : Sidebar + Vue Active */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation latérale */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          detectedCount={detectedCount}
        />

        {/* Zone de contenu principale scrollable */}
        <main className="flex-1 overflow-y-auto bg-[#070c14]">
          {activePage === 'overview' && (
            <OverviewPage
              payload={payload}
              selectedInstanceId={selectedInstanceId}
              hoveredInstanceId={hoveredInstanceId}
              isPlaying={isPlaying}
              onSelect={selectInstance}
              onHover={hoverInstance}
              onTogglePlay={toggleSimulation}
              onReset={resetSimulation}
              onUpdatePosition={updatePosition}
              onToggleOcclusion={toggleOcclusion}
              onNavigateToDigitalTwin={() => setActivePage('digital-twin')}
            />
          )}

          {activePage === 'digital-twin' && (
            <DigitalTwinPage
              payload={payload}
              selectedInstanceId={selectedInstanceId}
              hoveredInstanceId={hoveredInstanceId}
              onSelect={selectInstance}
              onHover={hoverInstance}
              onUpdatePosition={updatePosition}
              onToggleOcclusion={toggleOcclusion}
            />
          )}

          {activePage === 'detection' && (
            <DetectionPage
              payload={payload}
              selectedInstanceId={selectedInstanceId}
              onSelect={selectInstance}
            />
          )}

          {activePage === 'localization' && (
            <LocalizationPage
              payload={payload}
              selectedInstanceId={selectedInstanceId}
              hoveredInstanceId={hoveredInstanceId}
              onSelect={selectInstance}
              onHover={hoverInstance}
              onUpdatePosition={updatePosition}
              onToggleOcclusion={toggleOcclusion}
            />
          )}

          {activePage === 'monitoring' && (
            <MonitoringPage
              payload={payload}
              onModeSwitch={switchMode}
            />
          )}

          {activePage === 'about' && <AboutPage />}

          {activePage === 'annotation-studio' && <AnnotationStudioPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
