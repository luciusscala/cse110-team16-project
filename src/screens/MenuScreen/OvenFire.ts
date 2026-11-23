import Konva from "konva";

/** Bottom of the oven opening, where the flames sit on the ledge. */
const FIRE_BASE_Y = 432;

/**
 * How fast the fire flickers relative to the base wave speeds below.
 * Lower is slower and calmer; 1 is the original fast flicker.
 */
const FIRE_SPEED = 0.35;

/** Quadratic curve segment: [controlX, controlY, endX, endY]. */
type Segment = [number, number, number, number];

interface FlameShape {
	start: [number, number];
	segments: Segment[];
}

// Flame outlines in stage coordinates, positioned inside the oven opening
// of menu-background.svg (the arch spanning x 52-168, y 285-435).
const OUTER_FLAME: FlameShape = {
	start: [68, FIRE_BASE_Y],
	segments: [
		[70, 395, 84, 380],
		[86, 400, 96, 404],
		[96, 370, 112, 352],
		[114, 385, 128, 392],
		[132, 372, 146, 366],
		[154, 400, 152, FIRE_BASE_Y],
	],
};

const INNER_FLAME: FlameShape = {
	start: [86, FIRE_BASE_Y],
	segments: [
		[88, 410, 98, 402],
		[102, 416, 110, 418],
		[112, 398, 122, 388],
		[128, 410, 136, FIRE_BASE_Y],
	],
};

/**
 * OvenFire - Animated cartoon fire for the menu screen's pizza oven.
 *
 * Each frame, every point of a flame outline is stretched vertically by an
 * amount that varies with time and with its x position. Neighboring tongues
 * therefore flicker out of step, and the flame looks alive, not like it's
 * bouncing. Points on the base line don't move, so the fire stays seated on
 * the ledge.
 */
export class OvenFire {
	private group: Konva.Group;
	private glow: Konva.Ellipse;
	private outerFlame: Konva.Shape;
	private innerFlame: Konva.Shape;
	private animation: Konva.Animation | null = null;
	private time = 0;

	constructor() {
		this.group = new Konva.Group({
			name: "ovenFire",
			listening: false,
			// Keep flames inside the oven's arched opening
			clipFunc: (ctx) => {
				ctx.beginPath();
				ctx.moveTo(52, FIRE_BASE_Y - 1);
				ctx.lineTo(52, 345);
				ctx.quadraticCurveTo(52, 285, 110, 285);
				ctx.quadraticCurveTo(168, 285, 168, 345);
				ctx.lineTo(168, FIRE_BASE_Y - 1);
				ctx.closePath();
			},
		});

		this.glow = new Konva.Ellipse({
			x: 110,
			y: 415,
			radiusX: 62,
			radiusY: 50,
			fillRadialGradientStartPoint: { x: 0, y: 0 },
			fillRadialGradientStartRadius: 0,
			fillRadialGradientEndPoint: { x: 0, y: 0 },
			fillRadialGradientEndRadius: 62,
			fillRadialGradientColorStops: [0, "rgba(255, 207, 74, 0.9)", 1, "rgba(255, 122, 26, 0)"],
			name: "fireGlow",
		});

		this.outerFlame = new Konva.Shape({
			fill: "#ff7a1a",
			stroke: "#4a2511",
			strokeWidth: 3,
			lineJoin: "round",
			name: "outerFlame",
			sceneFunc: (ctx, shape) => this.drawFlame(ctx, shape, OUTER_FLAME, 0),
		});

		this.innerFlame = new Konva.Shape({
			fill: "#ffd45c",
			name: "innerFlame",
			sceneFunc: (ctx, shape) => this.drawFlame(ctx, shape, INNER_FLAME, 2.1),
		});

		this.group.add(this.glow, this.outerFlame, this.innerFlame);
		this.update(0);
	}

	/** Begin animating. Does nothing until the group has been added to a layer. */
	start(): void {
		const layer = this.group.getLayer();
		if (!layer) return;
		if (!this.animation) {
			this.animation = new Konva.Animation((frame) => {
				if (frame) this.update(frame.time);
			}, layer);
		}
		this.animation.start();
	}

	/** Stop animating, so the layer isn't redrawn while the menu is hidden. */
	stop(): void {
		this.animation?.stop();
	}

	isRunning(): boolean {
		return this.animation?.isRunning() ?? false;
	}

	/** Advance the fire to the given time in milliseconds. */
	update(timeMs: number): void {
		this.time = timeMs * FIRE_SPEED;
		// Glow pulses a little out of step with the flames
		const pulse = 0.5 * Math.sin(this.time * 0.006) + 0.5 * Math.sin(this.time * 0.0137 + 1.3);
		this.glow.opacity(0.8 + 0.2 * pulse);
		this.glow.scaleY(1 + 0.06 * pulse);
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	private drawFlame(ctx: Konva.Context, shape: Konva.Shape, flame: FlameShape, phase: number): void {
		const t = this.time;
		const move = (x: number, y: number): [number, number] => {
			const height = FIRE_BASE_Y - y;
			// Two waves at unrelated speeds keep the flicker from looking periodic
			const stretch =
				1 + 0.14 * Math.sin(t * 0.009 + x * 0.11 + phase) + 0.07 * Math.sin(t * 0.017 + x * 0.05 + phase);
			const sway = 3 * Math.sin(t * 0.004 + x * 0.02 + phase) * (height / 80);
			return [x + sway, FIRE_BASE_Y - height * stretch];
		};

		ctx.beginPath();
		ctx.moveTo(...move(...flame.start));
		for (const [cx, cy, x, y] of flame.segments) {
			ctx.quadraticCurveTo(...move(cx, cy), ...move(x, y));
		}
		ctx.closePath();
		ctx.fillStrokeShape(shape);
	}
}
