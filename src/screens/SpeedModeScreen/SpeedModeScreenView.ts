import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { Button } from "../../components/Button.ts";

export interface SpeedModeScreenHandlers {
    onEndGameClick: () => void;
}

export class SpeedModeScreenView implements View {
    private group = Konva.group;

    constructor(handlers: SpeedModeScreenHandlers)
    {
        this.group = new Konva.Group({visible: true});

        const seconds_text = new Konva.Text({
			x: 200,
			y: 50,
			width: STAGE_WIDTH,
			text: "Seconds Left",
			fontSize: 28,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
            name: "seconds_label"
		});

        const score_text = new Konva.Text({
            x: 160,
			y: 90,
			width: STAGE_WIDTH,
			text: "Score:",
			fontSize: 28,
			fontFamily: "Arial",
			fill: "black",
			align: "center",
            name: "score_label"
        });

        const end_button = new Button({
            x: 5,
            y: 5,
            width: 100,
            height: 40,
            text: "End",
            onClick: handlers.onEndGameClick, 
            name: "end_game",
            fill: "red",
            stroke: "darkred",
            textColor: "white",
        });

        this.group.add(end_button.getGroup());
        this.group.add(seconds_text);
        this.group.add(score_text);
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