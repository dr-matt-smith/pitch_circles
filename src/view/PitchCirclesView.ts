import * as Phaser from 'phaser';
import { DisplayMode } from '../model/DisplayMode.ts';
import { Level, LEVELS } from '../model/Level.ts';
import { PitchClass } from '../model/PitchClass.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { CircleGeometry } from './CircleGeometry.ts';
import { levelColour, Palette } from './Palette.ts';

// The levels whose root is marked with a pair of dots: the region's tonic, and the chord's root.
const LEVELS_WITH_ROOT_DOTS: readonly Level[] = [Level.Diatonic, Level.Root];
const DOT_OFFSET = (2 * Math.PI) / 40; // 9 degrees either side of the label

/**
 * Draws tonal pitch space as five concentric rings of 12 segments, one ring per level.
 * A segment is coloured when its pitch class is in that level, and grey when not.
 */
export class PitchCirclesView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  // labels[ring][pc], made once and updated in redraw()
  private readonly labels: Phaser.GameObjects.Text[][];

  constructor(
    scene: Phaser.Scene,
    private readonly geometry: CircleGeometry,
  ) {
    this.graphics = scene.add.graphics();
    const fontSize = Math.round(geometry.gap * 0.33);

    this.labels = LEVELS.map((level) =>
      PitchClass.all().map((pc) => {
        const p = geometry.pointAt(geometry.angleOf(pc), geometry.ringMiddle(level));
        return scene.add.text(p.x, p.y, '', {
          fontFamily: 'Times New Roman, serif',
          fontSize: `${fontSize}px`,
          color: '#0000ff',
        }).setOrigin(0.5);
      })
    );
  }

  redraw(space: TonalPitchSpace, mode: DisplayMode): void {
    const g = this.graphics;
    const geo = this.geometry;
    const { x, y } = geo.centre;
    g.clear();

    // Fill the rings from the outside in: each ring's disc is drawn over the inner part of the ring before it.
    for (const level of [...LEVELS].reverse()) {
      const radius = geo.ringOuter(level);
      const members = space.level(level);

      g.fillStyle(Palette.off);
      g.fillCircle(x, y, radius);

      g.fillStyle(levelColour(level));
      for (const pc of members.members()) {
        const { start, end } = geo.segmentOf(pc);
        g.slice(x, y, radius, start, end, false);
        g.fillPath();
      }
    }

    // Root dots
    for (const level of LEVELS_WITH_ROOT_DOTS) {
      const root = space.level(level).root();
      if (!root) continue;
      const radius = geo.ringInner(level) + geo.gap * 3 / 4;
      const dotRadius = Math.max(3, geo.gap * 0.08);
      const left = geo.pointAt(geo.angleOf(root) - DOT_OFFSET, radius);
      const right = geo.pointAt(geo.angleOf(root) + DOT_OFFSET, radius);
      g.fillStyle(Palette.rootDotLeft).fillCircle(left.x, left.y, dotRadius);
      g.fillStyle(Palette.rootDotRight).fillCircle(right.x, right.y, dotRadius);
    }

    // Circles, and the lines between the pitch classes
    g.lineStyle(1.5, Palette.line);
    for (let ring = 0; ring <= geo.rings; ring++) {
      g.strokeCircle(x, y, geo.ringInner(ring));
    }
    for (const pc of PitchClass.all()) {
      const edge = geo.pointAt(geo.segmentOf(pc).end, geo.outerRadius);
      g.lineBetween(x, y, edge.x, edge.y);
    }

    // Labels
    for (const level of LEVELS) {
      for (const pc of PitchClass.all()) {
        this.labels[level][pc.value].setText(pc.label(mode));
      }
    }
  }
}
