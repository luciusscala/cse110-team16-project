import Konva from "konva";

export interface ButtonConfig {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	onClick: () => void;
	name?: string;
	fontSize?: number;
	fill?: string;
	stroke?: string;
	textColor?: string;
}

/**
 * Button - Reusable clickable button made of a rounded rect and a centered label
 */
export class Button {
	private group: Konva.Group;
	private rect: Konva.Rect;
	private label: Konva.Text;

	constructor(config: ButtonConfig) {
		this.group = new Konva.Group({ x: config.x, y: config.y, name: config.name });

		this.rect = new Konva.Rect({
			width: config.width,
			height: config.height,
			fill: config.fill ?? "green",
			cornerRadius: 10,
			stroke: config.stroke ?? "darkgreen",
			strokeWidth: 3,
		});

		// Label spans the whole button so align/verticalAlign center it without measuring text
		this.label = new Konva.Text({
			width: config.width,
			height: config.height,
			text: config.text,
			fontSize: config.fontSize ?? 24,
			fontFamily: "Arial",
			fill: config.textColor ?? "white",
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});

		this.group.add(this.rect);
		this.group.add(this.label);

		this.group.on("click tap", config.onClick);
		this.group.on("mouseenter", () => this.setCursor("pointer"));
		this.group.on("mouseleave", () => this.setCursor("default"));
	}

	private setCursor(cursor: string): void {
		const container = this.group.getStage()?.container();
		if (container) {
			container.style.cursor = cursor;
		}
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	getText(): string {
		return this.label.text();
	}
}
