import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import "./App.css";
import { cv } from "./data/cv";

import { projects } from "./data/projects";
import ProjectMap from "./components/ProjectMap";
import ProjectModal from "./components/ProjectModal";
import MotivationBubble from "./components/MotivationBubble";
import ProducerMirrorPreview from "./components/ProducerMirrorPreview";

const META = {
  boardName: "Bewerbung — Sony Music",
  titleLeft: "Justin Kohnke",
  titleCenter: "Portfolio / Works",
  titleRight: "Kontakt",
  date: "Jul 20 2026",
  author: "Justin Kohnke",
  tagline:
    "Ich entwickle digitale Werkzeuge, die kreative und organisatorische Arbeitsabläufe vereinfachen – von KI-Anwendungen über Automatisierung bis zu Webplattformen.",
  site: "justin-kohnke.com",
  contact: {
    email: cv.email,
    cvPdf: "/cv.pdf",
  },
};

const CV = cv;


export default function App() {
  const [active, setActive] = useState(null);

  const producerMirror = projects.find((p) => p.id === "a4");
  const otherProjects = projects.filter((p) => p.id !== "a4");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && active) setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className="pageRoot">
      <div className="board mx-auto w-full max-w-7xl">
        {/* Topbar */}
        <div className="topbar">
          <div className="topgrid">
            <div>
              <div className="metaTitle titleDisplay">{META.titleLeft}</div>
              <div className="metaSub">
                <span>{META.date}</span>
                <span>—</span>
                <span className="smallLink">{META.author}</span>
              </div>
            </div>

            <div>
              <div className="metaTitle">{META.titleCenter}</div>
              <div className="metaSub">
                <span className="smallLink">{META.site}</span>
              </div>
            </div>

            <div className="metaRight">
              <div className="metaTitle">{META.titleRight}</div>
              <div className="metaSub" style={{ justifyContent: "flex-end" }}>
                <a className="smallLink" href={`mailto:${META.contact.email}`}>{META.contact.email}</a>
              </div>
            </div>
          </div>

          <div className="metaSub" style={{ marginTop: 12, justifyContent: "space-between" }}>
            

            <div className="metaSub">
              
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <div className="layout">
            <div className="mainColumn">
              {producerMirror && (
                <div className="featured" onClick={() => setActive(producerMirror)}>
                  <div className="featuredMain">
                    <span className="featuredTag">Aktuell in Arbeit</span>
                    <h2 className="featuredTitle">KI-Tool für Musikproduktion & Workflow-Unterstützung</h2>
                    <p className="featuredText">
                      Woran ich gerade arbeite: Wie lässt sich KI in der Musikproduktion so
                      gestalten, dass sie unterstützt statt unbemerkt Entscheidungen zu
                      übernehmen ("AI Creep")? Mit Producer Mirror baue ich dafür einen rein
                      assistiven Ableton-Prototyp als Forschungsinstrument — komplett
                      eigenständig entwickelt, von der Idee bis zum fertigen
                      Max-for-Live-Device. Genau diese Mischung aus eigenständiger
                      Tool-Entwicklung, Prozessautomatisierung und analytischem Blick auf
                      Arbeitsabläufe möchte ich auch bei Sony Music einbringen.
                    </p>
                  </div>
                  <div className="featuredPreview">
                    <ProducerMirrorPreview compact />
                  </div>
                </div>
              )}

              <div className="sectionTitle" style={{ marginTop: 0 }}>ABGESCHLOSSENE PROJEKTE</div>
              <ProjectMap projects={otherProjects} onOpen={setActive} />
            </div>
            <CvPanel />
          </div>
        </div>

        <MotivationBubble text={cv.motivation} />
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </div>
  );
}

function CvPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="frame framePad cvCard" style={{ position: "sticky", top: 18 }}>
      <div className="roleLabel">{cv.title}</div>

      <div className="list" style={{ marginTop: 8 }}>
        <div>
          <a className="smallLink" href={`mailto:${cv.email}`}>{cv.email}</a>
        </div>
      </div>

      <div className="hair" />

      <div className="sectionTitle" style={{ marginTop: 0 }}>TECHNOLOGIEN</div>
      <div className="techTags">
        {cv.technologies.map((t) => (
          <span key={t} className="techTag">{t}</span>
        ))}
      </div>

      <div className="hair" />

      <div className={`cvBody ${open ? "cvBodyOpen" : ""}`}>
        <div className="sectionTitle">PROFIL</div>
        <div className="list">
          <div>{cv.profile}</div>
        </div>

        <div className="hair" />

        <div className="sectionTitle">BERUFSERFAHRUNG</div>
        <div className="list">
          {cv.experience.map((x) => (
            <div key={`${x.title}-${x.org}`} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>{x.years}</div>
              <div><b style={{ color: "var(--ink)" }}>{x.title}</b> — {x.org}</div>
              <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                {x.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="hair" />

        <div className="sectionTitle">AUSBILDUNG</div>
        <div className="list">
          {cv.education.map((e) => (
            <div key={`${e.title}-${e.org}`} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>{e.years}</div>
              <div><b style={{ color: "var(--ink)" }}>{e.title}</b> — {e.org}</div>
              <div>{e.detail}</div>
            </div>
          ))}
        </div>

        <div className="hair" />

        <div className="sectionTitle">KENNTNISSE</div>
        <div className="list">
          <div style={{ marginBottom: 8 }}>
            <b style={{ color: "var(--ink)" }}>Sprachen</b><br />
            {cv.knowledge.languages.map((l) => <div key={l}>{l}</div>)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <b style={{ color: "var(--ink)" }}>Software</b><br />
            <div>{cv.knowledge.software}</div>
          </div>
          <div>
            <b style={{ color: "var(--ink)" }}>Schwerpunkte</b><br />
            <div>{cv.knowledge.focus}</div>
          </div>
        </div>
      </div>

      <button className="btn cvToggle" onClick={() => setOpen((o) => !o)}>
        {open ? "Weniger anzeigen" : "Ganzen CV anzeigen"}
      </button>

      <div className="hair" />

      <div className="controls">
        <a className="pill" href={`mailto:${cv.email}`}>Email</a>
        <a className="pill pillAccent pillDownload" href={META.contact.cvPdf} target="_blank" rel="noreferrer">
          <Download size={14} strokeWidth={2.5} />
          Download CV
        </a>
      </div>
    </div>
  );
}
