import Konva from "konva";
import type { Fraction } from "../models/Fraction.ts";
import type { BakeryFood, FoodTile } from "./FoodVisualState.ts";

const MAX_VISIBLE_DIVISIONS = 24;

const PIZZA = {
    pepperoniDistance: 0.59,
    pepperoniSizeFactor: 0.48,
    cheeseDistance: 0.32,
    cheeseSizeFactor: 0.35,
    basilDistance: 0.80,
    secondPepperoniDistance: 0.43,
    secondPepperoniAngleOffset: 0.14,
};

const COOKIE = {
    chipDistance: 0.58,
    chipSizeFactor: 0.42,
    innerChipDistance: 0.28,
    outerChipDistance: 0.76,
    outerChipAngleOffset: 0.18,
};

const CAKE = {
    frostingDistance: 0.61,
    frostingSizeFactor: 0.48,
    sprinkleDistance: 0.34,
    cherryDistance: 0.79,
    cherrySizeFactor: 0.28,
};

/** Reusable, non-interactive Konva visuals for fractions in any game mode. */
export class FractionFoodVisual {
    private readonly group = new Konva.Group({ listening: false });

    getGroup(): Konva.Group {
        return this.group;
    }

    /** Redraws fractions after the controller selects a solving phase. */
    render(food: BakeryFood, tiles: readonly FoodTile[], layout: "horizontal" | "vertical" = "horizontal"): void {
        this.group.destroyChildren();
        const positions = tiles.length === 1 ? [90] : [90, 210];        
        tiles.forEach((tile, i) => {
            const panel = new Konva.Group({ 
                x: layout === "vertical" ? 145 : positions[i] ?? 350,
                y: layout === "vertical" ? 80 + i * 165 : 80, 
                listening: false 
            });
            panel.add(new Konva.Text({
                x: -145, y: -69, width: 290, align: "center",
                text: tile.label, fontSize: 18, fontFamily: "Arial", fill: "#303030",
            }));
            
            drawFraction(panel, tile.fraction, food);
            
            panel.add(new Konva.Text({
                x: -110, y: 57, width: 220, align: "center",
                text: `${tile.fraction.numerator}/${tile.fraction.denominator}`,
                fontSize: 22, fontStyle: "bold", fontFamily: "Arial", fill: "#242424",
            }));
            this.group.add(panel);
        });
        
        this.group.getLayer()?.batchDraw();
    }
}

function drawFraction(parent: Konva.Group, fraction: Fraction, food: BakeryFood): void {
    const { numerator, denominator } = fraction;
    if (!Number.isInteger(numerator) || numerator < 0 ||
        !Number.isInteger(denominator) || denominator <= 0) {
        parent.add(new Konva.Text({ x: -135, y: -20, width: 270, align: "center", text: `${numerator}/${denominator}`, fontSize: 18, fill: "#333"}))
        return;
    }
    const wholeCount = Math.max(1, Math.ceil(numerator / denominator));
    
    if (wholeCount > 4) {
        parent.add(new Konva.Text({
            x: -135, y: -20, width: 270, align: "center", fontSize: 18,
            text: `${numerator} of ${denominator} equal pieces`, fill: "#333",
        }));
        return;
    }
    const size = wholeCount === 1 ? 46 : Math.max(22, 46 - (wholeCount - 1) * 6);
    const spacing = size * 2 + 8;
    
    for (let whole = 0; whole < wholeCount; whole++) {
        const selected = Math.max(0, Math.min(denominator, numerator - whole * denominator));
        const x = (whole - (wholeCount - 1) / 2) * spacing;
        drawRoundFood(parent, x, 0, size, denominator, selected, food);
    }
}

/** A point in a wedge, measured from the center of a round food. */
function slicePoint(
    x: number, y: number, radius: number, denominator: number,
    index: number, radiusFraction: number, angleOffset = 0,
): { x: number; y: number } {
    const degrees = -90 + (index + 0.5 + angleOffset) * (360 / denominator);
    const radians = degrees * Math.PI / 180;
    
    return {
        x: x + radius * radiusFraction * Math.cos(radians),
        y: y + radius * radiusFraction * Math.sin(radians),
    };
}

function drawRoundFood(
    parent: Konva.Group, x: number, y: number, radius: number,
    denominator: number, selected: number, food: BakeryFood,
): void {
    const pizza = food === "pizza";
    const cake = food === "cake";
    const outline = pizza ? "#9B5C28" : cake ? "#975C7A" : "#694529";
    const highlight = pizza ? "#E7A25A" : cake ? "#F3A3C4" : "#BD834D";
    
    // Handle if the denominator is too large to show individual divisions
    if (denominator > MAX_VISIBLE_DIVISIONS) {
    // Draw an unfilled food.
    parent.add(new Konva.Circle({
        x, y, radius,
        fill: "#FFFFFF",
        listening: false,
    }));

    // Highlight the correct portion without division lines.
    if (selected === denominator) {
        parent.add(new Konva.Circle({
            x, y, radius,
            fill: highlight,
            listening: false,
        }));
    } else if (selected > 0) {
        parent.add(new Konva.Wedge({
            x, y, radius,
            angle: (selected / denominator) * 360,
            rotation: -90,
            fill: highlight,
            listening: false,
        }));
    }

    // Keep the outer border visible.
    parent.add(new Konva.Circle({
        x, y, radius,
        stroke: outline,
        strokeWidth: 1.6,
        listening: false,
    }));

    return;
    }

    const angle = 360 / denominator;

    // Every section, including empty sections, has an outline.
    for (let i = 0; i < denominator; i++) {
        parent.add(new Konva.Wedge({
            x, y, radius, angle, rotation: -90 + i * angle,
            fill: i < selected ? highlight : "#FFFFFF",
            stroke: outline, strokeWidth: 1,
            listening: false,
        }));
    }

    // Decorations are placed independently inside selected slices
    for (let i = 0; i < selected; i++) {
        if (pizza) drawPizzaToppings(parent, x, y, radius, denominator, i);
        else if (cake) drawCakeToppings(parent, x, y, radius, denominator, i);
        else drawCookieToppings(parent, x, y, radius, denominator, i);
    }

    // A small outer edge to distinguish each food
    for (let i = 0; i < selected; i++) {
        parent.add(new Konva.Arc({
            x, y, innerRadius: radius - (pizza ? 5 : cake ? 5 : 3),
            outerRadius: radius - 1,
            angle, rotation: -90 + i * angle,
            fill: pizza ? "#C88B45" : cake ? "#FFE0ED" : "#996037",
            listening: false,
        }));
    }

    // Re-establish section boundaries over all toppings and frosting.
    for (let i = 0; i < denominator; i++) {
        const radians = (-90 + i * angle) * Math.PI / 180;
        parent.add(new Konva.Line({
            points: [x, y, x + radius * Math.cos(radians), y + radius * Math.sin(radians)],
            stroke: outline, strokeWidth: 1, listening: false,
        }));
    }
    
    parent.add(new Konva.Circle({
        x, y, radius, stroke: outline, strokeWidth: 1.6, listening: false,
    }));
}

// Pepperoni toppings
function drawPizzaToppings(
    parent: Konva.Group, x: number, y: number, radius: number,
    denominator: number, index: number,
): void {
    if (denominator > 24) return;
    const outer = slicePoint(x, y, radius, denominator, index, PIZZA.pepperoniDistance);
    const halfWidth = radius * PIZZA.pepperoniDistance * Math.sin(Math.PI / denominator);
    const pepperoniRadius = Math.max(0.8, Math.min(5, halfWidth * PIZZA.pepperoniSizeFactor));
    
    parent.add(new Konva.Circle({
        ...outer, radius: pepperoniRadius, fill: "#B63230",
        stroke: "#85201F", strokeWidth: 0.7, listening: false,
    }));

    if (denominator <= 12) {
        const cheese = slicePoint(x, y, radius, denominator, index, PIZZA.cheeseDistance);
        parent.add(new Konva.Circle({
            ...cheese, radius: Math.min(2.1, halfWidth * PIZZA.cheeseSizeFactor),
            fill: "#FFE8A0", listening: false,
        }));
    }
    if (denominator <= 6) {
        const basil = slicePoint(x, y, radius, denominator, index, PIZZA.basilDistance);
        const direction = -90 + (index + 0.5) * (360 / denominator);
        
        parent.add(new Konva.Ellipse({
            ...basil, radiusX: 2.1, radiusY: 3.6,
            rotation: direction, fill: "#39864A", listening: false,
        }));
        const second = slicePoint(x, y, radius, denominator, index, PIZZA.secondPepperoniDistance, PIZZA.secondPepperoniAngleOffset);
        parent.add(new Konva.Circle({
            ...second, radius: Math.max(1.2, pepperoniRadius * 0.62),
            fill: "#B63230", listening: false,
        }));
    }
}


function drawCookieToppings(
    parent: Konva.Group, x: number, y: number, radius: number,
    denominator: number, index: number,
): void {
    if (denominator > 24) return;
    const halfWidth = radius * COOKIE.chipDistance * Math.sin(Math.PI / denominator);
    const size = Math.max(0.8, Math.min(3.2, halfWidth * COOKIE.chipSizeFactor));
    const locations = [
        slicePoint(x, y, radius, denominator, index, COOKIE.chipDistance),
    ];
    
    if (denominator <= 8) locations.push(slicePoint(x, y, radius, denominator, index, COOKIE.innerChipDistance));
    if (denominator <= 4) locations.push(slicePoint(x, y, radius, denominator, index, COOKIE.outerChipDistance, COOKIE.outerChipAngleOffset));
    
    for (const point of locations) {
        parent.add(new Konva.Circle({
            ...point, radius: size, fill: "#4B2819", listening: false,
        }));
    }
}


function drawCakeToppings(
    parent: Konva.Group, x: number, y: number, radius: number,
    denominator: number, index: number,
): void {
    if (denominator > 24) return;
    const halfWidth = radius * 0.62 * Math.sin(Math.PI / denominator);
    const frosting = slicePoint(x, y, radius, denominator, index, CAKE.frostingDistance);
    const dollopRadius = Math.max(0.8, Math.min(4.2, halfWidth * CAKE.frostingSizeFactor));
    
    parent.add(new Konva.Circle({
        ...frosting, radius: dollopRadius, fill: "#FFF0F5",
        stroke: "#DE86A9", strokeWidth: 0.7, listening: false,
    }));
    
    if (denominator <= 10) {
        const sprinkle = slicePoint(x, y, radius, denominator, index, CAKE.sprinkleDistance);
        const colors = ["#F5C94A", "#65B5D7", "#7ABF86", "#E76D83"];
        parent.add(new Konva.Line({
            points: [sprinkle.x - 2, sprinkle.y - 1, sprinkle.x + 2, sprinkle.y + 1],
            stroke: colors[index % colors.length], strokeWidth: 2,
            lineCap: "round", listening: false,
        }));
    }
    
    if (denominator <= 5) {
        const cherry = slicePoint(x, y, radius, denominator, index, CAKE.cherryDistance);
        parent.add(new Konva.Circle({
            ...cherry, radius: Math.min(2.7, halfWidth * CAKE.cherrySizeFactor),
            fill: "#C73548", listening: false,
        }));
    }
}
