import { afterEach, describe, expect, test } from "vitest";
import Konva from "konva";
import { OvenFire } from "./OvenFire.ts";

describe("OvenFire", () => {
	let fire: OvenFire;

	afterEach(() => fire?.stop());

	test("contains a glow and two flames and ignores clicks", () => {
		fire = new OvenFire();
		const group = fire.getGroup();
		expect(group.findOne(".fireGlow")).toBeDefined();
		expect(group.findOne(".outerFlame")).toBeDefined();
		expect(group.findOne(".innerFlame")).toBeDefined();
		expect(group.listening()).toBe(false);
	});

	test("does not start animating before it is on a layer", () => {
		fire = new OvenFire();
		fire.start();
		expect(fire.isRunning()).toBe(false);
	});

	test("starts and stops once it is on a layer", () => {
		fire = new OvenFire();
		const layer = new Konva.Layer();
		layer.add(fire.getGroup());
		fire.start();
		expect(fire.isRunning()).toBe(true);
		fire.stop();
		expect(fire.isRunning()).toBe(false);
	});

	test("glow flickers over time and stays visible", () => {
		fire = new OvenFire();
		const glow = fire.getGroup().findOne<Konva.Ellipse>(".fireGlow")!;
		const opacities = [0, 250, 500, 750, 1000].map((t) => {
			fire.update(t);
			return glow.opacity();
		});
		expect(new Set(opacities).size).toBeGreaterThan(1);
		for (const opacity of opacities) {
			expect(opacity).toBeGreaterThanOrEqual(0.6);
			expect(opacity).toBeLessThanOrEqual(1);
		}
	});
});
