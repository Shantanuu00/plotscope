const layers = ["Boundary", "Parcels", "Reference"];

type PropertiesPanelProps = {
  imageName?: string;
};

function PropertiesPanel({ imageName }: PropertiesPanelProps) {
  return (
    <aside className="right-panel" aria-label="Properties panel">
      <h2>Properties</h2>
      <section>
        <h3>Document</h3>
        <p>{imageName ?? "No file loaded."}</p>
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
