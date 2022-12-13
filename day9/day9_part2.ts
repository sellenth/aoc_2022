import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

let test_input = `R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`

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
  name:string = "H"
  x_pos:number = 0
  y_pos:number = 0

  prev_x:number = 0
  prev_y:number = 0

  constructor(n: string) {
    this.name = n
  }
}

let knots: Array<Knot> = []

let num_knots = 10
for (let i = 0; i < num_knots; i++)
  knots.push( new Knot(i.toString()) )

let visited: Record<string, number> = {}

function tail_not_adjacent(head: Knot, tail: Knot) {
  return Math.abs(head.x_pos - tail.x_pos) > 1 ||
      Math.abs(head.y_pos - tail.y_pos) > 1
}

function apply_moves(knots: Array<Knot>, moves: Array<[string, number]>) {
  let c = 0;
  let head = knots[0]
  for (let i = 0; i < moves.length; ++i)
  {
    let move = moves[i]

    let [dir, count] = move


    for (let unit = 0; unit < count; unit++)
    {
      c++

      head.prev_x = head.x_pos
      head.prev_y = head.y_pos

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

      for (let knot_num = 1; knot_num < num_knots; knot_num++ )
      {
        let prev_knot = knots[knot_num - 1]
        let tail = knots[knot_num]
        if (tail_not_adjacent(prev_knot, tail)) {
          tail.x_pos += Math.sign(prev_knot.x_pos - tail.x_pos)
          tail.y_pos += Math.sign(prev_knot.y_pos - tail.y_pos)
        }

      }

      /*
      let map: any = []
      for (let z = 0; z < 20; z++)
        map.push(new Array(20).fill('.'))

      for (let k = 0; k < num_knots; ++k)
      {
        map[knots[k].y_pos][knots[k].x_pos] = knots[k].name
      }

      if (c > 7 && c < 15)
        for (let z = 0; z < 20; z++)
          console.log(map[z].join(""))
          */


      let rope_tail = knots[knots.length - 1]

      //console.log("After move " + c + ": head at position ( " + knots[0].x_pos + ", " + knots[0].y_pos, ")")
      //console.log("After move " + c + ": tail at position ( " + rope_tail.x_pos + ", " + rope_tail.y_pos, ")")
      //console.log("\n")
      let curr_pos = rope_tail.x_pos + "," + rope_tail.y_pos
      visited[curr_pos] = 1

    }
  }
}

apply_moves(knots, moves)

console.log("Visited ", Object.keys(visited).length, " unique coordinates")
