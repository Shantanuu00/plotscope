import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent, WheelEvent } from "react";

export type WorkspaceMeasurementSummary = {
  calibrationReady: boolean;
  calibrationStatus: string;
  polygonClosed: boolean;
  pointCount: number;
  pixelArea: number;
  pixelPerimeter: number;
  calibratedArea: number | null;
  calibratedPerimeter: number | null;
  lengthUnit: string;
  areaUnit: string;
};

type WorkspaceCanvasProps = {
  imageUrl?: string;
  imageSrc?: string;
  imageName?: string;
  errorMessage?: string;
  onSummaryChange?: (summary: WorkspaceMeasurementSummary) => void;
};

type ViewState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type CanvasPoint = {
  x: number;
  y: number;
};

type LengthUnit = "m" | "ft";
type WorkspaceMode = "pan" | "draw" | "edit" | "calibrate";

const lengthUnitLabels: Record<LengthUnit, string> = {
  m: "meters",
  ft: "feet",
};

const modeLabels: Record<WorkspaceMode, string> = {
  pan: "Pan",
  draw: "Draw Polygon",
  edit: "Edit Polygon",
  calibrate: "Calibrate",
};

const minZoom = 0.5;
const maxZoom = 4;
const wheelZoomSensitivity = 0.0018;
const buttonZoomFactor = 1.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function calculatePolygonArea(points: CanvasPoint[]) {
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

function calculatePolygonPerimeter(points: CanvasPoint[]) {
  if (points.length < 2) {
    return 0;
  }

  let perimeter = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    perimeter += Math.hypot(next.x - current.x, next.y - current.y);
  }

  return perimeter;
}

function convertLengthValue(value: number, from: LengthUnit, to: LengthUnit) {
  if (from === to) {
    return value;
  }

  return from === "m" ? value * 3.28084 : value / 3.28084;
}

function WorkspaceCanvas({ imageUrl, imageSrc, imageName, errorMessage, onSummaryChange }: WorkspaceCanvasProps) {
  const resolvedImageSrc = imageSrc ?? imageUrl;
  const [view, setView] = useState<ViewState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("pan");

  const [polygonPoints, setPolygonPoints] = useState<CanvasPoint[]>([]);
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);
  const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null);

  const [calibrationPoints, setCalibrationPoints] = useState<CanvasPoint[]>([]);
  const [knownDistanceInput, setKnownDistanceInput] = useState("");
  const [calibrationUnit, setCalibrationUnit] = useState<LengthUnit>("m");

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const imageStageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setView({ zoom: 1, offsetX: 0, offsetY: 0 });
    setIsDragging(false);

    setWorkspaceMode("pan");

    setPolygonPoints([]);
    setIsPolygonClosed(false);
    setDraggingVertexIndex(null);

    setCalibrationPoints([]);
    setKnownDistanceInput("");
    setCalibrationUnit("m");
  }, [resolvedImageSrc]);

  const polygonArea = useMemo(() => {
    if (!isPolygonClosed) {
      return 0;
    }

    return calculatePolygonArea(polygonPoints);
  }, [isPolygonClosed, polygonPoints]);

  const polygonPerimeter = useMemo(() => {
    if (!isPolygonClosed) {
      return 0;
    }

    return calculatePolygonPerimeter(polygonPoints);
  }, [isPolygonClosed, polygonPoints]);

  const calibrationPixelDistance = useMemo(() => {
    if (calibrationPoints.length !== 2) {
      return 0;
    }

    const dx = calibrationPoints[1].x - calibrationPoints[0].x;
    const dy = calibrationPoints[1].y - calibrationPoints[0].y;

    return Math.hypot(dx, dy);
  }, [calibrationPoints]);

  const knownDistance = useMemo(() => {
    const value = Number(knownDistanceInput);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [knownDistanceInput]);

  const calibrationStatus = useMemo(() => {
    if (calibrationPoints.length < 2) {
      return `Place ${2 - calibrationPoints.length} more calibration point${
        calibrationPoints.length === 1 ? "" : "s"
      }.`;
    }

    if (!knownDistance) {
      return `Enter known real-world distance in ${lengthUnitLabels[calibrationUnit]} to compute scale.`;
    }

    return "Calibration complete.";
  }, [calibrationPoints.length, knownDistance, calibrationUnit]);

  const pixelsPerUnit = knownDistance && calibrationPixelDistance ? calibrationPixelDistance / knownDistance : 0;
  const unitsPerPixel = knownDistance && calibrationPixelDistance ? knownDistance / calibrationPixelDistance : 0;
  const isCalibrationReady = unitsPerPixel > 0;

  const calibratedPerimeter = polygonPerimeter * unitsPerPixel;
  const calibratedArea = polygonArea * unitsPerPixel * unitsPerPixel;
  const areaUnitLabel = `${calibrationUnit}²`;

  useEffect(() => {
    onSummaryChange?.({
      calibrationReady: isCalibrationReady,
      calibrationStatus,
      polygonClosed: isPolygonClosed,
      pointCount: polygonPoints.length,
      pixelArea: polygonArea,
      pixelPerimeter: polygonPerimeter,
      calibratedArea: isCalibrationReady ? calibratedArea : null,
      calibratedPerimeter: isCalibrationReady ? calibratedPerimeter : null,
      lengthUnit: calibrationUnit,
      areaUnit: areaUnitLabel,
    });
  }, [
    onSummaryChange,
    isCalibrationReady,
    calibrationStatus,
    isPolygonClosed,
    polygonPoints.length,
    polygonArea,
    polygonPerimeter,
    calibratedArea,
    calibratedPerimeter,
    calibrationUnit,
    areaUnitLabel,
  ]);

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
    if (!resolvedImageSrc || workspaceMode !== "pan") {
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

  const getImageCoordinates = (clientX: number, clientY: number) => {
    const stage = imageStageRef.current;
    const image = imageRef.current;
    if (!stage || !image) {
      return null;
    }

    const stageRect = stage.getBoundingClientRect();
    const imageWidth = image.clientWidth;
    const imageHeight = image.clientHeight;

    if (!imageWidth || !imageHeight) {
      return null;
    }

    const stageX = clientX - stageRect.left;
    const stageY = clientY - stageRect.top;

    const imageX = (stageX - stageRect.width / 2 - view.offsetX) / view.zoom + imageWidth / 2;
    const imageY = (stageY - stageRect.height / 2 - view.offsetY) / view.zoom + imageHeight / 2;

    if (imageX < 0 || imageY < 0 || imageX > imageWidth || imageY > imageHeight) {
      return null;
    }

    return { x: imageX, y: imageY };
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (draggingVertexIndex !== null && workspaceMode === "edit") {
      const coords = getImageCoordinates(event.clientX, event.clientY);
      if (!coords) {
        return;
      }

      setPolygonPoints((current) =>
        current.map((point, index) => (index === draggingVertexIndex ? coords : point)),
      );
      return;
    }

    if (!isDragging || workspaceMode !== "pan") {
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
    setDraggingVertexIndex(null);
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
    setDraggingVertexIndex(null);
  };

  const undoLastPoint = () => {
    if (isPolygonClosed) {
      return;
    }

    setPolygonPoints((current) => current.slice(0, -1));
  };

  const clearCalibration = () => {
    setCalibrationPoints([]);
    setKnownDistanceInput("");
  };

  const startVertexDrag = (event: MouseEvent<SVGCircleElement>, index: number) => {
    if (workspaceMode !== "edit") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setDraggingVertexIndex(index);
    setIsDragging(false);
    dragMovedRef.current = false;
  };

  const handleKnownDistanceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKnownDistanceInput(event.target.value);
  };

  const handleCalibrationUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextUnit = event.target.value as LengthUnit;

    setKnownDistanceInput((current) => {
      const parsed = Number(current);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return current;
      }

      return convertLengthValue(parsed, calibrationUnit, nextUnit).toFixed(4);
    });

    setCalibrationUnit(nextUnit);
  };

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!resolvedImageSrc || dragMovedRef.current || draggingVertexIndex !== null) {
      return;
    }

    const coords = getImageCoordinates(event.clientX, event.clientY);
    if (!coords) {
      return;
    }

    if (workspaceMode === "calibrate") {
      setCalibrationPoints((current) => {
        if (current.length >= 2) {
          return current;
        }

        return [...current, coords];
      });
      return;
    }

    if (workspaceMode !== "draw" || isPolygonClosed) {
      return;
    }

    setPolygonPoints((current) => [...current, coords]);
  };

  const polygonPointList = polygonPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const calibrationPointList = calibrationPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <main className="workspace" aria-label="Document workspace">
      <div className="workspace-placeholder">
        {errorMessage ? <p className="workspace-error">{errorMessage}</p> : null}
        {resolvedImageSrc ? (
          <figure className="workspace-image-wrapper">
            <div className="workspace-mode-switch" role="group" aria-label="Workspace mode">
              {(Object.keys(modeLabels) as WorkspaceMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`workspace-mode-button ${workspaceMode === mode ? "is-active" : ""}`}
                  onClick={() => setWorkspaceMode(mode)}
                >
                  {modeLabels[mode]}
                </button>
              ))}
            </div>
            <p className="workspace-mode-label">Active mode: {modeLabels[workspaceMode]}</p>

            <div
              ref={imageStageRef}
              className={`workspace-image-stage workspace-mode-${workspaceMode} ${isDragging ? "is-dragging" : ""}`}
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
                <svg className="workspace-drawing-overlay" aria-label="Overlay layer">
                  {isPolygonClosed && polygonPoints.length >= 3 ? (
                    <polygon className="workspace-polygon-fill" points={polygonPointList} />
                  ) : null}
                  {polygonPoints.length >= 2 && !isPolygonClosed ? (
                    <polyline className="workspace-polygon-line" points={polygonPointList} />
                  ) : null}
                  {polygonPoints.map((point, index) => (
                    <circle
                      key={`polygon-${point.x}-${point.y}-${index}`}
                      className={`workspace-polygon-point ${draggingVertexIndex === index ? "is-active" : ""}`}
                      cx={point.x}
                      cy={point.y}
                      r={6}
                      onMouseDown={(event) => startVertexDrag(event, index)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  ))}

                  {calibrationPoints.length === 2 ? (
                    <line
                      className="workspace-calibration-line"
                      x1={calibrationPoints[0].x}
                      y1={calibrationPoints[0].y}
                      x2={calibrationPoints[1].x}
                      y2={calibrationPoints[1].y}
                    />
                  ) : null}
                  {calibrationPointList
                    ? calibrationPoints.map((point, index) => (
                        <circle
                          key={`calibration-${point.x}-${point.y}-${index}`}
                          className="workspace-calibration-point"
                          cx={point.x}
                          cy={point.y}
                          r={6}
                        />
                      ))
                    : null}
                </svg>
              </div>
            </div>

            <figcaption>{imageName}</figcaption>

            <div className="workspace-controls" aria-label="Workspace controls">
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
                onClick={undoLastPoint}
                disabled={workspaceMode !== "draw" || isPolygonClosed || polygonPoints.length === 0}
              >
                Undo Last Point
              </button>
              <button
                type="button"
                onClick={closePolygon}
                disabled={workspaceMode === "calibrate" || isPolygonClosed || polygonPoints.length < 3}
              >
                Close Polygon
              </button>
              <button type="button" onClick={clearPolygon} disabled={polygonPoints.length === 0}>
                Clear Polygon
              </button>
              <button
                type="button"
                onClick={clearCalibration}
                disabled={calibrationPoints.length === 0 && knownDistanceInput.length === 0}
              >
                Clear Calibration
              </button>
            </div>

            <section className="workspace-measurement-readout" aria-label="Polygon measurements">
              <h3>Polygon Measurements</h3>
              <p className="workspace-area-readout">
                Pixel area: {isPolygonClosed ? `${polygonArea.toFixed(2)} px²` : "--"}
              </p>
              <p className="workspace-area-readout">
                Pixel perimeter: {isPolygonClosed ? `${polygonPerimeter.toFixed(2)} px` : "--"}
              </p>
              {isPolygonClosed ? (
                isCalibrationReady ? (
                  <>
                    <p className="workspace-area-readout">
                      Calibrated area: {calibratedArea.toFixed(4)} {areaUnitLabel}
                    </p>
                    <p className="workspace-area-readout">
                      Calibrated perimeter: {calibratedPerimeter.toFixed(4)} {calibrationUnit}
                    </p>
                  </>
                ) : (
                  <p className="workspace-measurement-note">
                    Calibration required for real-world measurements.
                  </p>
                )
              ) : null}
            </section>

            <section className="workspace-calibration-panel" aria-label="Calibration settings">
              <h3>Calibration</h3>
              <p className="workspace-calibration-status">{calibrationStatus}</p>
              <label className="workspace-calibration-field">
                Known distance
                <div className="workspace-calibration-input-row">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={knownDistanceInput}
                    onChange={handleKnownDistanceChange}
                    placeholder="Enter distance"
                  />
                  <select value={calibrationUnit} onChange={handleCalibrationUnitChange}>
                    <option value="m">Meters (m)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>
              </label>
              <p className="workspace-calibration-readout">
                Pixel distance: {calibrationPixelDistance ? calibrationPixelDistance.toFixed(2) : "--"} px
              </p>
              <p className="workspace-calibration-readout">
                Scale: {pixelsPerUnit ? `${pixelsPerUnit.toFixed(4)} px/${calibrationUnit}` : "--"}
              </p>
              <p className="workspace-calibration-readout">
                Inverse scale: {unitsPerPixel ? `${unitsPerPixel.toFixed(6)} ${calibrationUnit}/px` : "--"}
              </p>
            </section>
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
