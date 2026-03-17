import "./App.css";

const tools = ["Select", "Distance", "Area", "Angle", "Scale"];
const layers = ["Boundary", "Parcels", "Reference"];

function App() {
  return (
    <div className="app-shell">
      <header className="top-toolbar" role="banner">
        <div className="brand">PlotScope</div>
        <nav aria-label="Primary tools">
          <ul className="toolbar-actions">
            <li>
              <button type="button">Open Plan</button>
            </li>
            <li>
              <button type="button">Import Image</button>
            </li>
            <li>
              <button type="button">Export Report</button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="workspace-layout">
        <aside className="left-sidebar" aria-label="Tool sidebar">
          <h2>Tools</h2>
          <ul>
            {tools.map((tool) => (
              <li key={tool}>
                <button type="button">{tool}</button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="workspace" aria-label="Document workspace">
          <div className="workspace-placeholder">
            <h1>Workspace</h1>
            <p>Plan canvas and measurement overlays will appear here.</p>
          </div>
        </main>

        <aside className="right-panel" aria-label="Properties panel">
          <h2>Properties</h2>
          <section>
            <h3>Document</h3>
            <p>No file loaded.</p>
          </section>
          <section>
            <h3>Layers</h3>
            <ul>
              {layers.map((layer) => (
                <li key={layer}>{layer}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;
