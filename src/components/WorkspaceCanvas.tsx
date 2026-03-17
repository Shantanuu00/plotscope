import { useEffect, useRef, useState } from "react";
import type { MouseEvent, WheelEvent } from "react";

type WorkspaceCanvasProps = {
  imageUrl?: string;
  imageName?: string;
  errorMessage?: string;
};

const minZoom = 0.5;
const maxZoom = 4;
const zoomStep = 0.1;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function WorkspaceCanvas({ imageUrl, imageName, errorMessage }: WorkspaceCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [imageUrl]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!imageUrl) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((currentZoom) => clamp(currentZoom + direction * zoomStep, minZoom, maxZoom));
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!imageUrl) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    setOffset({
      x: event.clientX - dragStartRef.current.x,
      y: event.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <main className="workspace" aria-label="Document workspace">
      <div className="workspace-placeholder">
        {errorMessage ? <p className="workspace-error">{errorMessage}</p> : null}
        {imageUrl ? (
          <figure className="workspace-image-wrapper">
            <div
              className={`workspace-image-stage ${isDragging ? "is-dragging" : ""}`}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={imageUrl}
                alt={imageName ?? "Imported image"}
                className="workspace-image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                }}
                draggable={false}
              />
            </div>
            <figcaption>{imageName}</figcaption>
            <button type="button" onClick={resetView} className="workspace-reset-button">
              Reset View
            </button>
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
