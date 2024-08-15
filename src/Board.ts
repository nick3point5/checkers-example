import { Coordinate } from "./Coordinate"
import { Piece, BlackPiece, RedPiece } from "./Piece"


export class Board {
	selected: Coordinate | null = null
	player: "red" | "black" = "red"
	highlights: Coordinate[] = []
	movablePieces: Piece[] = []

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


	constructor() {
		this.initPieces()
	}

	changePlayer() {
		this.selected = null
		this.player = this.player === "red" ? "black" : "red"
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

	checkGameOver() {
		return this.movablePieces.length === 0
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
