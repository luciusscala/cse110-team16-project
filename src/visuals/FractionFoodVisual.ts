import Konva from "konva";
import type { Fraction } from "../models/Fraction.ts";
import type { BakeryFood, FoodTile } from "./FoodVisualState.ts";

const MAX_VISIBLE_DIVISIONS = 24;
const FOOD_RADIUS = 38;
const WHOLE_GAP = 8;
const PANEL_GAP = 24;
const AREA_PADDING = 3;
const CAPTION_FONT_SIZE = 18;
const CAPTION_TOP = FOOD_RADIUS + 5;
const FOOD_TOP = -FOOD_RADIUS - 1;
const FOOD_BOTTOM = CAPTION_TOP + CAPTION_FONT_SIZE;
const PANEL_HEIGHT = FOOD_BOTTOM - FOOD_TOP;

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

    /** Fits fixed-size food tiles into the reserved area without scaling the UI. */
    renderInArea(
        food: BakeryFood, tiles: readonly FoodTile[],
        area: { x: number; y: number; width: number; height: number },
        layout: "horizontal" | "vertical" = "horizontal",
        operator?: string,
    ): void {
        this.group.destroyChildren();
        this.group.position({ x: area.x, y: area.y });
        this.group.scale({ x: 1, y: 1 });
        this.group.visible(false);

        const panels = tiles.map((tile) => this.createPanel(food, tile));
        const horizontal = layout === "horizontal";
        const gap = panels.length > 1 ? PANEL_GAP : 0;
        const width = area.width - 2 * AREA_PADDING;
        const height = area.height - 2 * AREA_PADDING;
        const redraw = () => this.group.getLayer()?.batchDraw();
        if (panels.length === 0 || width <= 0 || height <= 0) {
            redraw();
            return;
        }

        const panelWidth = (panel: Konva.Group): number => {
            const bounds = panel.getClientRect({ relativeTo: panel });
            // Keep a consistent minimum slot width for ordinary fractions.
            return 2 * Math.max(FOOD_RADIUS + 1, -bounds.x, bounds.x + bounds.width);
        };
        const requiredWidth = (): number => horizontal
            ? panels.reduce((sum, panel) => sum + panelWidth(panel), 0)
                + gap * (panels.length - 1)
            : Math.max(...panels.map(panelWidth));
        const requiredHeight = horizontal ? PANEL_HEIGHT
            : PANEL_HEIGHT * panels.length + gap * (panels.length - 1);

        // If several whole foods will not fit, retain their exact fraction
        // caption rather than shrinking the drawings or covering other UI.
        const removeDrawing = (panel: Konva.Group): void => {
            panel.findOne(".fraction-food")?.destroy();
            const caption = panel.findOne<Konva.Text>(".fraction-caption");
            if (caption) caption.y(-caption.height() / 2);
        };
        if (requiredWidth() > width) {
            const widerPanels = panels.filter((panel) =>
                panelWidth(panel) > 2 * (FOOD_RADIUS + 1)
            ).sort((a, b) => panelWidth(b) - panelWidth(a));
            for (const panel of widerPanels) {
                if (requiredWidth() <= width) break;
                removeDrawing(panel);
            }
        }

        // On very tight layouts, use captions alone at their original size.
        // Never scale the foods based on the numerator or denominator.
        const captionOnly = requiredWidth() > width || requiredHeight > height;
        if (captionOnly) panels.forEach(removeDrawing);
        const widths = panels.map((panel) => {
            if (!captionOnly) return panelWidth(panel);
            const bounds = panel.getClientRect({ relativeTo: panel });
            return 2 * Math.max(-bounds.x, bounds.x + bounds.width, 1);
        });
        const tileHeight = captionOnly ? Math.max(CAPTION_FONT_SIZE, operator && panels.length === 2 ? gap : 0) : PANEL_HEIGHT;
        const totalWidth = horizontal
            ? widths.reduce((sum, w) => sum + w, 0) + gap * (panels.length - 1)
            : Math.max(...widths);
        const totalHeight = horizontal ? tileHeight
            : tileHeight * panels.length + gap * (panels.length - 1);
        if (totalWidth > width || totalHeight > height) {
            panels.forEach((panel) => panel.destroy());
            redraw();
            return;
        }

        const offsetY = AREA_PADDING + (height - totalHeight) / 2;
        const baseline = captionOnly ? tileHeight / 2 : -FOOD_TOP;
        let cursor = AREA_PADDING;
        panels.forEach((panel, index) => {
            const x = horizontal ? cursor + widths[index] / 2 : area.width / 2;
            const y = offsetY + baseline + (horizontal ? 0 : index * (tileHeight + gap));
            panel.position({ x, y });
            this.group.add(panel);
            cursor += widths[index] + gap;
        });

        if (operator && panels.length === 2) {
            this.group.add(new Konva.Text({
                x: horizontal ? AREA_PADDING + widths[0] : area.width / 2 - gap / 2,
                y: horizontal ? offsetY + baseline - gap / 2 : offsetY + tileHeight,
                width: gap,
                height: gap,
                text: operator,
                fontSize: 22,
                fontStyle: "bold",
                fontFamily: "Arial",
                fill: "#303030",
                align: "center",
                verticalAlign: "middle",
                listening: false,
            }));
        }
        this.group.visible(true);
        redraw();
    }

    /** Fixed horizontal pair: identical radius, centers, and spacing for every problem. */
    renderFixedPair(
        food: BakeryFood,
        tiles: readonly FoodTile[],
        centers: readonly [number, number],
        centerY: number,
        operator?: string,
    ): void {
        this.group.destroyChildren();
        this.group.position({ x: 0, y: 0 });
        this.group.scale({ x: 1, y: 1 });
        this.group.visible(true);

        const captionWidth = Math.abs(centers[1] - centers[0]) - 12;
        tiles.slice(0, 2).forEach((tile, index) => {
            const panel = new Konva.Group({
                x: centers[index], y: centerY, listening: false,
            });
            const { numerator, denominator } = tile.fraction;
            let mixedCaption: string | undefined;
            if (Number.isInteger(numerator) && numerator >= 0 &&
                Number.isInteger(denominator) && denominator > 0) {
                const whole = Math.floor(numerator / denominator);
                const remainder = numerator % denominator;
                const selected = numerator > denominator
                    ? (remainder || denominator) : numerator;
                drawRoundFood(panel, 0, 0, FOOD_RADIUS, denominator, selected, food);
                if (numerator > denominator) {
                    const foodName = food === "cake" ? "whole cakes"
                        : food === "cookie" ? "whole cookies" : "whole pizzas";
                    mixedCaption = remainder === 0
                        ? `${whole} ${foodName}`
                        : `${whole} whole + ${remainder}/${denominator}`;
                }
            }
            panel.add(new Konva.Text({
                x: -captionWidth / 2, y: CAPTION_TOP,
                width: captionWidth, align: "center", wrap: "none",
                text: `${numerator}/${denominator}`,
                fontSize: CAPTION_FONT_SIZE, fontStyle: "bold",
                fontFamily: "Arial", fill: "#242424", listening: false,
            }));
            if (mixedCaption) {
                panel.add(new Konva.Text({
                    x: -captionWidth / 2, y: CAPTION_TOP + CAPTION_FONT_SIZE + 3,
                    width: captionWidth, align: "center", wrap: "none",
                    text: mixedCaption, fontSize: 14,
                    fontFamily: "Arial", fill: "#242424", listening: false,
                }));
            }
            this.group.add(panel);
        });

        if (operator && tiles.length === 2) {
            this.group.add(new Konva.Text({
                x: (centers[0] + centers[1]) / 2 - PANEL_GAP / 2,
                y: centerY - PANEL_GAP / 2,
                width: PANEL_GAP, height: PANEL_GAP,
                text: operator, fontSize: 22, fontStyle: "bold",
                fontFamily: "Arial", fill: "#303030",
                align: "center", verticalAlign: "middle", listening: false,
            }));
        }
        this.group.getLayer()?.batchDraw();
    }

    /** Mastery only: fixed operand centers, radius, and operator position. */
    renderFixedCakePair(
        tiles: readonly FoodTile[],
        centers: readonly [number, number],
        centerY: number,
        operator?: string,
    ): void {
        this.renderFixedPair("cake", tiles, centers, centerY, operator);
    }

    /** Speed only: fixed operand centers, radius, and operator position. */
    renderFixedCookiePair(
        tiles: readonly FoodTile[],
        centers: readonly [number, number],
        centerY: number,
        operator?: string,
    ): void {
        this.renderFixedPair("cookie", tiles, centers, centerY, operator);
    }

    /** Draws fixed-size fractions in an unconstrained layout. */
    render(food: BakeryFood, tiles: readonly FoodTile[], layout: "horizontal" | "vertical" = "horizontal"): void {
        this.group.destroyChildren();
        this.group.visible(true);
        let cursor = AREA_PADDING;
        tiles.forEach((tile) => {
            const panel = this.createPanel(food, tile);
            const bounds = panel.getClientRect({ relativeTo: panel });
            const halfWidth = Math.max(FOOD_RADIUS + 1, -bounds.x, bounds.x + bounds.width);
            panel.position({
                x: layout === "horizontal" ? cursor + halfWidth : 145,
                y: layout === "vertical" ? cursor - FOOD_TOP : 80,
            });
            this.group.add(panel);
            cursor += (layout === "horizontal" ? 2 * halfWidth : PANEL_HEIGHT) + PANEL_GAP;
        });
        this.group.getLayer()?.batchDraw();
    }

    private createPanel(food: BakeryFood, tile: FoodTile): Konva.Group {
        const panel = new Konva.Group({ listening: false });
        const drawing = new Konva.Group({ name: "fraction-food", listening: false });
        drawFraction(drawing, tile.fraction, food);
        panel.add(drawing);
        const caption = new Konva.Text({
            name: "fraction-caption",
            y: drawing.getChildren().length > 0 ? CAPTION_TOP : -CAPTION_FONT_SIZE / 2,
            text: `${tile.fraction.numerator}/${tile.fraction.denominator}`,
            fontSize: CAPTION_FONT_SIZE,
            fontStyle: "bold",
            fontFamily: "Arial",
            fill: "#242424",
            listening: false,
        });
        caption.x(-caption.width() / 2);
        panel.add(caption);
        return panel;
    }
}

function drawFraction(parent: Konva.Group, fraction: Fraction, food: BakeryFood): void {
    const { numerator, denominator } = fraction;
    if (!Number.isInteger(numerator) || numerator < 0 ||
        !Number.isInteger(denominator) || denominator <= 0) {
        // The fraction caption is still drawn by render().
        return;
    }
    const wholeCount = Math.max(1, Math.ceil(numerator / denominator));
    
    if (wholeCount > 4) {
        // Avoid overcrowding; the numerical fraction caption remains visible.
        return;
    }
    const size = FOOD_RADIUS;
    const spacing = size * 2 + WHOLE_GAP;
    
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
