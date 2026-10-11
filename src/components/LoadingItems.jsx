/**
 * What the list shows while the item data downloads, or when it couldn't
 * be downloaded (usually a lost connection).
 *
 * Props:
 *   failed - true when the download failed, so it says what to do next
 */
export default function LoadingItems({ failed = false }) {
  return (
    <div className="panel px-4 py-12 text-center" role={failed ? 'alert' : 'status'}>
      {failed ? (
        <>
          <p className="text-fg">The items couldn’t be loaded.</p>
          <p className="mt-1 text-sm text-muted">Check your connection, then reload the page.</p>
          <button type="button" onClick={() => window.location.reload()} className="button-small mt-4">
            Reload
          </button>
        </>
      ) : (
        <p className="text-muted">Loading items…</p>
      )}
    </div>
  );
}
