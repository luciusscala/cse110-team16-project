import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { SpeedModeScreenView } from "./SpeedModeScreenView.ts"

export class SpeedModeScreenController extends ScreenController {
    private view: SpeedModeScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenController)
    {
        super();
        this.screenSwitcher = screenSwitcher;

        this.view = new SpeedModeScreenView({
            onEndGameClick: () => this.handleEndGameClick(),
        });
    }

    private handleEndGameClick(): void {
        // This currrently returns the player to the menu screen, but should take them to the
        // game over screen and display the appropriate information once it is implemented
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }

    getView(): MenuScreenView {
		return this.view;
	}
}