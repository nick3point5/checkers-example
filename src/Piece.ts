import { Board } from "./Board"
import { Coordinate } from "./Coordinate"


export class Piece {
	color: string
	promotionColor: string
	promotionRow: number
	coordinate: Coordinate
	board: Board
	moves: [number, number][]

	constructor(board: Board, coordinate: Coordinate, color: string, promotionColor: string, promotionRow: number, moves: [number, number][]) {
		this.board = board
		this.coordinate = coordinate
		this.color = color
		this.promotionColor = promotionColor
		this.promotionRow = promotionRow
		this.moves = moves
	}

	canPromote(): boolean {
		return this.coordinate.j === this.promotionRow
	}

	promote() {
		this.moves = [
			[1, 1],
			[-1, 1],
			[-1, -1],
			[1, -1]
		]
		this.color = this.promotionColor
	}

	isPlayerPiece(coordinate: Coordinate) {
		return this.board.getPiece(coordinate) instanceof this.constructor
	}

	isOpponentPiece(coordinate: Coordinate) {
		return this.board.getPiece(coordinate) !== null
			&& !this.isPlayerPiece(coordinate)
	}

	validMoves(): Coordinate[] {
		const coordinates = []

		for (const move of this.moves) {
			const jumpCoordinate = {
				i: this.coordinate.i + move[0],
				j: this.coordinate.j + move[1]
			}

			if (this.isOpponentPiece(jumpCoordinate)) {
				jumpCoordinate.i += move[0]
				jumpCoordinate.j += move[1]
			}

			if (this.board.getPiece(jumpCoordinate) !== null) {
				continue
			}

			if (this.board.isOutOfBounds(jumpCoordinate)) {
				continue
			}
			coordinates.push(jumpCoordinate)
		}

		if (coordinates.some((coordinate) => this.isSkip(coordinate))) {
			return coordinates.filter((coordinate) => this.isSkip(coordinate))
		}

		return coordinates
	}

	hasValidMoves() {
		return this.validMoves().length > 0
	}

	isValidMove({i, j}: Coordinate) {
		return this.validMoves().some(m => m.i === i && m.j === j)
	}

	hasSkip() {
		const moves = this.validMoves()
		return moves.some(coordinate => this.isSkip(coordinate))
	}

	isSkip({i, j}: Coordinate) {
		const distance = Math.abs(this.coordinate.i - i) + Math.abs(this.coordinate.j - j)
		return distance > 2
	}
}

export class RedPiece extends Piece {
	constructor(board: Board, coordinate: Coordinate) {
		const color = "#f00"
		const promotionColor = "#f55"
		const promotionRow = 0
		const offsets: [number, number][] = [
			[1, -1],
			[-1, -1]
		]

		super(board, coordinate, color, promotionColor, promotionRow, offsets)
	}
}

export class BlackPiece extends Piece {
	constructor(board: Board, coordinate: Coordinate) {
		const color = "#000"
		const promotionColor = "#333"
		const promotionRow = 7
		const offsets: [number, number][] = [
			[1, 1],
			[-1, 1]
		]

		super(board, coordinate, color, promotionColor, promotionRow, offsets)
	}
}
