import type { WorkspaceMeasurementSummary } from "./WorkspaceCanvas";

const layers = ["Boundary", "Parcels", "Reference"];

type PropertiesPanelProps = {
  imageName?: string;
  summary: WorkspaceMeasurementSummary;
};

function PropertiesPanel({ imageName, summary }: PropertiesPanelProps) {
  return (
    <aside className="right-panel" aria-label="Properties panel">
      <h2>Properties</h2>

      <section>
        <h3>Document</h3>
        <p>{imageName ?? "No file loaded."}</p>
      </section>

      <section>
        <h3>Measurement Summary</h3>
        <ul>
          <li>
            <strong>Calibration:</strong> {summary.calibrationReady ? "Ready" : "Not ready"}
          </li>
          <li>
            <strong>Calibration status:</strong> {summary.calibrationStatus}
          </li>
          <li>
            <strong>Polygon:</strong> {summary.polygonClosed ? "Closed" : "Open"}
          </li>
          <li>
            <strong>Points:</strong> {summary.pointCount}
          </li>
          <li>
            <strong>Pixel area:</strong> {summary.polygonClosed ? `${summary.pixelArea.toFixed(2)} px²` : "--"}
          </li>
          <li>
            <strong>Pixel perimeter:</strong> {summary.polygonClosed ? `${summary.pixelPerimeter.toFixed(2)} px` : "--"}
          </li>
          <li>
            <strong>Calibrated area:</strong>{" "}
            {summary.calibratedArea !== null ? `${summary.calibratedArea.toFixed(4)} ${summary.areaUnit}` : "--"}
          </li>
          <li>
            <strong>Calibrated perimeter:</strong>{" "}
            {summary.calibratedPerimeter !== null
              ? `${summary.calibratedPerimeter.toFixed(4)} ${summary.lengthUnit}`
              : "--"}
          </li>
        </ul>
      </section>

      <section>
        <h3>Layers</h3>
        <ul>
          {layers.map((layer) => (
            <li key={layer}>{layer}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default PropertiesPanel;
