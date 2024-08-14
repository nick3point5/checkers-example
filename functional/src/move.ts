import { Coordinate, Board, getPiece, isOpponentPiece, Piece, setPiece } from "./board"
import { GameState, select, unselect, Player, changePlayer, isActive } from "./gameState"

export type Moves = Coordinate[]

export function getMoves(coordinate: Coordinate, board: Board): Moves {
	const piece = getPiece(coordinate, board)
	if (piece === null) {
		return []
	}

	const pieceHasSkip = hasSkip(coordinate, board)
	const directions = getDirections(piece)

	const moves = directions.map((direction) => {
		const move = {
			i: coordinate.i + direction[0],
			j: coordinate.j + direction[1],
		}

		if (pieceHasSkip && canSkip(coordinate, board, direction)) {
			return {
				i: move.i + direction[0],
				j: move.j + direction[1],
			}
		} else if (!pieceHasSkip) {
			const target = getPiece(move, board)
			if (target === Piece.empty) {
				return move
			}
		}

		return null
	})
		.filter(move => move !== null)

	return moves
}

function hasMoves(coordinate: Coordinate, board: Board) {
	return getMoves(coordinate, board).length > 0
}

function isForced(player: Player, board: Board) {
	return board.some((row, j) =>
		row.some((piece, i) => isActive(piece, player) && hasSkip({ i, j }, board))
	)
}

export function getMovablePieces(board: Board, player: Player) {
	const forced = isForced(player, board)

	return board.map((row, j) =>
		row.map((piece, i) => {
			if (!isActive(piece, player)) {
				return null
			}

			if (!hasMoves({ i, j }, board)) {
				return null
			}

			if (forced && !hasSkip({ i, j }, board)) {
				return null
			}

			return { i, j }
		})
	).flat(1).filter(piece => piece !== null)
}

export function isMovable(board: Board, player: Player, coordinate: Coordinate) {
	const movablePieces = getMovablePieces(board, player)

	return movablePieces.some(({ i, j }) => i === coordinate.i && j === coordinate.j)
}

function isValidMove({ i, j }: Coordinate, moves: Moves) {
	return moves.some(move => move.i === i && move.j === j)
}

function canPromote(coordinate: Coordinate, board: Board) {
	const piece = getPiece(coordinate, board)
	if (piece === Piece.red && coordinate.j === 0) {
		return true
	}

	if (piece === Piece.black && coordinate.j === 7) {
		return true
	}

	return false
}

function promote(coordinate: Coordinate, board: Board) {
	const piece = getPiece(coordinate, board)
	if (piece === null) {
		return
	}

	switch (piece) {
		case Piece.red:
			setPiece(coordinate, board, Piece.redKing)
			break;
		case Piece.black:
			setPiece(coordinate, board, Piece.blackKing)
			break;

		default:
			break;
	}
}

function isSkip(coordinate: Coordinate, move: Coordinate) {
	const distance = Math.abs(coordinate.i - move.i) + Math.abs(coordinate.j - move.j)
	return distance > 2
}

function skip(move: Coordinate, board: Board, target: Coordinate) {
	const opponentCoordinate = {
		i: move.i + (target.i - move.i) / 2,
		j: move.j + (target.j - move.j) / 2,
	}
	setPiece(opponentCoordinate, board, Piece.empty)
}

type Direction = [number, number]
function getDirections(piece: Piece): Direction[] {
	switch (piece) {
		case Piece.black:
			return [
				[1, 1],
				[-1, 1]
			]
		case Piece.red:
			return [
				[1, -1],
				[-1, -1]
			]
		case Piece.redKing:
			return [
				[1, 1],
				[-1, 1],
				[1, -1],
				[-1, -1]
			]
		case Piece.blackKing:
			return [
				[1, 1],
				[-1, 1],
				[1, -1],
				[-1, -1]
			]
		default:
			return []
	}
}

function canSkip(coordinate: Coordinate, board: Board, direction: Direction) {
	const piece = getPiece(coordinate, board)
	if (piece === null) {
		return false
	}

	const move = {
		i: coordinate.i + direction[0],
		j: coordinate.j + direction[1],
	}

	const other = getPiece(move, board)
	if (other === null) {
		return false
	}

	if (!isOpponentPiece(piece, other)) {
		return false
	}

	const skipMove = {
		i: move.i + direction[0],
		j: move.j + direction[1],
	}

	if (getPiece(skipMove, board) !== Piece.empty) {
		return false
	}

	return true
}

function hasSkip(coordinate: Coordinate, board: Board) {
	const piece = getPiece(coordinate, board)
	if (piece === null) {
		return false
	}

	const directions = getDirections(piece)

	return directions.some(direction => canSkip(coordinate, board, direction))
}

export function move(gameState: GameState, target: Coordinate) {
	const { selected, board } = gameState
	if (selected === null) {
		return
	}

	const piece = getPiece(selected, board)
	if (piece === null) {
		return
	}

	const moves = getMoves(selected, board)

	if (!isValidMove(target, moves)) {
		return
	}

	setPiece(selected, board, Piece.empty)
	setPiece(target, board, piece)

	if (canPromote(target, board)) {
		promote(target, board)
	}

	if (isSkip(selected, target)) {
		skip(selected, board, target)
		if (hasSkip(target, board)) {
			select(gameState, target)
			return
		}
	}

	unselect(gameState)
	changePlayer(gameState)
}
