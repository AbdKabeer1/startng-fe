import { useEffect, useRef, useState } from "react";
import type { Game } from "./games";

// The games on one page wrapped into a disc, like pips on a die: a sunflower
// (phyllotaxis) spiral fills the circle evenly instead of leaving rings of gaps.
//
// Each pip is a real link to the game, so search engines and visits without
// JavaScript still follow it (the API writes the same games and links for them).
// With JavaScript a click rolls the die: the tiles spin and scatter outward,
// then the game's card rolls out over the page.
const GOLDEN_ANGLE = 2.399963229728653;
/** How far the tiles travel outward when the die rolls. */
const SCATTER = 1.16;
/** How long the roll plays before the card appears. */
const ROLL_MS = 340;

export default function GamesDice({
  games,
  onPick,
  linkFor,
  rolledOut,
  onScatter,
}: {
  games: Game[];
  onPick: (g: Game) => void;
  linkFor: (g: Game) => { href: string; onClick?: (e: React.MouseEvent) => void };
  /** True while a game's card is open; the die gathers again when it closes. */
  rolledOut: boolean;
  /** The middle ball was pressed: scatter the games back into the grid. */
  onScatter: () => void;
}) {
  const [scattered, setScattered] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!rolledOut) setScattered(false);
  }, [rolledOut]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function roll(g: Game) {
    setScattered(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onPick(g), ROLL_MS);
  }

  // The middle ball: throw every tile outward, then show the normal grid again.
  function scatter() {
    setScattered(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onScatter, ROLL_MS);
  }

  return (
    <div className={scattered ? "dice scattered" : "dice"}>
      {games.map((g, i) => {
        const angle = i * GOLDEN_ANGLE;
        const radius = 15 + 27 * Math.sqrt((i + 0.5) / games.length);
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const link = linkFor(g);
        return (
          <a
            key={g.slug}
            className="dice-tile"
            href={link.href}
            title={g.title}
            onClick={(event) => {
              // The die rolls and the card follows; without JavaScript the href takes over.
              event.preventDefault();
              roll(g);
            }}
            style={
              {
                "--x": `${x}%`,
                "--y": `${y}%`,
                "--sx": `${50 + (x - 50) * SCATTER}%`,
                "--sy": `${50 + (y - 50) * SCATTER}%`,
                "--rot": `${((i * 37) % 61) - 30}deg`,
                "--i": i,
              } as React.CSSProperties
            }
          >
            <span
              className="art"
              style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
            >
              {g.cover ? (
                <img src={g.cover} alt="" loading="lazy" decoding="async" />
              ) : (
                <span>{g.title.charAt(0)}</span>
              )}
            </span>
            <span className="name">{g.title}</span>
          </a>
        );
      })}
      <button
        type="button"
        className="dice-hub"
        onClick={scatter}
        aria-label="Scatter the games back into a grid"
        title="Scatter the games back into a grid"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12H3M21 12h-5M12 8V3M12 21v-5" />
          <path d="m6.3 6.3-3.5-3.5M17.7 6.3l3.5-3.5M6.3 17.7l-3.5 3.5M17.7 17.7l3.5 3.5" />
        </svg>
        <span aria-hidden="true">Scatter</span>
      </button>
    </div>
  );
}
