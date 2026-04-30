import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? <header>{children}</header> : null
}

Header.css = `
.page > #quartz-body > .center > .page-header > header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25rem;
  padding: 0.65rem 1.5rem;
  margin: 0;
  background-color: color-mix(in srgb, var(--light) 85%, transparent);
  backdrop-filter: saturate(180%) blur(10px);
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  border-bottom: 1px solid var(--lightgray);
}

.page > #quartz-body > .center > .page-header > header > .page-title {
  font-size: 1.05rem;
  margin: 0;
  flex: 0 0 auto;
  letter-spacing: -0.01em;
}

.page > #quartz-body > .center > .page-header > header > .page-title::before {
  content: "$ ";
  color: var(--secondary);
  font-weight: 400;
  margin-right: 0.1em;
}

.page > #quartz-body > .center > .page-header > header > .page-title a {
  color: var(--dark);
  background-color: transparent;
}

.page > #quartz-body > .center > .page-header > header > .flex-component {
  flex: 1 1 auto;
  justify-content: flex-end;
  gap: 0.75rem;
  max-width: 480px;
  margin-left: auto;
}

@media all and (max-width: 800px) {
  .page > #quartz-body > .center > .page-header > header {
    padding: 0.5rem 1rem;
    gap: 0.75rem;
  }

  .page > #quartz-body > .center > .page-header > header > .page-title {
    font-size: 1rem;
  }
}
`

export default (() => Header) satisfies QuartzComponentConstructor
