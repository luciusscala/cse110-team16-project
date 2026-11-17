import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { ProgressManager } from "../../persistence/ProgressManager.ts";
import { LevelSelectScreenModel } from "./LevelSelectScreenModel.ts";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";

/**
 * LevelSelectScreenController - Lets the player pick a campaign level
 *
 * Progress is read again every time the screen is shown, since finishing a
 * level changes which levels are unlocked.
 */
export class LevelSelectScreenController extends ScreenController {
	private readonly model: LevelSelectScreenModel;
	private readonly view: LevelSelectScreenView;
	private readonly screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher, model: LevelSelectScreenModel = new LevelSelectScreenModel()) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = model;
		this.view = new LevelSelectScreenView({
			onLevelSelected: (levelId) => this.handleLevelSelected(levelId),
			onBack: () => this.handleBack(),
		});
	}

	getView(): LevelSelectScreenView {
		return this.view;
	}

	/** Redraws the tiles from the latest saved progress, then shows the screen. */
	show(): void {
		this.view.render(this.model.getLevels(ProgressManager.getUserProgress()));
		super.show();
	}

	private handleLevelSelected(levelId: number): void {
		// Check again here rather than trusting the view.
		if (!this.model.canOpen(levelId, ProgressManager.getUserProgress())) return;
		this.screenSwitcher.switchToScreen({ type: "guided", levelId });
	}

	private handleBack(): void {
		this.screenSwitcher.switchToScreen({ type: "menu" });
	}
}
