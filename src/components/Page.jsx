/**
 * Building blocks for text pages (About, Feedback, Contribute, Changelog),
 * so they all share one heading scale and layout:
 *   page title  (h1) 30px bold
 *   section     (h2) 20px semibold
 *   sub-heading (h3) 18px semibold
 *   body text        16px
 */

/** The page frame: a narrow readable column with the page title on top. */
export function Page({ title, intro, children }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-body">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-fg">{title}</h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
      </header>
      {children}
    </div>
  );
}

/** One white panel with a section title. */
export function Section({ title, children }) {
  return (
    <section className="panel space-y-3 p-6">
      <h2 className="text-xl font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

/** A heading inside a Section. */
export function SubHeading({ children }) {
  return <h3 className="pt-2 text-lg font-semibold text-fg">{children}</h3>;
}

/** A bulleted list with consistent spacing. */
export function BulletList({ children }) {
  return <ul className="list-disc space-y-1.5 pl-5 marker:text-faint">{children}</ul>;
}

/** Link that opens in a new tab, and says so to screen readers. */
export function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Link to another page of this site (same tab). */
export function PageLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
    >
      {children}
    </a>
  );
}
