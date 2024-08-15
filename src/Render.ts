import { Coordinate, Piece, Board } from "./Board"
import { GameState, getOtherPlayer, isGameOver, Player } from "./GameState"
import { getMovablePieces, getMoves } from "./Move"

function renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number, size: number, board: Board) {
	ctx.fillStyle = "#000"
	ctx.fillRect(0, 0, width, height)

	const color1 = "#6c4417"
	const color2 = "#b2907b"

	board.forEach((row, j) => {
		row.forEach((_, i) => {
			ctx.fillStyle = (i + j) % 2 !== 0 ? color1 : color2
			const x = 2 + size * i
			const y = 2 + size * j
			const width = size - 2
			const height = size - 2
			ctx.fillRect(x, y, width, height)
		})
	})
}

function getColor(piece: Piece) {
	switch (piece) {
		case Piece.black:
			return "#000"
		case Piece.red:
			return "#f00"
		case Piece.blackKing:
			return "#333"
		case Piece.redKing:
			return "#f55"
		default:
			throw new Error("Invalid piece");
	}
}

function renderPiece(ctx: CanvasRenderingContext2D, size: number, { i, j }: Coordinate, piece: Piece) {
	if (piece === Piece.empty) {
		return
	}

	const offset = size / 2
	const x = offset + 1 + i * size
	const y = offset + 1 + j * size

	ctx.fillStyle = getColor(piece)
	ctx.beginPath()
	ctx.strokeStyle = "black"
	ctx.lineWidth = 2
	ctx.arc(x, y, 35, 0, 2 * Math.PI)
	ctx.fill()
	ctx.stroke()
	ctx.closePath()
}

function renderPieces(ctx: CanvasRenderingContext2D, size: number, board: Board) {
	board.forEach((row, j) => {
		row.forEach((piece, i) => {
			renderPiece(ctx, size, { i, j }, piece)
		})
	})
}

function coordinateToPixel({ i, j }: Coordinate, size: number) {
	return { x: i * size, y: j * size }
}

function renderHighlight(ctx: CanvasRenderingContext2D, size: number, coordinate: Coordinate) {
	const { x, y } = coordinateToPixel(coordinate, size)

	ctx.strokeStyle = "#f19f1c"
	ctx.lineWidth = 4
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.lineTo(x + size, y)
	ctx.lineTo(x + size, y + size)
	ctx.lineTo(x, y + size)
	ctx.lineTo(x, y)
	ctx.stroke()
	ctx.closePath()
}

function renderMovableHighlight(ctx: CanvasRenderingContext2D, size: number, movablePieces: Coordinate[]) {
	movablePieces.forEach(coordinate => {
		renderHighlight(ctx, size, coordinate)
	})
}

function renderMoves(ctx: CanvasRenderingContext2D, size: number, gameState: GameState) {
	const { selected, board } = gameState
	if (selected === null) {
		return
	}

	const moves = getMoves(selected, board)
	moves.forEach(move => {
		renderHighlight(ctx, size, move)
	})
}

function setStatus(status: HTMLHeadingElement, message: string) {
	status.innerText = message
}

function showPlayerTurn(status: HTMLHeadingElement, player: Player) {
	setStatus(status, `${player}'s turn`)
}

export function showGameOver(status: HTMLHeadingElement, player: Player) {
	const winner = getOtherPlayer(player)
	console.log(`${winner} wins`)
	setStatus(status, `${winner} wins`)
}

export function render(canvas: HTMLCanvasElement, status: HTMLHeadingElement, gameState: GameState) {
	const { width, height } = canvas
	const ctx = canvas.getContext("2d")!
	const size = 80
	const { board, selected, player } = gameState
	renderBackground(ctx, width, height, size, board)
	renderPieces(ctx, size, board)
	if (selected === null) {
		const movablePieces = getMovablePieces(board, player)
		renderMovableHighlight(ctx, size, movablePieces)
	} else {
		renderMoves(ctx, size, gameState)
	}

	if (isGameOver(gameState.board, gameState.player)) {
		showGameOver(status, gameState.player)
	} else {
		showPlayerTurn(status, player)
	}
}
