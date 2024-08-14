import { Board } from "./board"
import { GameState, select } from "./GameState"
import { move } from "./Move"
import { render } from "./Render"

const board: Board = [
	[0, 3, 0, 3, 0, 3, 0, 3],
	[3, 0, 3, 0, 3, 0, 3, 0],
	[0, 3, 0, 3, 0, 3, 0, 3],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 1, 0, 1, 0, 1, 0],
	[0, 1, 0, 1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 0],
]

const gameState: GameState = {
	board: board,
	player: "red",
	selected: null,
}

const canvas = document.getElementById("board") as HTMLCanvasElement
const status = document.getElementById("status") as HTMLHeadingElement

function handleClick(event: MouseEvent, size: number, gameState: GameState) {
	const offset = canvas.getBoundingClientRect()
	const x = event.clientX - offset.left
	const y = event.clientY - offset.top

	const i = Math.floor(x / size)
	const j = Math.floor(y / size)

	const coordinate = { i, j }

	if (gameState.selected === null) {
		select(gameState, coordinate)
	} else {
		move(gameState, coordinate)

	}

	render(canvas, status, gameState)
}

canvas.addEventListener("mousedown", (event: MouseEvent) => handleClick(event, 80, gameState))
render(canvas, status, gameState)
