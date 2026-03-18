type PropertiesPanelProps = {
  layers: string[];
  imageName?: string;
};

function PropertiesPanel({ layers, imageName }: PropertiesPanelProps) {
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
