import { Board } from "./Board"
import { Coordinate } from "./Coordinate"
import { Renderer } from "./Renderer"

export class Controller {
	board: Board
	renderer: Renderer

	constructor(board: Board, renderer: Renderer) {
		this.board = board
		this.renderer = renderer
		this.initControl()
		renderer.drawBoard(board)
	}

	input(coordinate: Coordinate) {
		if (this.board.selected === null) {
			this.board.select(coordinate)
		} else {
			this.board.move(coordinate)
		}

		this.board.setMovablePieces()

		this.renderer.drawBoard(this.board)
	}

	handleClick = (event: MouseEvent) => {
		const offset = this.renderer.canvas.getBoundingClientRect()
		const x = event.clientX - offset.left
		const y = event.clientY - offset.top

		const i = Math.floor(x / this.renderer.CELL_SIZE)
		const j = Math.floor(y / this.renderer.CELL_SIZE)

		const coordinate = { i, j }

		this.input(coordinate)
	}

	initControl() {
		this.renderer.canvas.addEventListener("mousedown", this.handleClick)
	}
}
