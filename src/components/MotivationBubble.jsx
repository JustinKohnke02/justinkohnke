import { useState } from "react";

export default function MotivationBubble({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="motivationWrap">
      <button className="motivationFab" onClick={() => setOpen((o) => !o)} aria-label="Notiz anzeigen">
        Warum ich?
      </button>
      {open && (
        <div className="motivationBubble">
          <button
            className="motivationClose"
            onClick={() => setOpen(false)}
            aria-label="Schließen"
          >
            ×
          </button>
          <div className="motivationBubbleTitle">P.S.</div>
          <p className="motivationBubbleText">{text}</p>
        </div>
      )}
    </div>
  );
}
