import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private currentProgressText: Konva.Text;

	// Note: can remove onCompleteClick from MenuScreenView's constructor once demo is done
	constructor(onStartClick: () => void, onCompleteClick: () => void, onDeleteProgressClick: () => void, progress: number) {
		this.group = new Konva.Group({ visible: true });

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: "TEAM 16 GAME",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		const startButtonGroup = new Konva.Group();
		// TEMP: for testing persistence
		const completeLvlGroup = new Konva.Group();
		const deleteProgressGroup = new Konva.Group();
		// end of TEMP (unless we would like a permenant deleteProgress button in the actual game)

		const startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: "START GAME",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});

		// Possibly temporary text which says how many levels the user has completed on the main menu
		this.currentProgressText = new Konva.Text({
			x: STAGE_WIDTH / 2 + 130,
			y: 315,
			text: `Current Level: ${progress}`,
			fontSize: 24,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
		});

		//TEMP: for testing persistence
		const completeLvl1Button = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 400,
			width: 200,
			height: 60,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});
		const completeLvl1Text = new Konva.Text({
			x: STAGE_WIDTH / 2 - 80,
			y: 415,
			text: "Complete Lvl 1",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});

		const deleteProgressButton = new Konva.Rect({
			x: 1,
			y: 500,
			width: 100,
			height: 40,
			fill: "red",
			cornerRadius: 10,
			stroke: "darkred",
			strokeWidth: 3,
		});
		const deleteProgressText = new Konva.Text({
			x: 10,
			y: 512,
			text: "Delete data",
			fontSize: 15,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});
		completeLvlGroup.add(completeLvl1Button);
		completeLvlGroup.add(completeLvl1Text);
		completeLvlGroup.on("click", onCompleteClick);

		// These three lines may also not be temporary if we want to keep a delete progress button
		deleteProgressGroup.add(deleteProgressButton);
		deleteProgressGroup.add(deleteProgressText);
		deleteProgressGroup.on("click", onDeleteProgressClick);

		this.group.add(completeLvlGroup);
		this.group.add(deleteProgressGroup);
		// end of TEMP

		startText.offsetX(startText.width() / 2);
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on("click", onStartClick);
		this.group.add(startButtonGroup);
		this.group.add(this.currentProgressText);
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	/**
	 * Updates the shown number of levels the user has completed on the main menu.
	 * This can be removed if we decide we do not want to display this on the main menu in the final version.
	 * Primarily this is just here for testing purposes.
	 */
	updateProgressText(level: number): void {
		this.currentProgressText.text(`Current Level: ${level}`);
		this.group.getLayer()?.draw();
	}
}
