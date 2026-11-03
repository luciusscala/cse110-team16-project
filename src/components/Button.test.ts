import { describe, expect, test, vi } from "vitest";
import Konva from "konva";
import { Button } from "./Button.ts";

function makeButton(overrides: Partial<ConstructorParameters<typeof Button>[0]> = {}) {
	return new Button({
		x: 10,
		y: 20,
		width: 200,
		height: 60,
		text: "PLAY",
		onClick: () => {},
		...overrides,
	});
}

describe("Button", () => {
	test("positions its group at the given x and y", () => {
		const group = makeButton().getGroup();
		expect(group.x()).toBe(10);
		expect(group.y()).toBe(20);
	});

	test("sets the group name when provided", () => {
		const group = makeButton({ name: "playButton" }).getGroup();
		expect(group.name()).toBe("playButton");
	});

	test("contains a rect sized to the button", () => {
		const rect = makeButton().getGroup().findOne<Konva.Rect>("Rect");
		expect(rect).toBeDefined();
		expect(rect!.width()).toBe(200);
		expect(rect!.height()).toBe(60);
	});

	test("contains a label with the given text, centered over the button", () => {
		const button = makeButton();
		const label = button.getGroup().findOne<Konva.Text>("Text");
		expect(label).toBeDefined();
		expect(label!.text()).toBe("PLAY");
		expect(button.getText()).toBe("PLAY");
		expect(label!.width()).toBe(200);
		expect(label!.height()).toBe(60);
		expect(label!.align()).toBe("center");
		expect(label!.verticalAlign()).toBe("middle");
	});

	test("label does not intercept clicks meant for the button", () => {
		const label = makeButton().getGroup().findOne<Konva.Text>("Text");
		expect(label!.listening()).toBe(false);
	});

	test("uses default colors when none are given", () => {
		const group = makeButton().getGroup();
		expect(group.findOne<Konva.Rect>("Rect")!.fill()).toBe("green");
		expect(group.findOne<Konva.Rect>("Rect")!.stroke()).toBe("darkgreen");
		expect(group.findOne<Konva.Text>("Text")!.fill()).toBe("white");
		expect(group.findOne<Konva.Text>("Text")!.fontSize()).toBe(24);
	});

	test("applies custom colors and font size", () => {
		const group = makeButton({ fill: "blue", stroke: "navy", textColor: "yellow", fontSize: 18 }).getGroup();
		expect(group.findOne<Konva.Rect>("Rect")!.fill()).toBe("blue");
		expect(group.findOne<Konva.Rect>("Rect")!.stroke()).toBe("navy");
		expect(group.findOne<Konva.Text>("Text")!.fill()).toBe("yellow");
		expect(group.findOne<Konva.Text>("Text")!.fontSize()).toBe(18);
	});

	test("calls onClick when clicked", () => {
		const onClick = vi.fn();
		makeButton({ onClick }).getGroup().fire("click");
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	test("calls onClick when tapped", () => {
		const onClick = vi.fn();
		makeButton({ onClick }).getGroup().fire("tap");
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	test("does not call onClick without a click", () => {
		const onClick = vi.fn();
		makeButton({ onClick });
		expect(onClick).not.toHaveBeenCalled();
	});

	test("hover changes the stage cursor to pointer and back", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const stage = new Konva.Stage({ container, width: 400, height: 300 });
		const layer = new Konva.Layer();
		stage.add(layer);

		const group = makeButton().getGroup();
		layer.add(group);

		group.fire("mouseenter");
		expect(stage.container().style.cursor).toBe("pointer");
		group.fire("mouseleave");
		expect(stage.container().style.cursor).toBe("default");

		stage.destroy();
		container.remove();
	});

	test("hover without a stage does not throw", () => {
		const group = makeButton().getGroup();
		expect(() => group.fire("mouseenter")).not.toThrow();
		expect(() => group.fire("mouseleave")).not.toThrow();
	});
});
