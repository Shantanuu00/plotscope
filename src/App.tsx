import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { layers, toolbarActions, tools } from "./config/shellData";
import {
  PropertiesPanel,
  ToolSidebar,
  TopBar,
  WorkspaceCanvas,
} from "./components";

const importActionLabel = "Import Image";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const handleToolbarAction = (action: string) => {
    if (action !== importActionLabel) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      setErrorMessage("No image selected.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Unsupported file type. Please select an image.");
      return;
    }

    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }

    setImageSrc(URL.createObjectURL(file));
    setImageName(file.name);
    setErrorMessage(undefined);
  };

  return (
    <div className="app-shell">
      <TopBar actions={toolbarActions} onAction={handleToolbarAction} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="file-input-hidden"
        onChange={handleImageChange}
      />

      <div className="workspace-layout">
        <ToolSidebar tools={tools} />
        <WorkspaceCanvas imageSrc={imageSrc} imageName={imageName} errorMessage={errorMessage} />
        <PropertiesPanel layers={layers} imageName={imageName} />
      </div>
    </div>
  );
}

export default App;
