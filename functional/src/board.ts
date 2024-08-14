export enum Piece {
	empty = 0,
	red = 1,
	redKing = 2,
	black = 3,
	blackKing = 4,
}

export type Board = Piece[][]

export type Coordinate = {
	i: number
	j: number
}

export function isOutOfBounds({ i, j }: Coordinate, board: Board) {
	return i < 0
		|| j < 0
		|| i >= board[0].length
		|| j >= board.length
}

export function isOpponentPiece(piece: Piece, other: Piece) {
	switch (piece) {
		case Piece.red:
			return other === Piece.black || other === Piece.blackKing
		case Piece.redKing:
			return other === Piece.black || other === Piece.blackKing
		case Piece.black:
			return other === Piece.red || other === Piece.redKing
		case Piece.blackKing:
			return other === Piece.red || other === Piece.redKing
		default:
			return false
	}
}

export function setPiece({ i, j }: Coordinate, board: Board, piece: Piece) {
	board[j][i] = piece
}

export function getPiece({ i, j }: Coordinate, board: Board) {
	if (isOutOfBounds({ i, j }, board)) {
		return null
	}
	return board[j][i]
}
