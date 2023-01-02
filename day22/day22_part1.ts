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

let testing = false
let input = testing ? test_input : real_input;

let [map_part, moves_list] = input.split('\n\n')

let map = map_part.split('\n').map( (line) => line.split('') )

function display_map() {
  for (let i = 0; i < map.length; ++i) {
    for (let j = 0; j < map[i].length; ++j) {
      process.stdout.write(map[i][j])
    }
    console.log()
  }
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

  move_d() {
    if ( this.row + 1 >= this.map.length ||
         this.col >= this.map[this.row + 1].length ||
         this.map[this.row + 1][this.col] == ' '
         ) {
      for (let i = 0; i < this.row; ++i) {
        if (this.col >= this.map[i].length)
          continue
        if (this.map[i][this.col] == '#')
          return -1
        if (this.map[i][this.col] == '.') {
          this.row = i
          return 1
        }
      }
      console.log('interesting4')
      process.exit()
      return 0
    }

    else if (this.map[this.row+1][this.col] == '#') {
      return -1
    }

    this.row+=1
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

let p = new Player(map)
p.perform_moves()
console.log((p.row + 1) * 1000 + (p.col + 1) * 4 + p.dir as Number)