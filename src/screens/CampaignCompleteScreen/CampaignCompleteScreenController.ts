import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { CampaignCompleteScreenView } from "./CampaignCompleteScreenView.ts";

/**
 * CampaignCompleteScreenController - Shown after the player finishes the
 * last campaign level.
 */
export class CampaignCompleteScreenController extends ScreenController {
	private readonly view: CampaignCompleteScreenView;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.view = new CampaignCompleteScreenView({
			onLevelSelect: () => screenSwitcher.switchToScreen({ type: "levels" }),
			onMenu: () => screenSwitcher.switchToScreen({ type: "menu" }),
		});
	}

	getView(): CampaignCompleteScreenView {
		return this.view;
	}
}
