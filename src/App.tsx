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
const acceptedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const acceptedImageExtensions = new Set(["png", "jpg", "jpeg", "webp"]);

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

  const triggerImagePicker = () => {
    const input = fileInputRef.current;

    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  const handleToolbarAction = (action: string) => {
    if (action === importActionLabel) {
      triggerImagePicker();
    }
  };

  const isAllowedImageFile = (file: File) => {
    if (acceptedImageTypes.has(file.type)) {
      return true;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension ? acceptedImageExtensions.has(extension) : false;
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      setErrorMessage("No image selected.");
      return;
    }

    if (!isAllowedImageFile(file)) {
      setErrorMessage("Unsupported file type. Use png, jpg, jpeg, or webp.");
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
        id="image-import-input"
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
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
