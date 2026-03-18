type TopBarProps = {
  onImportImage: () => void;
};

function TopBar({ onImportImage }: TopBarProps) {
  return (
    <header className="top-toolbar" role="banner">
      <div className="toolbar-left">
        <div className="brand">PlotScope</div>
        <p className="toolbar-context">Land document workspace</p>
      </div>

      <div className="toolbar-right" aria-label="Primary actions">
        <div className="toolbar-actions toolbar-actions-secondary">
          <button type="button">Open Plan</button>
        </div>

        <span className="toolbar-divider" aria-hidden="true" />

        <div className="toolbar-actions toolbar-actions-primary">
          <button type="button" onClick={onImportImage}>
            Import Image
          </button>
          <button type="button">Export Report</button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
