import { beforeEach, describe, expect, test } from "vitest"
import { Board } from "./Board"
import { BlackPiece, RedPiece } from "./Piece"

document.body.innerHTML = ('<h1 id="status"></h1><canvas id="board" width="640" height="640"></canvas>')
HTMLCanvasElement.prototype.getContext = () => null

let board = new Board()
beforeEach(() => {
	board = new Board()
})

test("board changePlayer", () => {
	expect(board.player).toBe("red")
	board.changePlayer()
	expect(board.player).toBe("black")
})

test("isOutOfBounds", () => {
	expect(board.isOutOfBounds({ i: 0, j: 0 })).toBe(false)
	expect(board.isOutOfBounds({ i: -1, j: 0 })).toBe(true)
	expect(board.isOutOfBounds({ i: 0, j: -1 })).toBe(true)
	expect(board.isOutOfBounds({ i: 8, j: 0 })).toBe(true)
	expect(board.isOutOfBounds({ i: 0, j: 8 })).toBe(true)
})

test("getPiece", () => {
	expect(board.getPiece({ i: 0, j: 0 })).toBe(null)
	expect(board.getPiece({ i: 1, j: 0 })).toBeInstanceOf(BlackPiece)
	expect(board.getPiece({ i: 0, j: 7 })).toBeInstanceOf(RedPiece)
	expect(board.getPiece({ i: -1, j: -1 })).toBe(null)
})

test("select", () => {
	board.select({ i: 0, j: 5 })
	expect(board.selected).toStrictEqual({ i: 0, j: 5 })
	expect(board.getPiece(board.selected!)).toBeInstanceOf(RedPiece)
})


describe("moves", () => {
	test("red move", () => {
		board.initBoard = [
			[null, "b", null, "b", null, "b", null, "b"],
			["b", null, "b", null, "b", null, "b", null],
			[null, "b", null, "b", null, "b", null, "b"],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			["r", null, "r", null, "r", null, "r", null],
			[null, "r", null, "r", null, "r", null, "r"],
			["r", null, "r", null, "r", null, "r", null],
		]

		board.initPieces()
		board.select({ i: 0, j: 5 })
		expect(board.getPiece({ i: 0, j: 5 })).toBeInstanceOf(RedPiece)

		board.move({ i: 1, j: 4 })

		expect(board.getPiece({ i: 0, j: 5 })).toBe(null)
		expect(board.getPiece({ i: 1, j: 4 })).toBeInstanceOf(RedPiece)
	})

	test("black move", () => {
		board.initBoard = [
			[null, "b", null, "b", null, "b", null, "b"],
			["b", null, "b", null, "b", null, "b", null],
			[null, "b", null, "b", null, "b", null, "b"],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			["r", null, "r", null, "r", null, "r", null],
			[null, "r", null, "r", null, "r", null, "r"],
			["r", null, "r", null, "r", null, "r", null],
		]
		board.player = "black"

		board.initPieces()
		board.select({ i: 1, j: 2 })
		expect(board.getPiece({ i: 1, j: 2 })).toBeInstanceOf(BlackPiece)

		board.move({ i: 0, j: 3 })

		expect(board.getPiece({ i: 1, j: 2 })).toBe(null)
		expect(board.getPiece({ i: 0, j: 3 })).toBeInstanceOf(BlackPiece)
	})

	test("red jump", () => {
		board.initBoard = [
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, "b", null, null, null, null],
			[null, null, "r", null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
		]

		board.initPieces()
		board.select({ i: 2, j: 5 })
		expect(board.getPiece({ i: 2, j: 5 })).toBeInstanceOf(RedPiece)

		board.move({ i: 4, j: 3 })

		expect(board.getPiece({ i: 2, j: 5 })).toBe(null)
		expect(board.getPiece({ i: 3, j: 4 })).toBe(null)
		expect(board.getPiece({ i: 4, j: 3 })).toBeInstanceOf(RedPiece)
	})

	test("black jump", () => {
		board.initBoard = [
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, "b", null, null, null, null],
			[null, null, "r", null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
		]

		board.player = "black"
		board.initPieces()
		board.select({ i: 3, j: 4 })
		expect(board.getPiece({ i: 3, j: 4 })).toBeInstanceOf(BlackPiece)

		board.move({ i: 1, j: 6 })

		expect(board.getPiece({ i: 3, j: 4 })).toBe(null)
		expect(board.getPiece({ i: 2, j: 5 })).toBe(null)
		expect(board.getPiece({ i: 1, j: 6 })).toBeInstanceOf(BlackPiece)
	})
})
