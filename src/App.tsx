import "./App.css";
import PropertiesPanel from "./components/PropertiesPanel";
import ToolSidebar from "./components/ToolSidebar";
import TopBar from "./components/TopBar";
import WorkspaceCanvas from "./components/WorkspaceCanvas";

const toolbarActions = ["Open Plan", "Import Image", "Export Report"];
const tools = ["Select", "Distance", "Area", "Angle", "Scale"];
const layers = ["Boundary", "Parcels", "Reference"];

function App() {
  return (
    <div className="app-shell">
      <TopBar actions={toolbarActions} />
      <div className="workspace-layout">
        <ToolSidebar tools={tools} />
        <WorkspaceCanvas />
        <PropertiesPanel layers={layers} />
      </div>
    </div>
  );
}

export default App;
