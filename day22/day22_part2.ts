import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true
let stride = testing ? 4 : 50
let input = testing ? test_input : real_input;

let [map_part, moves_list] = input.split('\n\n')

let map= map_part.split('\n').map( (line) => line.split('') )


function display_map() {
  for (let i = 0; i < map.length; ++i) {
    for (let j = 0; j < map[i].length; ++j) {
      if (p.state.row == i && p.state.col == j){
        process.stdout.write('X')
      } else
        process.stdout.write(map[i][j])
    }
    console.log()
  }
}

function in_range(x: number, l: number, r: number) {
  return x >= l && x <= r
}

function left_col_of(region: number): number {
  switch (region) {
      case 1:
        return 8
      case 2:
        return 0
      case 3:
        return 4
      case 4:
        return 8
      case 5:
        return 8
      case 6:
        return 12
      default:
        console.log("shouldn't be here")
        return -1
  }
}

function right_col_of(region: number) {
  return left_col_of(region) + 3
}

function top_row_of(region: number): number {
  switch (region) {
      case 1:
        return 0
      case 2:
        return 4
      case 3:
        return 4
      case 4:
        return 4
      case 5:
        return 8
      case 6:
        return 8
      default:
        console.log("shouldn't be here")
        return -1
  }
}

function bottom_row_of(region: number) {
  return top_row_of(region) + 3
}

class State {
  row: number
  col: number
  dir: Dir

  constructor(d: Dir, r: number, c: number) {
    this.dir = d
    this.row = r
    this.col = c
  }

  getHash() {
    return [this.dir, this.row, this.col].join(',')
  }

  blocked() {
    return map[this.row][this.col] == '#'
  }

  equals(other: State) {
    return this.row == other.row
      && this.col == other.col
      && this.dir == other.dir

  }
}

let edges: Record<string, State> = {}

function gen_list(d: Dir, r_start: number, r_amt: number, c_start: number, c_amt: number) {
  let list: State[] = []

  if (r_amt) {
    let end_cond = r_start + r_amt
    for (; r_start != end_cond; r_start += Math.sign(r_amt)) {
      list.push(new State(d, r_start, c_start))
    }
  } else {
    let end_cond = c_start + c_amt
    for (; c_start != end_cond; c_start += Math.sign(c_amt)) {
      list.push(new State(d, r_start, c_start))
    }
  }

  return list
}

enum Dir {
  R = 0,
  D = 1,
  L = 2,
  U = 3
}

function flip_dir(dir: Dir) {
  return (dir + 2) % 4
}

function insert_inverse(from: State, to: State) {
  let new_from = new State(flip_dir(to.dir), to.row, to.col)
  let new_to   = new State(flip_dir(from.dir), from.row, from.col)
  edges[new_from.getHash()] = new_to
}

function populate_edges(from_states: State[], to_states: State[]) {
  from_states.map( (from: State, i: number) => {
    edges[from.getHash()] = to_states[i]
    insert_inverse(from, to_states[i])
  } )
}

//populate edges map

if (testing) {
  // bottom of 2 to 5
  let a = gen_list(Dir.D, bottom_row_of(2), 0, left_col_of(2), stride)
  let b = gen_list(Dir.U, bottom_row_of(5), 0, right_col_of(5), -stride)
  populate_edges(a, b)

  // bottom of 3 to 5
  a = gen_list(Dir.D, bottom_row_of(3), 0, left_col_of(3), stride)
  b = gen_list(Dir.R, bottom_row_of(5), -stride, left_col_of(5), 0)
  populate_edges(a, b)

  // bottom of 6 to 2
  a = gen_list(Dir.D, bottom_row_of(6), 0, left_col_of(6), stride)
  b = gen_list(Dir.R, bottom_row_of(2), -stride, left_col_of(2), 0)
  populate_edges(a, b)

  // right of 6 to 1
  a = gen_list(Dir.R, bottom_row_of(6), -stride, right_col_of(6), 0)
  b = gen_list(Dir.L, top_row_of(1), +stride, right_col_of(1), 0)
  populate_edges(a, b)

  //untested

  // top of 6 to 4
  a = gen_list(Dir.U, top_row_of(6), 0, left_col_of(6), stride)
  b = gen_list(Dir.L, bottom_row_of(4), -stride, right_col_of(4), 0)
  populate_edges(a, b)

  // top of 1 to 2
  a = gen_list(Dir.U, top_row_of(1), 0, left_col_of(1), stride)
  b = gen_list(Dir.D, top_row_of(2), 0, right_col_of(2), -stride)
  populate_edges(a, b)

  // left of 1 to 3
  a = gen_list(Dir.L, top_row_of(1), +stride, left_col_of(1), 0)
  b = gen_list(Dir.D, top_row_of(3), 0, left_col_of(3), stride)
  populate_edges(a, b)
}

type Turn = 'R' | 'L'

class Player {
  state: State = new State(0, 0, 0)
  map: string[][]
  moves: string[]
  stride: number = 4


  constructor(map: string[][]) {
    this.map = map
    let reg = /([0-9]+)|(L|R)/g
    this.moves = moves_list.match(reg)!

    for (let i = 0; i < map.length; ++i) {
      for (let j = 0; j < map[i].length; ++j) {
        if (map[i][j] == '.') {
          this.state.row = i
          this.state.col = j
          this.state.dir = Dir.R
          return
        }
      }
    }
  }

  perform_moves() {
    this.moves.forEach( (move) => {
      if (move == 'L' || move == 'R')
        this.turn(move)
      else {
        for (let i = 0; i < parseInt(move); ++i) {
          let res = this.move_in_dir()
          if (res < 1)
            break
        }
      }
    } )
  }

  move_in_dir() {
    switch (this.state.dir) {
      case Dir.R:
        return this.move_r()
      case Dir.L:
        return this.move_l()
      case Dir.D:
        return this.move_d()
      case Dir.U:
        return this.move_u()
    }
  }

  move_r() {
    return this.move(0, 1)
  }

  move_l() {
    return this.move(0, -1)
  }

  move_u() {
    return this.move(-1, 0)
  }

  move_d() {
    return this.move(1, 0)
  }


  move(r_inc: number, c_inc: number) {
    let new_dir
    if (r_inc == 1) new_dir = Dir.D
    else if (r_inc == -1) new_dir = Dir.U
    else if (c_inc == 1) new_dir = Dir.R
    else new_dir = Dir.L

    let hash = this.state.getHash()
    let new_state: State;
    if (hash in edges) {
      new_state = edges[hash]
    } else {
      new_state = new State(new_dir, this.state.row + r_inc, this.state.col + c_inc)
    }


    if (new_state.blocked())
      return -1
    else {
      this.state = new_state
      return 1
    }
  }

  turn(turn: Turn) {
    if (turn == 'R') {
      this.state.dir = (this.state.dir + 1) % 4
    } else {
      this.state.dir-=1
      if (this.state.dir < 0)
        this.state.dir = 3
    }
  }
}

function assert(a: boolean, msg: string) {
  if (!a) {
    console.log(msg)
    process.exit()
  }
}

let p = new Player(map)

/*
{ // Test bottom 2 & bottom 5
  let orig_row = bottom_row_of(2)
  let orig_col = left_col_of(2)
  p.state.row = orig_row
  p.state.col = orig_col
  p.state.dir = Dir.D
  p.move_d()
  assert(p.state.equals(new State(Dir.U,
                                  bottom_row_of(5),
                                  right_col_of(5)))
         , "bottom 2 not working")

  p.state.dir = Dir.D
  p.move_d()
  assert(p.state.equals(new State(Dir.U,
                                  orig_row,
                                  orig_col))
         , "bottom 5 not working")
}

{ // Test bottom 3 & left 5
  let orig_row = bottom_row_of(3)
  let orig_col = left_col_of(3)
  p.state.row = orig_row
  p.state.col = orig_col
  p.state.dir = Dir.D
  p.move_d()
  assert(p.state.equals(new State(Dir.R,
                                  bottom_row_of(5),
                                  left_col_of(5)))
         , "bottom 3 not working")

  p.state.dir = Dir.L
  p.move_l()
  assert(p.state.equals(new State(Dir.U,
                                  orig_row,
                                  orig_col))
         , "bottom 5 not working")
}

{ // Test bottom 6 & left 2
  let orig_row = bottom_row_of(6)
  let orig_col = left_col_of(6)
  p.state.row = orig_row
  p.state.col = orig_col
  p.state.dir = Dir.D
  p.move_d()
  assert(p.state.equals(new State(Dir.R,
                                  bottom_row_of(2),
                                  left_col_of(2)))
         , "bottom 6 not working")

  p.state.dir = Dir.L
  p.move_l()
  assert(p.state.equals(new State(Dir.U,
                                  orig_row,
                                  orig_col))
         , "left 2 not working")
}

{ // Test right 6 & right 1
  let orig_row = bottom_row_of(6) - 1
  let orig_col = right_col_of(6)
  p.state.row = orig_row
  p.state.col = orig_col
  p.state.dir = Dir.R
  p.move_r()

  assert(p.state.equals(new State(Dir.L,
                                  top_row_of(1) + 1,
                                  right_col_of(1)))
         , "right 6 not working")

  p.state.dir = Dir.R
  p.move_r()
  assert(p.state.equals(new State(Dir.L,
                                  orig_row,
                                  orig_col))
         , "right 1 not working")
}*/

p.perform_moves()
display_map()
console.log((p.state.row + 1) * 1000 + (p.state.col + 1) * 4 + p.state.dir as Number)
