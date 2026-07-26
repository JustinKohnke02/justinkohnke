export default function ProjectMap({ projects, onOpen }) {
  return (
    <div className="projectGrid">
      {projects.map((p) => (
        <div key={p.id} className="scatterWindow gridCard" onClick={() => onOpen(p)}>
          <div className="scatterMedia">
            {p.cover ? (
              <img className="img imgContain" src={p.cover} alt="" draggable={false} />
            ) : (
              <div className="coverPlaceholder">
                <span className="coverPlaceholderCode">{p.code}</span>
                <span className="coverPlaceholderTitle">{p.title}</span>
              </div>
            )}
          </div>
          <div className="scatterBody">
            <h3 className="scatterTitle">{p.title}</h3>
            <p className="scatterDesc">{p.desc}</p>
            <div className="scatterTags">
              {(p.tags || []).slice(0, 3).map((t) => (
                <span key={t} className="scatterTag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
