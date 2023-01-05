import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let example = true
let input = example ? test_input : real_input;


enum Dir {
  U = 0,
  R = 1,
  D = 2,
  L = 3
}


class Blizzard {
  r: number
  c: number
  d: Dir

  constructor(r: number, c: number, d: Dir) {
    this.r = r
    this.c = c
    this.d = d
  }

  copy() {
    return new Blizzard(this.r, this.c, this.d)
  }

  move() {
    switch (this.d) {
        case Dir.U:
          if (this.r - 1 == 0)
            this.r = lines.length - 2
          else
            this.r--
          return
        case Dir.D:
          if (this.r + 1 == lines.length - 1)
            this.r = 1
          else
            this.r++
          return
        case Dir.L:
          if (this.c - 1 == 0)
            this.c = lines[0].length - 2
          else
            this.c--
          return
        case Dir.R:
          if (this.c + 1 == lines[0].length - 1)
            this.c = 1
          else
            this.c++
          return
    }

  }

  toHash() {
    return this.r + ',' + this.c
  }
}

class Player {
  r: number = 0
  c: number = 1
  going_back: boolean = false

  getAdj() {
    let r = this.r
    let c = this.c
    let adj_list: string[] = []

    adj_list.push( r + ',' + c )

    if (this.going_back && r - 1 == 0 && c == 1)
      adj_list.push( (r-1) + ',' + c )

    if (r - 1 > 0 )
      adj_list.push( (r-1) + ',' + c )

    if (c - 1 > 0 && r > 0 )
      adj_list.push( r + ',' + (c - 1) )

    if (c + 1 < lines[0].length - 1 && r > 0)
      adj_list.push( r + ',' + (c + 1) )

    if (r + 1 < lines.length - 1)
      adj_list.push( (r+1) + ',' + c )

    if (!this.going_back && r + 1 == lines.length - 1 && c == lines[0].length - 2)
        adj_list.push( (r+1) + ',' + c )

    return adj_list
  }
}

let blizzards: Record<string, Blizzard[]> = {}
let lines = input.split('\n')

lines.forEach( (line: string, i: number) => {
  line.split('').forEach( (char: string, j: number) => {

    let dir = -1

    switch (char) {
        case '>':
          dir = Dir.R
          break
        case '<':
          dir = Dir.L
          break
        case '^':
          dir = Dir.U
          break
        case 'v':
          dir = Dir.D
          break
    }

    if (dir != -1) {
      let key = i + ',' + j
      if (!(key in blizzards)) {
        blizzards[key] = []
      }

      blizzards[key].push(new Blizzard(i, j, dir))
    }
  })
} )

let p = new Player()

let blizzard_states: Array<Record<string, Blizzard[]>> = [blizzards]

function gen_next_blizz_state() {
  let curr_state = blizzard_states[blizzard_states.length - 1]
  let next_state: Record<string, Blizzard[]> = {}

  Object.values(curr_state).forEach( (bin) => {
    bin.forEach( blizzard => {
      let new_b = blizzard.copy()
      new_b.move()
      let key = new_b.toHash()
      if (!(key in next_state)) {
        next_state[key] = []
      }
      next_state[key].push(new_b)
    } )
  } )

  blizzard_states.push(next_state)
}


let end_r = lines.length - 1
let end_c = lines[0].length - 2


console.log(solve(0, 1, end_r, end_c) )
//p.going_back = true
//console.log(solve(end_r, end_c, 0, 1) )
//solve(0, 1, end_r, end_c)

function solve(start_r: number, start_c: number, end_r: number, end_c: number) {
  blizzard_states = [blizzard_states[blizzard_states.length - 1]]
  let states = [[start_r, start_c, 0]]
  let best_t = Number.MAX_SAFE_INTEGER

  let visited: Record<string, number> = {}
  let i = 0

  while (states.length) {
    ++i
    if (i % 1000000 == 0)
      console.log('\t', states.length)
    let [r, c, t] = states.pop()!
    p.r = r
    p.c = c

    let key = r + ',' + c + ',' + t
    if (key in visited)
      continue
    else
      visited[key] = 1

    let theoretical_best = Math.abs(r - end_r) + Math.abs(c - end_c)

    if (t+1 + theoretical_best >= best_t)
      continue

    // find valid moves at next timestep
    let potential_moves = p.getAdj()

    if (t+2 >= blizzard_states.length) {
      gen_next_blizz_state()
    }
    potential_moves.forEach( (move) => {
      if (move in blizzard_states[t+1])
        return
      else {
        let [move_r, move_c] = move.split(',').map(x => parseInt(x))

        if (move_r == end_r && move_c == end_c) {
          best_t = Math.min(best_t, t+1)
          return
        }

        states.push([move_r, move_c, t+1])
      }
    } )
  }

  console.log("Best time through blizzard: ", best_t)
  return best_t
}
