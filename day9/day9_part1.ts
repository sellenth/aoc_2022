import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

function parse_moves(input: string) {
  let lines = input.split('\n')
  let moves: Array<[string, number]> = []

  lines.forEach( (line) => {
    let [dir, count] = line.split(' ')
    moves.push([dir, parseInt(count)])
  })

  return moves
}
let moves = parse_moves(input)

class Knot {
  x_pos:number = 0
  y_pos:number = 0
}

let knots: Array<Knot> = []

let head = new Knot()
let last_head = new Knot()
let tail = new Knot()

let visited: Record<string, number> = {}

function tail_not_adjacent(head: Knot, tail: Knot) {
  return Math.abs(head.x_pos - tail.x_pos) > 1 ||
      Math.abs(head.y_pos - tail.y_pos) > 1
}

function apply_moves(head: Knot, tail: Knot, moves: Array<[string, number]>) {
  let c = 0;
  for (let i = 0; i < moves.length; ++i)
  {
    let move = moves[i]

    let [dir, count] = move


    for (let unit = 0; unit < count; unit++)
    {
      c++

      last_head.x_pos = head.x_pos
      last_head.y_pos = head.y_pos

      switch (dir) {
        case 'U':
          head.y_pos += 1
          break
        case 'D':
          head.y_pos -= 1
          break
        case 'L':
          head.x_pos -= 1
          break
        case 'R':
          head.x_pos += 1
          break
      }

      if (tail_not_adjacent(head, tail)) {
        tail.x_pos = last_head.x_pos
        tail.y_pos = last_head.y_pos
      }

//      console.log("After move " + c + ": tail at position ( " + tail.x_pos + ", " + tail.y_pos, ")")

      let curr_pos = tail.x_pos + "," + tail.y_pos
      visited[curr_pos] = 1

    }
  }
}

apply_moves(head, tail, moves)

console.log(tail)
console.log("Visited ", Object.keys(visited).length, " unique coordinates")
