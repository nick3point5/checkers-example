import { Board, Coordinate, Piece } from "./Board"
import { getMovablePieces, isMovable } from "./Move"

export type Player = "red" | "black"
export type GameState = {
	board: Board,
	player: Player,
	selected: Coordinate | null
}

export function select(gameState: GameState, coordinate: Coordinate) {
	const { board, player } = gameState

	if (!isMovable(board, player, coordinate)) {
		return
	}

	gameState.selected = coordinate
}

export function unselect(gameState: GameState) {
	gameState.selected = null
}

export function isActive(piece: Piece, player: Player) {
	if (player === "red") {
		return piece === Piece.red || piece === Piece.redKing
	} else if (player === "black") {
		return piece === Piece.black || piece === Piece.blackKing
	}
}

export function getOtherPlayer(player: Player) {
	return player === "black" ? "red" : "black"
}

export function changePlayer(gameState: GameState) {
	gameState.player = getOtherPlayer(gameState.player)
}

export function isGameOver(board: Board, player: Player) {
	const movablePieces = getMovablePieces(board, player)
	return movablePieces.length === 0
}
