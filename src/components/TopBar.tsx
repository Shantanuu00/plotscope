type TopBarProps = {
  actions: string[];
  onAction?: (action: string) => void;
};

function TopBar({ actions, onAction }: TopBarProps) {
  return (
    <header className="top-toolbar" role="banner">
      <div className="brand">PlotScope</div>
      <nav aria-label="Primary tools">
        <ul className="toolbar-actions">
          {actions.map((action) => (
            <li key={action}>
              <button type="button" onClick={() => onAction?.(action)}>
                {action}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default TopBar;