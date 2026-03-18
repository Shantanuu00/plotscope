type ToolSidebarProps = {
  tools: string[];
};

function ToolSidebar({ tools }: ToolSidebarProps) {
  return (
    <aside className="left-sidebar" aria-label="Tool sidebar">
      <h2>Tools</h2>
      <ul>
        {tools.map((tool) => (
          <li key={tool}>
            <button type="button">{tool}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default ToolSidebar;
