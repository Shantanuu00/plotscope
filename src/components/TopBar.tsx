type TopBarProps = {
  onImportImage: () => void;
};

function TopBar({ onImportImage }: TopBarProps) {
  return (
    <header className="top-toolbar" role="banner">
      <div className="brand">PlotScope</div>
      <div className="toolbar-actions">
        <button type="button">Open Plan</button>
        <button type="button" onClick={onImportImage}>
          Import Image
        </button>
        <button type="button">Export Report</button>
      </div>
    </header>
  );
}

export default TopBar;
