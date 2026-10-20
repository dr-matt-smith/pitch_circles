import { DisplayMode } from '../model/DisplayMode.ts';
import { Level, LEVELS } from '../model/Level.ts';
import { PitchClass } from '../model/PitchClass.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { CircleGeometry } from './CircleGeometry.ts';
import { levelColour, Palette } from './Palette.ts';
import { ringOf } from './ringOrder.ts';


/**
 * Draws tonal pitch space on a canvas as five concentric rings of 12 segments, one ring per level.
 * A segment is coloured when its pitch class is in that level (each level has its own colour), and grey when not.
 * The chord's notes are outlined as slices, from the centre to the edge.
 *
 * Normally the chromatic level is the innermost ring; with `reversed` it is the outermost (see ringOf()).
 *
 * The canvas is sized to fit its parent element, and redrawn whenever that changes size.
 */
export class PitchCirclesView {
  private readonly ctx: CanvasRenderingContext2D;
  reversed = false; // redraw() after changing it
  private geometry: CircleGeometry;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.geometry = this.fitToParent();
  }

  /**
   * Size the canvas to its parent (in device pixels, so it stays sharp), and work out the geometry for that size.
   * Returns the new geometry; call redraw() afterwards.
   */
  fitToParent(): CircleGeometry {
    const { clientWidth: width, clientHeight: height } = this.canvas.parentElement!;
    const scale = globalThis.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * scale);
    this.canvas.height = Math.round(height * scale);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const maxRadius = Math.min(width, height) / 2;
    this.geometry = new CircleGeometry(
      { x: width / 2, y: height / 2 },
      maxRadius,
      maxRadius * 0.16,
      5, // rings: one per level
      5.6, // ring widths from the inner circle to the edge (a little more than 5, for a margin)
    );
    return this.geometry;
  }

  /** Which ring a level is drawn on, counting out from the innermost (0). */
  ringOf(level: Level): number {
    return ringOf(level, this.reversed);
  }

  /** Where everything is drawn, for the current size. */
  get layout(): CircleGeometry {
    return this.geometry;
  }

  redraw(space: TonalPitchSpace, mode: DisplayMode): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawRings(space);
    this.drawLines();
    this.drawChordSlices(space);
    this.drawRootDots(space);
    this.drawLabels(mode);
  }

  // Fill the rings from the outside in: each ring's disc is drawn over the inner part of the ring before it.
  private drawRings(space: TonalPitchSpace): void {
    const geo = this.geometry;
    const outsideIn = [...LEVELS].sort((a, b) => this.ringOf(b) - this.ringOf(a));
    for (const level of outsideIn) {
      const radius = geo.ringOuter(this.ringOf(level));
      this.disc(radius, Palette.off);

      for (const pc of space.level(level).members()) {
        const { start, end } = geo.segmentOf(pc);
        this.slice(radius, start, end, levelColour(level));
      }
    }
  }

  // The chord as 'pizza slices': a bold outline round each of its notes' wedges, from the centre to the outer edge.
  // Only outlined, so the rings' colours inside still show
  private drawChordSlices(space: TonalPitchSpace): void {
    const ctx = this.ctx;
    const geo = this.geometry;
    const { x, y } = geo.centre;
    ctx.strokeStyle = Palette.chordSlice;
    ctx.lineWidth = Math.max(2.5, geo.gap * 0.06);
    ctx.lineJoin = 'round';
    for (const pc of space.level(Level.Triadic).members()) {
      const { start, end } = geo.segmentOf(pc);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, geo.outerRadius, start, end);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // The root dots: the region's tonic (red) in the diatonic ring, and the chord's root (yellow) in the outermost
  // ring, whichever level that is. Each sits in its segment, just outside the label.
  private drawRootDots(space: TonalPitchSpace): void {
    const geo = this.geometry;
    const dotRadius = Math.max(4, geo.gap * 0.11);
    const at = (pc: PitchClass, ring: number) => geo.pointAt(geo.angleOf(pc), geo.ringInner(ring) + geo.gap * 0.8);
    this.dot(at(space.regionRoot, this.ringOf(Level.Diatonic)), dotRadius, Palette.regionRootDot);
    this.dot(at(space.chordRoot, geo.rings - 1), dotRadius, Palette.chordRootDot);
  }

  // The circles, and the lines between the pitch classes
  private drawLines(): void {
    const ctx = this.ctx;
    const geo = this.geometry;
    const { x, y } = geo.centre;
    ctx.strokeStyle = Palette.line;
    ctx.lineWidth = 1.5;

    for (let ring = 0; ring <= geo.rings; ring++) {
      ctx.beginPath();
      ctx.arc(x, y, geo.ringInner(ring), 0, 2 * Math.PI);
      ctx.stroke();
    }
    for (const pc of PitchClass.all()) {
      const edge = geo.pointAt(geo.segmentOf(pc).end, geo.outerRadius);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(edge.x, edge.y);
      ctx.stroke();
    }
  }

  private drawLabels(mode: DisplayMode): void {
    const ctx = this.ctx;
    const geo = this.geometry;
    ctx.fillStyle = Palette.line;
    ctx.font = `${Math.round(geo.gap * 0.33)}px "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const level of LEVELS) {
      for (const pc of PitchClass.all()) {
        const p = geo.pointAt(geo.angleOf(pc), geo.ringMiddle(this.ringOf(level)));
        ctx.fillText(pc.label(mode), p.x, p.y);
      }
    }
  }

  private disc(radius: number, colour: string): void {
    const { x, y } = this.geometry.centre;
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  // A pie slice from the centre, between two angles
  private slice(radius: number, start: number, end: number, colour: string): void {
    const { x, y } = this.geometry.centre;
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, start, end);
    this.ctx.closePath();
    this.ctx.fill();
  }

  // A dot with a thin dark outline, so it shows up on any ring colour
  private dot(p: { x: number; y: number }, radius: number, colour: string): void {
    this.ctx.fillStyle = colour;
    this.ctx.strokeStyle = Palette.dotOutline;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
}
