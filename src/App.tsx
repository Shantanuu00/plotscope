import "./App.css";
import { layers, toolbarActions, tools } from "./config/shellData";
import {
  PropertiesPanel,
  ToolSidebar,
  TopBar,
  WorkspaceCanvas,
} from "./components";

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
