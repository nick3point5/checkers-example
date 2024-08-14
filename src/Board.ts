import { Coordinate } from "./Coordinate"
import { Piece, BlackPiece, RedPiece } from "./Piece"


export class Board {
	CELL_SIZE = 80
	width: number
	height: number
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	selected: Coordinate | null = null
	player: "red" | "black" = "red"
	highlights: Coordinate[] = []
	movablePieces: Piece[] = []
	isGameOver: boolean = false

	blocks: (Piece | null)[][] = [
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
	]

	initBoard: ("r" | "b" | null)[][] = [
		[null, "b", null, "b", null, "b", null, "b"],
		["b", null, "b", null, "b", null, "b", null],
		[null, "b", null, "b", null, "b", null, "b"],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		["r", null, "r", null, "r", null, "r", null],
		[null, "r", null, "r", null, "r", null, "r"],
		["r", null, "r", null, "r", null, "r", null],
	]

	status: HTMLHeadingElement

	constructor(document: Document) {
		this.canvas = document.getElementById("board") as HTMLCanvasElement
		this.status = document.getElementById("status") as HTMLHeadingElement
		this.width = this.canvas.width
		this.height = this.canvas.height
		this.ctx = this.canvas.getContext("2d")!
		this.initControl()
		this.initPieces()

		this.setStatus(`${this.player}'s turn`)
	}

	setStatus(message: string) {
		this.status.innerText = message
	}

	renderBackground() {
		this.ctx.fillStyle = "#000"
		this.ctx.fillRect(0, 0, this.width, this.height)

		const color1 = "#6c4417"
		const color2 = "#b2907b"

		let is_dark = true
		for (let i = 0; i < this.blocks.length; i++) {
			const row = this.blocks[i]
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

	renderPiece(piece: Piece) {
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

	renderPieces() {
		for (let j = 0; j < this.blocks.length; j++) {
			for (let i = 0; i < this.blocks[0].length; i++) {
				const piece = this.blocks[j][i]
				if (piece != null) {
					this.renderPiece(piece)
				}
			}
		}
	}

	changePlayer() {
		this.selected = null
		this.player = this.player === "red" ? "black" : "red"
		this.setStatus(`${this.player}'s turn`)
	}

	isOutOfBounds({ i, j }: Coordinate) {
		return i < 0
			|| j < 0
			|| i >= this.blocks[0].length
			|| j >= this.blocks.length
	}

	getPiece({ i, j }: Coordinate) {
		if (this.isOutOfBounds({ i, j })) {
			return null
		} else {
			return this.blocks[j][i]
		}
	}

	renderHighlight(coordinate: Coordinate) {
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

	renderHighlights() {
		for (const highlight of this.highlights) {
			this.renderHighlight(highlight)
		}
	}

	setMovablePieces() {
		if (this.selected !== null) {
			return
		}

		this.movablePieces = []

		for (let i = 0; i < this.blocks.length; i++) {
			for (let j = 0; j < this.blocks[i].length; j++) {
				const block = this.blocks[j][i]
				if (this.player === "black" && block instanceof BlackPiece && block.hasValidMoves()) {
					this.movablePieces.push(block)
				} else if (this.player === "red" && block instanceof RedPiece && block.hasValidMoves()) {
					this.movablePieces.push(block)
				}
			}
		}

		const hasSkip = this.movablePieces.some(piece => piece.hasSkip())

		if (hasSkip) {
			this.movablePieces = this.movablePieces.filter(piece => piece.hasSkip())
		}

		this.highlights = this.movablePieces.map(piece => piece.coordinate)
	}

	render() {
		this.renderBackground()
		this.renderHighlights()
		this.renderPieces()
	}

	coordinateToPixel({ i, j }: Coordinate) {
		return { x: i * this.CELL_SIZE, y: j * this.CELL_SIZE }
	}

	select(coordinate: Coordinate) {
		const piece = this.getPiece(coordinate)
		if (piece === null) {
			return
		}

		if (!this.movablePieces.some(possible => possible === piece)) {
			return
		}
		this.selected = coordinate
		this.highlights = piece.validMoves()
	}

	move({ i, j }: Coordinate) {
		const selected = this.selected!
		const piece = this.getPiece(selected)

		if (piece === null) {
			return
		}

		if (!piece.isValidMove({ i, j })) {
			return
		}

		if (piece.hasSkip()) {
			const skipped = {
				i: (piece.coordinate.i - i) / 2 + i,
				j: (piece.coordinate.j - j) / 2 + j
			}

			this.remove(skipped)
			piece.coordinate = { i, j }
			this.blocks[j][i] = piece
			this.remove(selected)

			if (piece.canPromote()) {
				piece.promote()
			}

			if (piece.hasSkip()) {
				this.select({ i, j })
			} else {
				this.changePlayer()
			}
		} else {
			piece.coordinate = { i, j }
			this.blocks[j][i] = piece
			this.remove(selected)

			if (piece.canPromote()) {
				piece.promote()
			}

			this.changePlayer()
		}
	}

	remove({ i, j }: Coordinate) {
		this.blocks[j][i] = null
	}

	handleClick = (event: MouseEvent) => {
		let offset = this.canvas.getBoundingClientRect()
		const x = event.clientX - offset.left
		const y = event.clientY - offset.top

		const i = Math.floor(x / this.CELL_SIZE)
		const j = Math.floor(y / this.CELL_SIZE)

		const coordinate = { i, j }

		if (this.selected === null) {
			this.select(coordinate)
		} else {
			this.move(coordinate)
		}

		this.setMovablePieces()
		this.checkGameOver()
		this.render()
	}

	checkGameOver() {
		if (this.movablePieces.length === 0) {
			this.isGameOver = true
			this.setStatus(`${this.player === "red" ? "black" : "red"} wins`)
		}
	}

	initControl() {
		this.canvas.addEventListener("mousedown", this.handleClick)
	}

	initPieces() {
		const blocks = this.initBoard

		for (let j = 0; j < blocks.length; j++) {
			for (let i = 0; i < blocks[j].length; i++) {
				const type = blocks[j][i]
				const coordinate: Coordinate = { i, j }
				let piece: Piece | null = null

				if (type === "r") {
					piece = new RedPiece(this, coordinate)
				} else if (type === "b") {
					piece = new BlackPiece(this, coordinate)
				}

				this.blocks[j][i] = piece
			}
		}
		this.setMovablePieces()
	}
}
