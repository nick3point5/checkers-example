type Piece = {
	color: string
	coordinate: Coordinate
	board: Board
	render(i: number, j: number): void
	validMoves(): Coordinate[]
	hasValidMoves(): boolean
	canSkip(): boolean
	isSkip(coordinate: Coordinate): boolean
	canPromote(): boolean
	promote(): void
}

type Coordinate = {
	i: number
	j: number
}

class Board {
	CELL_SIZE = 80
	width: number
	height: number
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	selected: Coordinate | null = null
	activePlayer: "red" | "black" = "black"
	highlights: Coordinate[] = []
	activePieces: Piece[] = []
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
	status: HTMLHeadingElement

	constructor() {
		this.canvas = document.getElementById("board")! as HTMLCanvasElement
		this.status = document.getElementById("status")! as HTMLHeadingElement
		this.width = this.canvas.width
		this.height = this.canvas.height
		this.ctx = this.canvas.getContext("2d")!
		this.initControl()
		this.initPieces()
		this.setActivePieces()

		this.setStatus(`${this.activePlayer}'s turn`)
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
			is_dark = i % 2 ? true : false
			const row = this.blocks[i]
			for (let j = 0; j < row.length; j++) {
				this.ctx.fillStyle = is_dark ? color1 : color2
				const x = 2 + this.CELL_SIZE * i
				const y = 2 + this.CELL_SIZE * j
				const width = this.CELL_SIZE - 2
				const height = this.CELL_SIZE - 2
				this.ctx.fillRect(x, y, width, height)
				is_dark = !is_dark
			}
		}
	}

	renderBlocks() {
		for (let y = 0; y < this.blocks.length; y++) {
			for (let x = 0; x < this.blocks[0].length; x++) {
				const block = this.blocks[y][x]
				if (block != null) {
					block.render(x, y)
				}
			}
		}
	}

	changePlayer() {
		this.selected = null
		this.activePlayer = this.activePlayer === "red" ? "black" : "red"
		this.setStatus(`${this.activePlayer}'s turn`)
	}

	isOutOfBounds(coordinate: Coordinate) {
		return coordinate.i < 0
			|| coordinate.j < 0
			|| coordinate.i >= this.blocks[0].length
			|| coordinate.j >= this.blocks.length
	}

	getPiece({ i, j }: Coordinate) {
		if (this.isOutOfBounds({ i, j })) {
			return null
		}
		return this.blocks[j][i]
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
		board.ctx.closePath()

	}

	renderHighlights() {
		for (const highlight of this.highlights) {
			this.renderHighlight(highlight)
		}
	}

	setActivePieces() {
		if (this.selected !== null) {
			return
		}

		this.activePieces = []

		for (let i = 0; i < this.blocks.length; i++) {
			for (let j = 0; j < this.blocks[i].length; j++) {
				const block = this.blocks[j][i]
				if (this.activePlayer === "black" && block instanceof BlackPiece && block.hasValidMoves()) {
					this.activePieces.push(block)
				} else if (this.activePlayer === "red" && block instanceof RedPiece && block.hasValidMoves()) {
					this.activePieces.push(block)
				}
			}
		}

		const hasSkip = this.activePieces.some(piece => piece.canSkip())

		if (hasSkip) {
			this.activePieces = this.activePieces.filter(piece => piece.canSkip())
		}

		this.highlights = this.activePieces.map(piece => piece.coordinate)
	}

	render() {
		this.renderBackground()
		this.renderHighlights()
		this.renderBlocks()
	}

	coordinateToPixel({ i, j }: Coordinate) {
		return { x: i * this.CELL_SIZE, y: j * this.CELL_SIZE }
	}

	select(coordinate: Coordinate) {
		const piece = this.getPiece(coordinate)
		if (piece === null) {
			return
		}

		if (!this.activePieces.some(possible => possible === piece)) {
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

		if (!piece.validMoves().some((m) => (i === m.i && m.j === j))) {
			return
		}

		if (piece.canSkip()) {
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

			if (piece.canSkip()) {
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

	swap({ i, j }: Coordinate) {
		const selected = this.selected!

		const temp = this.blocks[j][i]
		this.blocks[j][i] = this.blocks[selected.j][selected.i]
		this.blocks[selected.j][selected.i] = temp

		this.selected = null
	}

	handleClick = (event: MouseEvent) => {
		let rect = this.canvas.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		const i = ~~(x / this.CELL_SIZE)
		const j = ~~(y / this.CELL_SIZE)

		const coordinate = { i, j }

		if (this.selected === null) {
			this.select(coordinate)
		} else {
			this.move(coordinate)
		}

		this.setActivePieces()
		this.checkGameOver()
		this.render()
	}

	checkGameOver() {
		if (this.activePieces.length === 0) {
			this.isGameOver = true
			this.setStatus(`${this.activePlayer === "red" ? "black" : "red"} wins`)
		}
	}

	initControl() {
		this.canvas.addEventListener("mousedown", this.handleClick)
	}

	initPieces() {
		const pieces = [
			[null, "b", null, "b", null, "b", null, "b"],
			["b", null, "b", null, "b", null, "b", null],
			[null, "b", null, "b", null, "b", null, "b"],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			["r", null, "r", null, "r", null, "r", null],
			[null, "r", null, "r", null, "r", null, "r"],
			["r", null, "r", null, "r", null, "r", null],
		]

		for (let j = 0; j < pieces.length; j++) {
			for (let i = 0; i < pieces[j].length; i++) {
				const type = pieces[j][i]
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
	}
}

class RedPiece implements Piece {
	color = "#f00"
	coordinate: Coordinate
	board: Board
	offsets: [number, number][] = [
		[1, -1],
		[-1, -1]
	]

	constructor(board: Board, coordinate: Coordinate) {
		this.board = board
		this.coordinate = coordinate
	}

	canPromote(): boolean {
		return this.coordinate.j === 0
	}

	promote() {
		this.offsets = [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1]
		]
		this.color = "#ff5555"
	}

	render(i: number, j: number) {
		const offset = this.board.CELL_SIZE / 2
		const x = offset + 1 + i * board.CELL_SIZE
		const y = offset + 1 + j * board.CELL_SIZE

		board.ctx.fillStyle = this.color
		board.ctx.beginPath()
		board.ctx.strokeStyle = "black"
		board.ctx.lineWidth = 2
		board.ctx.arc(x, y, 35, 0, 2 * Math.PI)
		board.ctx.fill()
		board.ctx.stroke()
		board.ctx.closePath()
	}

	validMoves(): Coordinate[] {
		const coordinates = []

		for (const offset of this.offsets) {
			const coordinate: Coordinate = {
				i: this.coordinate.i + offset[0],
				j: this.coordinate.j + offset[1]
			}

			if (this.board.getPiece(coordinate) instanceof BlackPiece) {
				coordinate.i += offset[0]
				coordinate.j += offset[1]
			}

			if (this.board.getPiece(coordinate) instanceof BlackPiece
				|| this.board.getPiece(coordinate) instanceof RedPiece) {
				continue
			}

			if (this.board.isOutOfBounds(coordinate)) {
				continue
			}
			coordinates.push(coordinate)
		}

		if (coordinates.some((coordinate) => this.isSkip(coordinate))) {
			return coordinates.filter((coordinate) => this.isSkip(coordinate))
		}

		return coordinates
	}

	hasValidMoves(): boolean {
		return this.validMoves().length > 0
	}

	canSkip() {
		const moves = this.validMoves()
		return moves.some(coordinate => this.isSkip(coordinate))
	}

	isSkip(coordinate: Coordinate) {
		const distance = Math.abs(this.coordinate.i - coordinate.i) + Math.abs(this.coordinate.j - coordinate.j)
		return distance > 2
	}
}

class BlackPiece implements Piece {
	color = "#000"
	coordinate: Coordinate
	board: Board
	offsets: [number, number][] = [
		[1, 1],
		[-1, 1]
	]

	constructor(board: Board, coordinate: Coordinate) {
		this.board = board
		this.coordinate = coordinate
	}

	canPromote(): boolean {
		return this.coordinate.j === 7
	}

	promote() {
		this.offsets = [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1]
		]
		this.color = "#333"
	}

	render(i: number, j: number) {
		const offset = this.board.CELL_SIZE / 2
		const x = offset + 1 + i * board.CELL_SIZE
		const y = offset + 1 + j * board.CELL_SIZE

		board.ctx.fillStyle = this.color
		board.ctx.beginPath()
		board.ctx.strokeStyle = "black"
		board.ctx.lineWidth = 2
		board.ctx.arc(x, y, 35, 0, 2 * Math.PI)
		board.ctx.fill()
		board.ctx.stroke()
		board.ctx.closePath()
	}

	validMoves(): Coordinate[] {
		const coordinates = []

		for (const offset of this.offsets) {
			const coordinate = {
				i: this.coordinate.i + offset[0],
				j: this.coordinate.j + offset[1]
			}

			if (this.board.getPiece(coordinate) instanceof RedPiece) {
				coordinate.i += offset[0]
				coordinate.j += offset[1]
			}

			if (this.board.getPiece(coordinate) instanceof BlackPiece
				|| this.board.getPiece(coordinate) instanceof RedPiece) {
				continue
			}

			if (
				this.board.isOutOfBounds(coordinate)
			) {
				continue
			}
			coordinates.push(coordinate)
		}

		if (coordinates.some((coordinate) => this.isSkip(coordinate))) {
			return coordinates.filter((coordinate) => this.isSkip(coordinate))
		}

		return coordinates
	}

	hasValidMoves(): boolean {
		return this.validMoves().length > 0
	}

	canSkip() {
		const moves = this.validMoves()
		return moves.some(coordinate => this.isSkip(coordinate))
	}

	isSkip(coordinate: Coordinate) {
		const distance = Math.abs(this.coordinate.i - coordinate.i) + Math.abs(this.coordinate.j - coordinate.j)
		return distance > 2
	}
}

const board = new Board()
board.render()