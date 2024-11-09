import { getRandomInteger } from "../tools.ts";
import { emoji } from "../emoji.ts";
import {
	ActionRow,
	BotUI,
	Button,
	CommandClient,
	Embed,
	fragment,
	User,
} from "../harmony.ts";

export const currentGames = new Map<string, TicTacToeGame>();

export class TicTacToeGame {
	public x: User | "ai";
	public o: User | "ai";
	public isPlayingWithAI = false;
	public waitingToAcceptGame = true;
	public currentPlayersTurn: "x" | "o";
	private board: Array<Array<"x" | "o" | null>> = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];
	private client: CommandClient;

	constructor(
		player1: User | "ai",
		player2: User | "ai",
		client: CommandClient,
	) {
		this.currentPlayersTurn = ["x", "o"][getRandomInteger(0, 1)] as
			| "x"
			| "o";
		const isP1X = getRandomInteger(1, 2) == 1;
		if (isP1X) {
			this.x = player1;
			this.o = player2;
		} else {
			this.o = player1;
			this.x = player2;
		}

		if (player1 == "ai" || player2 == "ai") {
			this.isPlayingWithAI = true;
		}

		if (
			(this.currentPlayersTurn == "x" && this.x == "ai") ||
			(this.currentPlayersTurn == "o" && this.o == "ai")
		) {
			const square = getRandomInteger(0, 8);
			const row = Math.floor(square / 3);
			const col = square % 3;
			this.board[row][col] = this.currentPlayersTurn;
			this.currentPlayersTurn = this.currentPlayersTurn == "x"
				? "o"
				: "x";
		}

		this.client = client;
	}

	public play(x: number, y: number) {
		if (this.board[x][y] != null) {
			return false;
		}

		this.board[x][y] = this.currentPlayersTurn;

		if (typeof this.checkForWin() == "boolean") {
			this.currentPlayersTurn = this.currentPlayersTurn == "x"
				? "o"
				: "x";
			const validMoves = [];
			for (let row = 0; row < 3; row++) {
				for (let col = 0; col < 3; col++) {
					if (this.board[row][col] == null) {
						validMoves.push([row, col]);
					}
				}
			}

			const move = validMoves[getRandomInteger(0, validMoves.length - 1)];
			this.board[move[0]][move[1]] = this.currentPlayersTurn;
			this.currentPlayersTurn = this.currentPlayersTurn == "x"
				? "o"
				: "x";
		}

		return true;
	}

	public checkForWin() {
		for (const letter of ["x", "o"]) {
			const checks = [
				// Horizontal
				this.board[0][0] == letter &&
				this.board[0][1] == letter &&
				this.board[0][2] == letter,
				this.board[1][0] == letter &&
				this.board[1][1] == letter &&
				this.board[1][2] == letter,
				this.board[2][0] == letter &&
				this.board[2][1] == letter &&
				this.board[2][2] == letter,

				// Vertical
				this.board[0][0] == letter &&
				this.board[1][0] == letter &&
				this.board[2][0] == letter,
				this.board[0][1] == letter &&
				this.board[1][1] == letter &&
				this.board[2][1] == letter,
				this.board[0][2] == letter &&
				this.board[1][2] == letter &&
				this.board[2][2] == letter,

				// Diagonal
				this.board[0][0] == letter &&
				this.board[1][1] == letter &&
				this.board[2][2] == letter,
				this.board[0][2] == letter &&
				this.board[1][1] == letter &&
				this.board[2][0] == letter,
			];

			if (checks.includes(true)) {
				return letter;
			}
		}

		// Check for tie
		let tie = true;
		for (const row of this.board) {
			for (const col of row) {
				if (col == null) {
					tie = false;
				}
			}
		}

		if (tie) {
			return "tie";
		}

		return false;
	}

	public get Embed() {
		return new Embed({
			author: {
				name: "Bidome bot",
				icon_url: this.client.user!.avatarURL(),
			},
			title: "Tic Tac Toe",
			// Apparently that emote isn't in the library
			description: ["x", "o", "tie"].includes(this.checkForWin() || "no")
				? this.checkForWin() == "tie"
					? "It's a tie!"
					: this[this.checkForWin() as "x" | "o"] == "ai"
					? "Ai Wins!"
					: `<@!${
						(this[this.checkForWin() as "x" | "o"] as User).id
					}> Wins!`
				: [
					`${
						this.currentPlayersTurn == "x"
							? emoji("arrow_forward")
							: emoji("blue_square")
					} ${this.x == "ai" ? "AI" : `<@!${this.x.id}>`}`,
					`${
						this.currentPlayersTurn == "o"
							? emoji("arrow_forward")
							: emoji("blue_square")
					} ${this.o == "ai" ? "AI" : `<@!${this.o.id}>`}`,
				].join("\n"),
			footer: {
				icon_url: this.isPlayingWithAI
					? this[this.currentPlayersTurn] == "ai"
						? this.client.user!.avatarURL()
						: (this[this.currentPlayersTurn] as User)!.avatarURL()
					: this.client.user!.avatarURL(),
				text: this.isPlayingWithAI
					? this[this.currentPlayersTurn] == "ai"
						? "AI's turn"
						: `${
							(this[this.currentPlayersTurn] as User)!.tag
						}'s turn`
					: `${(this[this.currentPlayersTurn] as User)!.tag}'s turn`,
			},
		}).setColor("random");
	}

	public get boardState() {
		return (
			<>
				{this.board.map((row, i) => (
					<ActionRow>
						{row.map((cell, j) => {
							return (
								<Button
									style={cell == null
										? "grey"
										: cell == "x"
										? "red"
										: "green"}
									id={`ttt-${i}-${j}`}
									disabled={["x", "o", "tie"].includes(
										this.checkForWin() || "no",
									) ||
										cell != null}
									label={cell == null
										? "\u200b"
										: cell == "x"
										? "X"
										: "O"}
								/>
							);
						})}
					</ActionRow>
				))}
			</>
		);
	}
}
