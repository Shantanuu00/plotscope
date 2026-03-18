import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, WheelEvent } from "react";

type WorkspaceCanvasProps = {
  imageUrl?: string;
  imageSrc?: string;
  imageName?: string;
  errorMessage?: string;
};

type ViewState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type PolygonPoint = {
  x: number;
  y: number;
};

const minZoom = 0.5;
const maxZoom = 4;
const wheelZoomSensitivity = 0.0018;
const buttonZoomFactor = 1.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function calculatePolygonArea(points: PolygonPoint[]) {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];

    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

function WorkspaceCanvas({ imageUrl, imageSrc, imageName, errorMessage }: WorkspaceCanvasProps) {
  const resolvedImageSrc = imageSrc ?? imageUrl;
  const [view, setView] = useState<ViewState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const imageStageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setView({ zoom: 1, offsetX: 0, offsetY: 0 });
    setIsDragging(false);
    setPolygonPoints([]);
    setIsPolygonClosed(false);
  }, [resolvedImageSrc]);

  const polygonArea = useMemo(() => {
    if (!isPolygonClosed) {
      return 0;
    }

    return calculatePolygonArea(polygonPoints);
  }, [isPolygonClosed, polygonPoints]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!resolvedImageSrc) {
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
    if (!resolvedImageSrc) {
      return;
    }

    event.preventDefault();
    dragMovedRef.current = false;
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

    const nextOffsetX = event.clientX - dragStartRef.current.x;
    const nextOffsetY = event.clientY - dragStartRef.current.y;

    if (
      Math.abs(nextOffsetX - view.offsetX) > 1 ||
      Math.abs(nextOffsetY - view.offsetY) > 1
    ) {
      dragMovedRef.current = true;
    }

    setView((current) => ({
      ...current,
      offsetX: nextOffsetX,
      offsetY: nextOffsetY,
    }));
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const adjustZoom = (zoomFactor: number) => {
    setView((current) => ({
      ...current,
      zoom: clamp(current.zoom * zoomFactor, minZoom, maxZoom),
    }));
  };

  const resetView = () => {
    setView({ zoom: 1, offsetX: 0, offsetY: 0 });
  };

  const closePolygon = () => {
    if (polygonPoints.length < 3) {
      return;
    }

    setIsPolygonClosed(true);
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    setIsPolygonClosed(false);
  };

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!resolvedImageSrc || dragMovedRef.current || isPolygonClosed) {
      return;
    }

    const stage = imageStageRef.current;
    const image = imageRef.current;
    if (!stage || !image) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const imageWidth = image.clientWidth;
    const imageHeight = image.clientHeight;

    if (!imageWidth || !imageHeight) {
      return;
    }

    const stageX = event.clientX - stageRect.left;
    const stageY = event.clientY - stageRect.top;

    const imageX = (stageX - stageRect.width / 2 - view.offsetX) / view.zoom + imageWidth / 2;
    const imageY = (stageY - stageRect.height / 2 - view.offsetY) / view.zoom + imageHeight / 2;

    if (imageX < 0 || imageY < 0 || imageX > imageWidth || imageY > imageHeight) {
      return;
    }

    setPolygonPoints((current) => [...current, { x: imageX, y: imageY }]);
  };

  const pointList = polygonPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <main className="workspace" aria-label="Document workspace">
      <div className="workspace-placeholder">
        {errorMessage ? <p className="workspace-error">{errorMessage}</p> : null}
        {resolvedImageSrc ? (
          <figure className="workspace-image-wrapper">
            <div
              ref={imageStageRef}
              className={`workspace-image-stage ${isDragging ? "is-dragging" : ""}`}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              onClick={handleStageClick}
            >
              <div
                className="workspace-image-layer"
                style={{
                  transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.zoom})`,
                  transformOrigin: "center center",
                }}
              >
                <img
                  ref={imageRef}
                  src={resolvedImageSrc}
                  alt={imageName ?? "Imported image"}
                  className="workspace-image"
                  draggable={false}
                />
                <svg className="workspace-drawing-overlay" aria-label="Polygon overlay">
                  {isPolygonClosed && polygonPoints.length >= 3 ? (
                    <polygon className="workspace-polygon-fill" points={pointList} />
                  ) : null}
                  {polygonPoints.length >= 2 && !isPolygonClosed ? (
                    <polyline className="workspace-polygon-line" points={pointList} />
                  ) : null}
                  {polygonPoints.map((point, index) => (
                    <circle
                      key={`${point.x}-${point.y}-${index}`}
                      className="workspace-polygon-point"
                      cx={point.x}
                      cy={point.y}
                      r={4}
                    />
                  ))}
                </svg>
              </div>
            </div>
            <figcaption>{imageName}</figcaption>
            <div className="workspace-controls" aria-label="Zoom controls">
              <button
                type="button"
                onClick={() => adjustZoom(buttonZoomFactor)}
                disabled={view.zoom >= maxZoom}
              >
                Zoom In
              </button>
              <button
                type="button"
                onClick={() => adjustZoom(1 / buttonZoomFactor)}
                disabled={view.zoom <= minZoom}
              >
                Zoom Out
              </button>
              <span className="workspace-zoom-readout">{Math.round(view.zoom * 100)}%</span>
              <button type="button" onClick={resetView} className="workspace-reset-button">
                Reset View
              </button>
              <button
                type="button"
                onClick={closePolygon}
                disabled={isPolygonClosed || polygonPoints.length < 3}
              >
                Close Polygon
              </button>
              <button type="button" onClick={clearPolygon} disabled={polygonPoints.length === 0}>
                Clear Polygon
              </button>
            </div>
            <p className="workspace-area-readout">
              Area: {isPolygonClosed ? `${polygonArea.toFixed(2)} px²` : "-- px²"}
            </p>
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
