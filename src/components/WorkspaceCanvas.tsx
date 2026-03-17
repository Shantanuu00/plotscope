import { useEffect, useRef, useState } from "react";
import type { MouseEvent, WheelEvent } from "react";

type WorkspaceCanvasProps = {
  imageUrl?: string;
  imageName?: string;
  errorMessage?: string;
};

type ViewState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

const minZoom = 0.5;
const maxZoom = 4;
const wheelZoomSensitivity = 0.0018;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function WorkspaceCanvas({ imageUrl, imageName, errorMessage }: WorkspaceCanvasProps) {
  const [view, setView] = useState<ViewState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView({ zoom: 1, offsetX: 0, offsetY: 0 });
    setIsDragging(false);
  }, [imageUrl]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!imageUrl) {
      return;
    }

    event.preventDefault();

    const stage = imageStageRef.current;
    if (!stage) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const cursorX = event.clientX - stageRect.left - stageRect.width / 2;
    const cursorY = event.clientY - stageRect.top - stageRect.height / 2;

    setView((current) => {
      const zoomFactor = Math.exp(-event.deltaY * wheelZoomSensitivity);
      const nextZoom = clamp(current.zoom * zoomFactor, minZoom, maxZoom);

      if (nextZoom === current.zoom) {
        return current;
      }

      const ratio = nextZoom / current.zoom;

      return {
        zoom: nextZoom,
        offsetX: (current.offsetX - cursorX) * ratio + cursorX,
        offsetY: (current.offsetY - cursorY) * ratio + cursorY,
      };
    });
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!imageUrl) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - view.offsetX,
      y: event.clientY - view.offsetY,
    };
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    setView((current) => ({
      ...current,
      offsetX: event.clientX - dragStartRef.current.x,
      offsetY: event.clientY - dragStartRef.current.y,
    }));
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setView({ zoom: 1, offsetX: 0, offsetY: 0 });
  };

  return (
    <main className="workspace" aria-label="Document workspace">
      <div className="workspace-placeholder">
        {errorMessage ? <p className="workspace-error">{errorMessage}</p> : null}
        {imageUrl ? (
          <figure className="workspace-image-wrapper">
            <div
              ref={imageStageRef}
              className={`workspace-image-stage ${isDragging ? "is-dragging" : ""}`}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
            >
              <img
                src={imageUrl}
                alt={imageName ?? "Imported image"}
                className="workspace-image"
                style={{
                  transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.zoom})`,
                  transformOrigin: "center center",
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
