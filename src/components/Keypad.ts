import Konva from "konva";
import { Button } from "./Button.ts";

const ACTION_ADL_DIST_FROM_LEFT = 370;
const KEY_FONTSIZE = 26;
const CHECK_FONTSIZE = 24;
const BACKSPACE_FONTSIZE = 22;

const DEF_KEY_COLOR = "#3b7dd8";
const DEF_KEY_BOARDER_COLOR = "#2a5aa0";
const DEF_BACKSPACE_COLOR = "#777777";
const DEF_BACKSPACE_BOARDER_COLOR = "#555555";
const DEF_CHECK_COLOR = "#2e9e4f";
const DEF_CHECK_BOARDER_COLOR = "#1f6e36";
const TEXT_COLOR = "white";

export interface keypadConfig {
    keySize: number;
    keySpacing: number;
    distFromLeft: number;
    distFromTop: number;
    actionWidth: number;
    actionHeight: number;
    onKeyClick: (digit: string) => void;
    onBackspaceClick: () => void;
    onCheckClick: () => void;
    keyColor?: string;
    keyBoarderColor?: string;
    backspaceColor?: string;
    backspaceBoarderColor?: string;
    checkColor?: string;
    checkBoarderColor?: string; 
}

/**
 * Contains a function that builds and returns a Konva group of a keypad, including a check and backspace button, given parameters
 */
export class KeypadBuilder {

	/**
	 * This function is essentially copied from the previous iteration of the buildAnswerKeys function in GuidedLevelView, with some
	 * adjustments. It now takes the elements in keypadConfig as parameters, and uses Button objects from the components folder.
	 * @param config a keypadConfig containing options for the keypad, with some being optional
	 * @return a Konva group representing the built keypad
	 */
    public static buildAnswerKeys(config: keypadConfig): Konva.Group {
        this.answerKeys = new Konva.Group({ visible: true });

		for (let digit = 0; digit <= 9; digit++) {
			const column = digit % 5;
			const row = Math.floor(digit / 5);
			const digitButton = new Button({
				x: config.distFromLeft + column * (config.keySize + config.keySpacing),
				y: config.distFromTop + row * (config.keySize + config.keySpacing),
				width: config.keySize,
				height: config.keySize,
				text: String(digit),
				onClick: () => config.onKeyClick(String(digit)),
				name: `digit-${digit}`,
				fontSize: KEY_FONTSIZE,
				fill: config.keyColor ?? DEF_KEY_COLOR,
				stroke: config.keyBoarderColor ?? DEF_KEY_BOARDER_COLOR,
				textColor: TEXT_COLOR,
			});
			this.answerKeys.add(digitButton.getGroup());
		}

		const checkButton = new Button({
			x: config.distFromLeft + ACTION_ADL_DIST_FROM_LEFT,
			y: config.distFromTop,
			width: config.actionWidth,
			height: config.actionHeight,
			text: "Check",
			onClick: () => config.onCheckClick(),
			name: "check",
			fontSize: CHECK_FONTSIZE,
			fill: config.checkColor ?? DEF_CHECK_COLOR,
			stroke: config.checkBoarderColor ?? DEF_CHECK_BOARDER_COLOR,
			textColor: TEXT_COLOR,
		});

		this.answerKeys.add(checkButton.getGroup());

		const backspaceButton = new Button({
			x: config.distFromLeft + ACTION_ADL_DIST_FROM_LEFT,
			y: config.distFromTop + config.keySize + config.keySpacing,
			width: config.actionWidth,
			height: config.actionHeight,
			text: "Delete",
			onClick: () => config.onBackspaceClick(),
			name: "backspace",
			fontSize: BACKSPACE_FONTSIZE,
			fill: config.backspaceColor ?? DEF_BACKSPACE_COLOR,
			stroke: config.backspaceBoarderColor ?? DEF_BACKSPACE_BOARDER_COLOR,
			textColor: TEXT_COLOR,
		});

		this.answerKeys.add(backspaceButton.getGroup());
        
        return this.answerKeys;
	}
}