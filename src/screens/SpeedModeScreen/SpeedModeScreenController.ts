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

        this.view = new SpeedModeScreenView();
    }

    getView(): MenuScreenView {
		return this.view;
	}
}