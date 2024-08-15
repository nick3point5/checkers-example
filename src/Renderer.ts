import { Board } from "./Board"
import { Coordinate } from "./Coordinate"
import { Piece } from "./Piece"

export class Renderer {
	CELL_SIZE = 80
	width: number
	height: number
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	status: HTMLHeadingElement

	constructor(document: Document) {
		this.canvas = document.getElementById("board") as HTMLCanvasElement
		this.status = document.getElementById("status") as HTMLHeadingElement
		this.width = this.canvas.width
		this.height = this.canvas.height
		this.ctx = this.canvas.getContext("2d")!
	}

	
	drawBackground(board: Board) {
		this.ctx.fillStyle = "#000"
		this.ctx.fillRect(0, 0, this.width, this.height)

		const color1 = "#6c4417"
		const color2 = "#b2907b"

		let is_dark = true
		for (let i = 0; i < board.blocks.length; i++) {
			const row = board.blocks[i]
			for (let j = 0; j < row.length; j++) {
				this.ctx.fillStyle = (i + j) % 2 !== 0 ? color1 : color2
				const x = 2 + this.CELL_SIZE * i
				const y = 2 + this.CELL_SIZE * j
				const width = this.CELL_SIZE - 2
				const height = this.CELL_SIZE - 2
				this.ctx.fillRect(x, y, width, height)
				is_dark = !is_dark
			}
		}
	}

	drawPiece(piece: Piece) {
		const { i, j } = piece.coordinate
		const offset = this.CELL_SIZE / 2
		const x = offset + 1 + i * this.CELL_SIZE
		const y = offset + 1 + j * this.CELL_SIZE

		this.ctx.fillStyle = piece.color
		this.ctx.beginPath()
		this.ctx.strokeStyle = "black"
		this.ctx.lineWidth = 2
		this.ctx.arc(x, y, 35, 0, 2 * Math.PI)
		this.ctx.fill()
		this.ctx.stroke()
		this.ctx.closePath()
	}

	drawPieces(board: Board) {
		for (let j = 0; j < board.blocks.length; j++) {
			for (let i = 0; i < board.blocks[0].length; i++) {
				const piece = board.blocks[j][i]
				if (piece != null) {
					this.drawPiece(piece)
				}
			}
		}
	}

	coordinateToPixel({ i, j }: Coordinate) {
		return { x: i * this.CELL_SIZE, y: j * this.CELL_SIZE }
	}

	drawHighlight(coordinate: Coordinate) {
		const { x, y } = this.coordinateToPixel(coordinate)

		this.ctx.strokeStyle = "#f19f1c"
		this.ctx.lineWidth = 4
		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x + this.CELL_SIZE, y)
		this.ctx.lineTo(x + this.CELL_SIZE, y + this.CELL_SIZE)
		this.ctx.lineTo(x, y + this.CELL_SIZE)
		this.ctx.lineTo(x, y)
		this.ctx.stroke()
		this.ctx.closePath()
	}

	drawHighlights(highlights: Coordinate[]) {
		for (const highlight of highlights) {
			this.drawHighlight(highlight)
		}
	}

	draw(board: Board) {
		this.drawBackground(board)
		this.drawHighlights(board.highlights)
		this.drawPieces(board)
		console.log(board.checkGameOver())
		if (board.checkGameOver()) {
			const winner = board.player === "red" ? "black" : "red"
			this.setStatus(`${winner} wins`)
		} else {
			this.setStatus(`${board.player}'s turn`)
		}
	}

	setStatus(message: string) {
		this.status.innerText = message
	}
}