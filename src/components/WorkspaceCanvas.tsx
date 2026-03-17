type WorkspaceCanvasProps = {
  imageSrc?: string;
  imageName?: string;
  errorMessage?: string;
};

function WorkspaceCanvas({ imageSrc, imageName, errorMessage }: WorkspaceCanvasProps) {
  const hasImage = Boolean(imageSrc);

  return (
    <main className="workspace" aria-label="Document workspace">
      <div className="workspace-placeholder">
        {errorMessage ? <p className="workspace-error">{errorMessage}</p> : null}

        {hasImage ? (
          <figure className="workspace-image-wrapper">
            <img src={imageSrc} alt={imageName ?? "Imported document"} className="workspace-image" />
            <figcaption>{imageName}</figcaption>
          </figure>
        ) : (
          <>
            <h1>Workspace</h1>
            <p>Import an image to start measurements.</p>
          </>
        )}
      </div>
    </main>
  );
}

export default WorkspaceCanvas;
