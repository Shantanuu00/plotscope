import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import PropertiesPanel from "./components/PropertiesPanel";
import ToolSidebar from "./components/ToolSidebar";
import TopBar from "./components/TopBar";
import WorkspaceCanvas from "./components/WorkspaceCanvas";

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const allowedExtensions = new Set(["png", "jpg", "jpeg", "webp"]);

function App() {
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImportImageClick = () => {
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

  const isImageFileAllowed = (file: File) => {
    if (allowedMimeTypes.has(file.type)) {
      return true;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext ? allowedExtensions.has(ext) : false;
  };

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      setErrorMessage("No image selected.");
      return;
    }

    if (!isImageFileAllowed(file)) {
      setErrorMessage("Unsupported file type. Use png, jpg, jpeg, or webp.");
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(URL.createObjectURL(file));
    setImageName(file.name);
    setErrorMessage(undefined);
  };

  return (
    <div className="app-shell">
      <TopBar onImportImage={handleImportImageClick} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        className="file-input-hidden"
        onChange={handleImageSelected}
      />
      <div className="workspace-layout">
        <ToolSidebar />
        <WorkspaceCanvas imageUrl={imageUrl} imageName={imageName} errorMessage={errorMessage} />
        <PropertiesPanel imageName={imageName} />
      </div>
    </div>
  );
}

export default App;
