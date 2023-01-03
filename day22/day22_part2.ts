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
let input = testing ? test_input : real_input;

let [map_part, moves_list] = input.split('\n\n')

let map= map_part.split('\n').map( (line) => line.split('') )


function display_map() {
  for (let i = 0; i < map.length; ++i) {
    for (let j = 0; j < map[i].length; ++j) {
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

enum Dir {
  R = 0,
  D,
  L,
  U
}

let d = Dir.U

type Turn = 'R' | 'L'

class Player {
  row: number = -1
  col: number = -1
  dir: Dir = Dir.R
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
          this.row = i
          this.col = j
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
    switch (this.dir) {
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


  blocked(r: number, c: number) {
    return map[r][c] == '#'
  }

  move_d() {
    let test_r = this.row + 1
    let test_c = this.col

    { // bottom of 2 (to 5)
      let left_lim = left_col_of(2)
      let right_lim = right_col_of(2)
      if (in_range(test_c, left_lim, right_lim) && test_r == bottom_row_of(2) + 1) {
        let c_from_left = test_c - left_lim
        let r = bottom_row_of(5)
        let c = right_col_of(5) - c_from_left
        if (this.blocked(r, c)) {
          return -1
        } else {
          this.dir = Dir.U
          this.col = c
          this.row = r
          return 1
        }
      }

    }

    { // bottom of 3 (to 5)
      let left_lim = left_col_of(3)
      let right_lim = right_col_of(3)
      if (in_range(test_c, left_lim, right_lim) && test_r == bottom_row_of(3) + 1) {
        let c_from_left = test_c - left_lim
        let r = bottom_row_of(5) - c_from_left
        let c = left_col_of(5)
        if (this.blocked(r, c)) {
          return -1
        } else {
          this.dir = Dir.R
          this.col = c
          this.row = r
          return 1
        }
      }
    }

    { // bottom of 5 (to 2)
      let left_lim = left_col_of(5)
      let right_lim = right_col_of(5)
      if (in_range(test_c, left_lim, right_lim) && test_r == bottom_row_of(5) + 1) {
        let c_from_left = test_c - left_lim
        let r = bottom_row_of(2)
        let c = right_col_of(2) - c_from_left
        if (this.blocked(r, c)) {
          return -1
        } else {
          this.dir = Dir.U
          this.col = c
          this.row = r
          return 1
        }
      }
    }

    return 1
  }

  move_u() {
    // walk off the top
    if ( this.row - 1 < 0 ||
         this.col >= this.map[this.row - 1].length ||
         this.map[this.row - 1][this.col] == ' '
         ) {
      for (let i = this.map.length - 1; i > this.row; --i) {
        if (this.col >= this.map[i].length) {
          continue
        }
        if (this.map[i][this.col] == '#')
          return -1
        if (this.map[i][this.col] == '.') {
          this.row = i
          return 1
        }
      }
      console.log('interesting1')
      return 0
    }

    else if (this.map[this.row-1][this.col] == '#') {
      return -1
    }

    this.row-=1
    return 1
  }

  move_l() {
    let line = this.map[this.row]
    if (this.col - 1 < 0 || line[this.col - 1] == ' ') {
      for (let i = line.length - 1; i > this.col; --i) {
        if (line[i] == '#')
          return -1
        if (line[i] == '.') {
          this.col = i
          return 1
        }
      }
      console.log('interesting2')
      return 0
    }

    else if (line[this.col - 1] == '#') {
      return -1
    }

    this.col-=1
    return 1
  }

  move_r() {
    let line = this.map[this.row]
    if (this.col + 1 >= line.length || line[this.col + 1] == ' ') {
      for (let i = 0; i < this.col; ++i) {
        if (line[i] == '#')
          return -1
        if (line[i] == '.') {
          this.col = i
          return 1
        }
      }
      console.log('interesting3')
      return 0
    }

    if (line[this.col + 1] == '#') {
      return -1
    }

    this.col+=1
    return 1
  }

  turn(turn: Turn) {
    if (turn == 'R') {
      this.dir = (this.dir + 1) % 4
    } else {
      this.dir-=1
      if (this.dir < 0)
        this.dir = 3
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

{ // Test bottom 2
  p.row = bottom_row_of(2)
  p.col = left_col_of(2)
  p.dir = -1
  p.move_d()
  assert(p.row == bottom_row_of(5)
    && p.col == right_col_of(5)
    && p.dir == Dir.U, "bottom 2 not working")
}

{ // Test bottom 3
  p.row = bottom_row_of(3)
  p.col = left_col_of(3) + 1
  p.dir = -1
  p.move_d()
  assert(p.row == bottom_row_of(5) - 1
    && p.col == left_col_of(5)
    && p.dir == Dir.R, "bottom 3 not working")
}

{ // Test bottom 5
  p.row = bottom_row_of(5)
  p.col = left_col_of(5) + 1
  p.dir = -1
  p.move_d()
  assert(p.row == bottom_row_of(2)
    && p.col == right_col_of(2) - 1
    && p.dir == Dir.U, "bottom 5 not working")
}



// p.perform_moves()
//console.log((p.row + 1) * 1000 + (p.col + 1) * 4 + p.dir as Number)

/*
class Cube {
  front: string[][] = []
  back: string[][] = []
  up: string[][] = []
  right: string[][] = []
  down: string[][] = []
  left: string[][] = []
  row_start: number = -1
  col_start: number = -1
}

function splice_map(start_row: number, start_col: number) {
  let sz = testing ? 4 : 50

  let map: string[][] = []
  for (let i = start_row; i < start_row + sz; ++i) {
    map.push([])
    for (let j = start_col; j < start_col + sz; ++j) {
      map.at(-1)!.push(map_chars[i][j])
    }
  }

  return map
}
let front = new CubeFace()

front.curr = splice_map(4, 8)

console.log(front)
*/