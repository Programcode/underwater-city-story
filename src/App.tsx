import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <AppShell
      map={
        <div className="placeholder-panel placeholder-panel--map">
          <p>Interactive map loading...</p>
        </div>
      }
      story={
        <div className="placeholder-panel">
          <h2>Story</h2>
          <p>Mira's choices will appear here.</p>
        </div>
      }
      journal={
        <div className="placeholder-panel placeholder-panel--journal">
          <h2>Journal</h2>
          <p>Discovered clues and places will collect here.</p>
        </div>
      }
    />
  );
}
