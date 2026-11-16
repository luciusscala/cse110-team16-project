// @vitest-environment jsdom
import Konva from "konva";
import "vitest-canvas-mock";
import { describe, expect, test } from "vitest";
import { Fraction } from "../models/Fraction.ts";
import type { BakeryFood, FoodTile } from "./FoodVisualState.ts";
import { FractionFoodVisual } from "./FractionFoodVisual.ts";

function makeTiles(numerator: number, denominator: number): FoodTile[] {
    return [{ label: "Test fraction", fraction: new Fraction(numerator, denominator) }];
}

function draw(food: BakeryFood, numerator: number, denominator: number): Konva.Group {
    const visual = new FractionFoodVisual();
    visual.render(food, makeTiles(numerator, denominator));
    return visual.getGroup();
}

function wedges(group: Konva.Group): Konva.Wedge[] {
    return group.find("Wedge") as Konva.Wedge[];
}

function countFill(group: Konva.Group, color: string): number {
    return wedges(group).filter(slice => slice.fill() === color).length;
}

describe("FractionFoodVisual", () => {
    test.each([
        ["pizza", "#E7A25A"],
        ["cookie", "#BD834D"],
        ["cake", "#F3A3C4"],
    ] as const)("draws 3/4 as four %s slices, three highlighted and one white", (food, highlight) => {
        const group = draw(food, 3, 4);
        expect(wedges(group)).toHaveLength(4);
        expect(countFill(group, highlight)).toBe(3);
        expect(countFill(group, "#FFFFFF")).toBe(1);
        expect(group.find("Text").some(node => (node as Konva.Text).text() === "3/4")).toBe(true);
    });

    test("draws two separate foods for an improper fraction", () => {
        const group = draw("pizza", 5, 4);
        const slices = wedges(group);
        expect(slices).toHaveLength(8);
        expect(countFill(group, "#E7A25A")).toBe(5);
        expect(countFill(group, "#FFFFFF")).toBe(3);
        expect(new Set(slices.map(slice => slice.x())).size).toBe(2);
    });

    test("draws an entirely white food for a zero numerator", () => {
        const group = draw("cookie", 0, 4);
        expect(wedges(group)).toHaveLength(4);
        expect(countFill(group, "#FFFFFF")).toBe(4);
        expect(group.find("Arc")).toHaveLength(0);
    });

    test("adds pizza pepperoni and basil to selected portions", () => {
        const group = draw("pizza", 3, 4);
        const circles = group.find("Circle") as Konva.Circle[];
        const leaves = group.find("Ellipse") as Konva.Ellipse[];
        expect(circles.some(circle => circle.fill() === "#B63230")).toBe(true);
        expect(leaves.some(leaf => leaf.fill() === "#39864A")).toBe(true);
    });

    test("adds chocolate chips to the cookie", () => {
        const group = draw("cookie", 3, 4);
        const circles = group.find("Circle") as Konva.Circle[];
        expect(circles.some(circle => circle.fill() === "#4B2819")).toBe(true);
    });

    test("draws top-down cake wedges with frosting and cherries", () => {
        const group = draw("cake", 3, 4);
        const circles = group.find("Circle") as Konva.Circle[];
        expect(wedges(group)).toHaveLength(4);
        expect(circles.some(circle => circle.fill() === "#FFF0F5")).toBe(true);
        expect(circles.some(circle => circle.fill() === "#C73548")).toBe(true);
    });

    test("does not add decorative toppings when the denominator is over 24", () => {
        const group = draw("pizza", 1, 25);
        expect(wedges(group)).toHaveLength(25);
        const circles = group.find("Circle") as Konva.Circle[];
        expect(circles.every(circle => circle.fill() !== "#B63230")).toBe(true);
        expect(group.find("Ellipse")).toHaveLength(0);
    });

    test("uses a text fallback when denominator exceeds 36 in the current implementation", () => {
        const group = draw("pizza", 3, 50);
        expect(wedges(group)).toHaveLength(0);
        const texts = group.find("Text") as Konva.Text[];
        expect(texts.some(node => node.text() === "3 of 50 equal pieces")).toBe(true);
    });

    test("replaces old drawings when render is called again", () => {
        const visual = new FractionFoodVisual();
        visual.render("pizza", makeTiles(1, 2));
        expect(wedges(visual.getGroup())).toHaveLength(2);
        visual.render("cake", makeTiles(3, 4));
        expect(wedges(visual.getGroup())).toHaveLength(4);
        expect(countFill(visual.getGroup(), "#F3A3C4")).toBe(3);
        expect(countFill(visual.getGroup(), "#E7A25A")).toBe(0);
    });

    test("draws two tiles for a two-fraction problem", () => {
        const visual = new FractionFoodVisual();
        visual.render("pizza", [
            { label: "First amount", fraction: new Fraction(1, 2) },
            { label: "Add", fraction: new Fraction(1, 4) },
        ]);
        expect(visual.getGroup().getChildren()).toHaveLength(2);
        expect(wedges(visual.getGroup())).toHaveLength(6);
    });

    test("shows the text fallback when more than four whole foods are required", () => {
        const group = draw("cake", 5, 1);
        expect(wedges(group)).toHaveLength(0);
        expect((group.find("Text") as Konva.Text[]).some(node => node.text() === "5 of 1 equal pieces")).toBe(true);
    });
});
