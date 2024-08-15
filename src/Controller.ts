import { Board } from "./Board"
import { Renderer } from "./Renderer"

export class Controller {
	board: Board
	renderer: Renderer

	constructor(board: Board, renderer: Renderer) {
		this.board = board
		this.renderer = renderer
		this.initControl()
	}

	handleClick = (event: MouseEvent) => {
		let offset = this.renderer.canvas.getBoundingClientRect()
		const x = event.clientX - offset.left
		const y = event.clientY - offset.top

		const i = Math.floor(x / this.renderer.CELL_SIZE)
		const j = Math.floor(y / this.renderer.CELL_SIZE)

		const coordinate = { i, j }

		if (this.board.selected === null) {
			this.board.select(coordinate)
		} else {
			this.board.move(coordinate)
		}

		this.board.setMovablePieces()

		this.renderer.draw(this.board)
	}

	initControl() {
		this.renderer.canvas.addEventListener("mousedown", this.handleClick)
	}
}
