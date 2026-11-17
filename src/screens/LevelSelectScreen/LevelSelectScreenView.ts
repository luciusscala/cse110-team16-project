import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";
import type { LevelStatus, LevelSummary } from "./LevelSelectScreenModel.ts";

const TITLE_Y = 50;
const TITLE_FONT_SIZE = 40;

const TILES_PER_ROW = 4;
const TILE_WIDTH = 170;
const TILE_HEIGHT = 120;
const TILE_GAP = 20;
const TILES_START_Y = 130;
const TILE_FONT_SIZE = 16;

const BACK_BUTTON_WIDTH = 160;
const BACK_BUTTON_HEIGHT = 50;
const BACK_BUTTON_X = 30;
const BACK_BUTTON_Y = 520;

const TILE_COLORS: Record<LevelStatus, { fill: string; stroke: string; text: string }> = {
	completed: { fill: "green", stroke: "darkgreen", text: "white" },
	current: { fill: "gold", stroke: "darkgoldenrod", text: "black" },
	locked: { fill: "lightgray", stroke: "gray", text: "dimgray" },
};

const STATUS_LABELS: Record<LevelStatus, string> = {
	completed: "Done!",
	current: "Play!",
	locked: "Locked",
};
const COMING_SOON_LABEL = "Coming soon";

export interface LevelSelectScreenHandlers {
	onLevelSelected: (levelId: number) => void;
	onBack: () => void;
}

/**
 * LevelSelectScreenView - Shows a tile for every campaign level
 *
 * Tiles are drawn by render(), which the controller calls with fresh data
 * each time the screen opens. Only tiles the player can open are clickable.
 */
export class LevelSelectScreenView implements View {
	private readonly group: Konva.Group;
	private readonly tileGroup: Konva.Group;
	private readonly handlers: LevelSelectScreenHandlers;
	private tiles: Button[] = [];

	constructor(handlers: LevelSelectScreenHandlers) {
		this.handlers = handlers;
		this.group = new Konva.Group({ visible: false });

		this.group.add(
			new Konva.Text({
				x: 0,
				y: TITLE_Y,
				width: STAGE_WIDTH,
				text: "CHOOSE A LEVEL",
				fontSize: TITLE_FONT_SIZE,
				fontFamily: "Arial",
				fill: "black",
				align: "center",
				name: "title",
			}),
		);

		this.tileGroup = new Konva.Group({ name: "tiles" });
		this.group.add(this.tileGroup);

		const backButton = new Button({
			name: "backButton",
			text: "BACK",
			x: BACK_BUTTON_X,
			y: BACK_BUTTON_Y,
			width: BACK_BUTTON_WIDTH,
			height: BACK_BUTTON_HEIGHT,
			onClick: () => this.handlers.onBack(),
		});
		this.group.add(backButton.getGroup());
	}

	/** Replaces all level tiles with ones for these levels. */
	render(levels: readonly LevelSummary[]): void {
		this.tileGroup.destroyChildren();
		this.tiles = levels.map((level, index) => this.createTile(level, index, levels.length));
		this.tiles.forEach((tile) => this.tileGroup.add(tile.getGroup()));
		this.group.getLayer()?.batchDraw();
	}

	private createTile(level: LevelSummary, index: number, total: number): Button {
		const row = Math.floor(index / TILES_PER_ROW);
		const column = index % TILES_PER_ROW;
		// Center each row, so a short last row does not hug the left edge.
		const tilesInRow = Math.min(TILES_PER_ROW, total - row * TILES_PER_ROW);
		const rowWidth = tilesInRow * TILE_WIDTH + (tilesInRow - 1) * TILE_GAP;
		const rowStartX = (STAGE_WIDTH - rowWidth) / 2;

		const colors = TILE_COLORS[level.status];
		const canOpen = level.status !== "locked" && level.playable;
		const statusLabel =
			level.status !== "locked" && !level.playable ? COMING_SOON_LABEL : STATUS_LABELS[level.status];

		return new Button({
			name: `levelTile levelTile-${level.id}`,
			text: `Level ${level.id}\n${level.displayName}\n${statusLabel}`,
			x: rowStartX + column * (TILE_WIDTH + TILE_GAP),
			y: TILES_START_Y + row * (TILE_HEIGHT + TILE_GAP),
			width: TILE_WIDTH,
			height: TILE_HEIGHT,
			fontSize: TILE_FONT_SIZE,
			fill: colors.fill,
			stroke: colors.stroke,
			textColor: colors.text,
			onClick: () => {
				if (canOpen) this.handlers.onLevelSelected(level.id);
			},
		});
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	getTiles(): Button[] {
		return this.tiles;
	}
}
