/**
 * Vitest setup - stubs the canvas 2D context for Konva under jsdom
 *
 * jsdom has no canvas implementation, so getContext("2d") returns null and Konva
 * throws as soon as it measures text. This stub stores assigned properties, gives
 * measureText an approximate width, getImageData a blank pixel buffer, and turns
 * every other method into a no-op.
 */
const contexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();

function createStubContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const state: Record<string | symbol, unknown> = { canvas, font: "10px sans-serif" };

	return new Proxy(state, {
		get(target, prop) {
			if (prop in target) {
				return target[prop];
			}
			if (prop === "measureText") {
				return (text: string) => {
					const fontSize = parseFloat(String(target.font)) || 10;
					return { width: text.length * fontSize * 0.5 };
				};
			}
			if (prop === "getImageData") {
				return (_x: number, _y: number, width: number, height: number) => ({
					width,
					height,
					data: new Uint8ClampedArray(width * height * 4),
				});
			}
			return () => {};
		},
		set(target, prop, value) {
			target[prop] = value;
			return true;
		},
	}) as unknown as CanvasRenderingContext2D;
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
	let context = contexts.get(this);
	if (!context) {
		context = createStubContext(this);
		contexts.set(this, context);
	}
	return context;
} as unknown as typeof HTMLCanvasElement.prototype.getContext;
