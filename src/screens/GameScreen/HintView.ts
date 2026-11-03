import Konva from "konva";
import { HintModel } from "../../models/HintModel.ts";
import { HintController } from "./HintController.ts";
import type { View } from "../../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../constants.ts";

//will probably merge with GameScreenView
export class HintView {

    private hintButtonGroup: Konva.Group;
    private hintText: Konva.Text;

    constructor(onHintClick: () => void){
        this.hintButtonGroup = new Konva.Group({visible: true});
        
        const hintButton = new Konva.Rect({
            x: STAGE_WIDTH - 90,
            y: STAGE_HEIGHT / 2 - 55,
            width: 80,
            height: 45,
            fill: "green",
            cornerRadius: 10,
            stroke: "darkgreen",
            strokeWidth: 3,
        });

        const hintButtonText = new Konva.Text({
            x: hintButton.x(),
            y: hintButton.y() + 12,
            width: hintButton.width(),
            text: "Hint?",
            align: "center",
            fill: "white",
            fontSize: 18,
            fontFamily: "Arial",
            fontStyle: "bold",
        });

        this.hintButtonGroup.add(hintButton);
        this.hintButtonGroup.add(hintButtonText);
        this.hintButtonGroup.on("click", onHintClick);   
        
        this.hintText = new Konva.Text({
            x: STAGE_WIDTH * 3/4,
            y: STAGE_HEIGHT / 2,
            width: 200, 
            text: "",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "black",
        });
    }

    /**
     * Displays the hint for the problem. 
     */
    displayHint(hint: string): void {
        this.hintText.text(hint);
    }

    /**
     * Clears the hint for the next problem.
     */
    clearHint(): void {
        this.hintText.text("");
    }

}