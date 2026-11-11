import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";

export class SpeedModeScreenView implements View {
    private group = Konva.group;

    constructor()
    {
        this.group = new Konva.Group({visible: true});

        const test_text = new Konva.Text({
			x: 0,
			y: 150,
			width: STAGE_WIDTH,
			text: "speed game screen",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
			name: "title",
		});

        this.group.add(test_text);
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
}   