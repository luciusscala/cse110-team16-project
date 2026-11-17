import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { LevelSelectScreenController } from "./screens/LevelSelectScreen/LevelSelectScreenController.ts";
import { GuidedLevelController } from "./guided/GuidedLevelController.ts";
import { GuidedLevelView } from "./guided/GuidedLevelView.ts";
import { SpeedModeScreenController } from "./screens/SpeedModeScreen/SpeedModeScreenController.ts";
import { SpeedModeScreenView } from "./screens/SpeedModeScreen/SpeedModeScreenView.ts";
import { MasteryScreenController } from "./screens/MasteryScreen/MasteryScreenController.ts";

/**
 * Main Application - Coordinates all screens
 *
 * Each screen has its own Konva.Group that can be shown or hidden
 * independently. All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private menuController: MenuScreenController;
	private levelSelectController: LevelSelectScreenController;
	private guidedController: GuidedLevelController;
	private speedModeController: SpeedModeScreenController;
	private masteryController: MasteryScreenController;

	constructor(container: string) {
		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// Create a layer (screens will be added to this layer)
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Initialize all screen controllers
		this.menuController = new MenuScreenController(this);
		this.levelSelectController = new LevelSelectScreenController(this);
		this.guidedController = new GuidedLevelController(
			this,
			(handlers) => new GuidedLevelView(handlers),
		);
		this.speedModeController = new SpeedModeScreenController(this);
		this.masteryController = new MasteryScreenController(this);

		// Add all screen groups to the layer
		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.levelSelectController.getView().getGroup());
		this.layer.add(this.guidedController.getView().getGroup());
		this.layer.add(this.speedModeController.getView().getGroup());
		this.layer.add(this.masteryController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with menu screen visible
		this.switchToScreen({ type: "menu" });
	}

	/**
	 * Switch to a different screen
	 *
	 * Hides all screens, then shows only the requested one.
	 */
	switchToScreen(screen: Screen): void {
		// Hide all screens first
		this.menuController.hide();
		this.levelSelectController.hide();
		this.guidedController.hide();
		this.speedModeController.hide();
		this.masteryController.hide();

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "menu":
				this.menuController.show();
				break;
			case "levels":
				this.levelSelectController.show();
				break;
			case "guided":
				if (this.guidedController.startLevel(screen.levelId)) {
					this.guidedController.show();
				} else {
					// Not a guided level (yet), so go back to picking a level.
					console.log(`Level ${screen.levelId} is not available yet`);
					this.levelSelectController.show();
				}
				break;
			case "mastery":

				this.masteryController.show();
				this.masteryController.startGame();
				break;
			case "speed":
				this.speedModeController.show();
				this.speedModeController.startSpeedGame();
				break;
		}
	}
}

// Initialize the application
new App("container");
