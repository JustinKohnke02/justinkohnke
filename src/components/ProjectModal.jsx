import ProducerMirrorPreview from "./ProducerMirrorPreview";

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  const allImages = project.cover
    ? [project.cover, ...(project.images || []).filter((src) => src !== project.cover)]
    : project.images || [];

  return (
    <div className="modalBg" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalTop">
          <div>
            <b>{project.title}</b>{" "}
            <span style={{ color: "var(--muted)" }}>· {project.year}</span>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <div className="modalBody">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {project.id === "a4" ? (
              <ProducerMirrorPreview />
            ) : allImages.length > 0 ? (
              allImages.map((src) => (
                <div key={src} className="frame" style={{ aspectRatio: "16/9" }}>
                  <img src={src} alt="" className="img imgContain" />
                </div>
              ))
            ) : (
              <div className="frame" style={{ aspectRatio: "16/9" }}>
                <div className="coverPlaceholder">
                  <span className="coverPlaceholderTitle">{project.title}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{project.role}</div>

            <p style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              {project.desc}
            </p>

            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(project.tags || []).map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>

            <div className="hair" />

            <ol className="list">
              {(project.bullets || []).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
