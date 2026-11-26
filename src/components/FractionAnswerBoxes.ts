import Konva from "konva";
import { STAGE_WIDTH } from "../constants.ts";

const TEXT_COLOR = "#222222";
const BOX_BORDER = "#999999";
const BOX_ACTIVE = "#3b7dd8";
const BOX_WIDTH = 70;
const BOX_HEIGHT = 44;
const FRACTION_GAP = 10;

interface AnswerBox {
	readonly rect: Konva.Rect;
	readonly text: Konva.Text;
}

/**
 * Two stacked answer boxes (numerator over denominator) with a fraction bar.
 * Clicking a box reports its index; update() shows the typed text and which
 * box is active. Shared by the Mastery and Speed screens.
 */
export class FractionAnswerBoxes {
	private readonly group = new Konva.Group({ name: "answerBoxes" });
	private readonly boxes: AnswerBox[] = [];

	constructor(top: number, onFieldSelected: (index: number) => void) {
		const x = (STAGE_WIDTH - BOX_WIDTH) / 2;
		const barY = top + BOX_HEIGHT + FRACTION_GAP / 2;
		this.addBox(x, top, onFieldSelected);
		this.group.add(
			new Konva.Line({
				points: [x, barY, x + BOX_WIDTH, barY],
				stroke: TEXT_COLOR,
				strokeWidth: 3,
				listening: false,
			}),
		);
		this.addBox(x, top + BOX_HEIGHT + FRACTION_GAP, onFieldSelected);
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	update(fields: readonly string[], activeIndex: number): void {
		this.boxes.forEach((box, index) => {
			box.text.text(fields[index] ?? "");
			const active = index === activeIndex;
			box.rect.stroke(active ? BOX_ACTIVE : BOX_BORDER);
			box.rect.strokeWidth(active ? 4 : 2);
		});
	}

	private addBox(x: number, y: number, onFieldSelected: (index: number) => void): void {
		const index = this.boxes.length;
		const boxGroup = new Konva.Group({ name: `field-${index}` });
		const rect = new Konva.Rect({
			x,
			y,
			width: BOX_WIDTH,
			height: BOX_HEIGHT,
			fill: "white",
			stroke: BOX_BORDER,
			strokeWidth: 2,
			cornerRadius: 6,
		});
		// The text spans the whole box so it can be centered without measuring.
		const text = new Konva.Text({
			x,
			y,
			width: BOX_WIDTH,
			height: BOX_HEIGHT,
			text: "",
			fontSize: 30,
			fontFamily: "Arial",
			fill: TEXT_COLOR,
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});
		boxGroup.add(rect, text);
		boxGroup.on("click tap", () => onFieldSelected(index));
		this.group.add(boxGroup);
		this.boxes.push({ rect, text });
	}
}
