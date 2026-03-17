type TopBarProps = {
  actions: string[];
};

function TopBar({ actions }: TopBarProps) {
  return (
    <header className="top-toolbar" role="banner">
      <div className="brand">PlotScope</div>
      <nav aria-label="Primary tools">
        <ul className="toolbar-actions">
          {actions.map((action) => (
            <li key={action}>
              <button type="button">{action}</button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default TopBar;
