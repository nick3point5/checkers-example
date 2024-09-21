import { Board } from "./Board"
import { Controller } from "./Controller"
import { Renderer } from "./Renderer"

const board = new Board()
const renderer = new Renderer(document)

new Controller(board, renderer)
