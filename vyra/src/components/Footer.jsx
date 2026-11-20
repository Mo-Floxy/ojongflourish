import { AudioWaveform, AtSign, Play, Code2 } from "lucide-react";
import { TRACKS } from "../data/music";

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="page-footer__brand">
        <span className="brand__mark brand__mark--sm">
          <AudioWaveform size={16} />
        </span>
        <span className="brand__name brand__name--sm">VYRA</span>
        <p>Crafted for the love of sound.</p>
      </div>
      <nav className="page-footer__links" aria-label="Footer">
        <a href="#top">About</a>
        <a href="#genres">Genres</a>
        <a href="#charts">Charts</a>
        <a href="#made-for-you">Mixes</a>
      </nav>
      <div className="page-footer__social">
        <a href="#top" aria-label="Social">
          <AtSign size={17} />
        </a>
        <a href="#top" aria-label="Videos">
          <Play size={16} fill="currentColor" />
        </a>
        <a href="#top" aria-label="Developer">
          <Code2 size={17} />
        </a>
      </div>
      <p className="page-footer__legal">© 2026 VYRA Audio Labs · Demo streaming interface</p>
      <details className="page-footer__credits">
        <summary>Music credits</summary>
        <p>
          Full-length vocal tracks sourced from ccMixter and the Free Music Archive. Audio is locally
          hosted and encoded at 96 kbps for this demo. Please support the artists.
        </p>
        <ul>
          {TRACKS.map((track) => (
            <li key={track.id}>
              <span className="page-footer__credit-title">
                {track.title} — {track.credit}
              </span>
              <a href={track.source} target="_blank" rel="noreferrer">
                {track.source.includes("freemusicarchive.org") ? "FMA page" : "ccMixter page"}
              </a>
              <a href={track.licenseUrl} target="_blank" rel="noreferrer">
                {track.license}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </footer>
  );
}
