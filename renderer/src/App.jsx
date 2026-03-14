import { useCallback, useEffect, useRef } from "react";
import Card from "./components/Card";
import { useAppContext } from "./context/useAppContext";
import { useCanvas } from "./hooks/useCanvas";
import { isEditableElement, isUrl } from "./lib/workspace";

function folderNameFromPath(folderPath) {
  if (!folderPath) {
    return "No folder selected";
  }

  const segments = folderPath.split(/[\\/]/);
  return segments[segments.length - 1] || folderPath;
}

export default function App() {
  const {
    booting,
    error,
    folderLoading,
    folderPath,
    openFolder,
    setError,
    workspace,
    setViewport,
    createNewTextCard,
    createNewLinkCard,
    updateExistingCard,
  } = useAppContext();
  const { containerRef, handleCanvasPointerDown, handleCanvasWheel } = useCanvas({
    viewport: workspace.viewport,
    onViewportChange: setViewport,
  });
  const dragStateRef = useRef(null);

  const triggerPreview = useCallback(async (card) => {
    try {
      await window.airpaste.fetchLinkPreview(folderPath, card.id, card.url, card);
    } catch (previewError) {
      updateExistingCard(card.id, { status: "failed" });
      setError(previewError.message || "Unable to fetch preview metadata.");
    }
  }, [folderPath, setError, updateExistingCard]);

  useEffect(() => {
    function handlePaste(event) {
      if (!folderPath || isEditableElement(document.activeElement)) {
        return;
      }

      const text = event.clipboardData?.getData("text/plain")?.trim();

      if (!text) {
        return;
      }

      event.preventDefault();

      if (isUrl(text)) {
        const card = createNewLinkCard(text);
        void triggerPreview(card);
        return;
      }

      createNewTextCard(text);
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [createNewLinkCard, createNewTextCard, folderPath, triggerPreview]);

  useEffect(() => {
    function handlePointerMove(event) {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = (event.clientX - dragStateRef.current.pointerX) / workspace.viewport.zoom;
      const deltaY = (event.clientY - dragStateRef.current.pointerY) / workspace.viewport.zoom;

      updateExistingCard(dragStateRef.current.cardId, {
        x: dragStateRef.current.originX + deltaX,
        y: dragStateRef.current.originY + deltaY,
      });
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [updateExistingCard, workspace.viewport.zoom]);

  const handleCardDragStart = useCallback((card, event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    dragStateRef.current = {
      cardId: card.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: card.x,
      originY: card.y,
    };
  }, []);

  if (booting) {
    return (
      <div className="app-shell app-shell--booting">
        <div className="launch-panel">
          <p className="launch-panel__eyebrow">AirPaste</p>
          <h1>Restoring your local canvas</h1>
          <p>Opening the last folder if one is available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <p className="sidebar__eyebrow">AirPaste</p>
          <h1 className="sidebar__title">Local capture board</h1>
          <p className="sidebar__body">
            Paste links or notes and keep everything inside one local folder.
          </p>
        </div>

        <section className="sidebar__panel">
          <p className="sidebar__section-label">Current folder</p>
          <h2 className="sidebar__folder-name">{folderNameFromPath(folderPath)}</h2>
          <p className="sidebar__folder-path">{folderPath || "Choose a folder to create or load data.json."}</p>
        </section>

        <section className="sidebar__panel sidebar__panel--stats">
          <div>
            <p className="sidebar__stat-label">Cards</p>
            <p className="sidebar__stat-value">{workspace.cards.length}</p>
          </div>
          <div>
            <p className="sidebar__stat-label">Zoom</p>
            <p className="sidebar__stat-value">{Math.round(workspace.viewport.zoom * 100)}%</p>
          </div>
        </section>

        <div className="sidebar__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => void openFolder()}
            disabled={folderLoading}
          >
            {folderLoading ? "Opening..." : "Open Folder"}
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => createNewTextCard("")}
            disabled={!folderPath}
          >
            New Text Card
          </button>
        </div>

        <div className="sidebar__hint">
          <p>Paste anywhere on the board with <kbd>Ctrl</kbd> + <kbd>V</kbd>.</p>
          <p>Hold <kbd>Ctrl</kbd> while scrolling to zoom, or drag the canvas to pan.</p>
        </div>
      </aside>

      <main className="workspace">
        {!folderPath ? (
          <section className="empty-state">
            <p className="empty-state__eyebrow">Offline by default</p>
            <h2>Pick one folder and AirPaste will create `data.json` for you.</h2>
            <p>
              Every card, note, position, and preview stays inside that folder. No
              accounts, sync, or hidden database setup.
            </p>
            <button
              className="button button--primary"
              type="button"
              onClick={() => void openFolder()}
              disabled={folderLoading}
            >
              {folderLoading ? "Opening..." : "Open Folder"}
            </button>
          </section>
        ) : (
          <>
            <header className="workspace__header">
              <div>
                <p className="workspace__eyebrow">Single-canvas vault</p>
                <h2>{folderNameFromPath(folderPath)}</h2>
              </div>
              <p className="workspace__summary">
                {workspace.cards.length === 0
                  ? "Paste a link or a note to begin."
                  : `${workspace.cards.length} card${workspace.cards.length === 1 ? "" : "s"} stored locally.`}
              </p>
            </header>

            <div
              ref={containerRef}
              className="canvas"
              onPointerDown={handleCanvasPointerDown}
              onWheel={handleCanvasWheel}
            >
              <div
                className="canvas__grid"
                style={{
                  backgroundSize: `${28 * workspace.viewport.zoom}px ${28 * workspace.viewport.zoom}px`,
                  backgroundPosition: `${workspace.viewport.x}px ${workspace.viewport.y}px`,
                }}
              />
              <div
                className="canvas__content"
                style={{
                  transform: `translate(${workspace.viewport.x}px, ${workspace.viewport.y}px) scale(${workspace.viewport.zoom})`,
                }}
              >
                {workspace.cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onDragStart={handleCardDragStart}
                    onTextChange={(cardId, nextText) => updateExistingCard(cardId, { text: nextText })}
                    onRetry={(nextCard) => {
                      updateExistingCard(nextCard.id, { status: "loading" });
                      void triggerPreview(nextCard);
                    }}
                  />
                ))}
              </div>

              {workspace.cards.length === 0 ? (
                <div className="canvas__empty">
                  <p className="canvas__empty-title">Blank board, local data.</p>
                  <p>Paste a URL for a preview card or paste text for a quick note.</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>

      {error ? (
        <div className="toast">
          <p>{error}</p>
          <button
            className="toast__dismiss"
            type="button"
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
