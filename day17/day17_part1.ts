import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true
let input = testing ? test_input : real_input;

let highest_rock = 0;
let rocks_placed = 0;

let chamber: string[][] = []

const CHAMBER_WIDTH = 7

function add_level() {
  chamber.push(new Array(CHAMBER_WIDTH).fill('.'))
}

class Coord {
  row: number
  col: number

  constructor(r: number, c: number) {
    this.row = r
    this.col = c
  }
}

class Piece {
  bottom_row: number
  left_col: number

  constructor() {
    this.left_col = 2
    this.bottom_row = highest_rock + 3

    if (this.bottom_row + 4 > chamber.length) {
      let initial_chamber_height = chamber.length
      for (let i = 0; i < this.bottom_row + 4 - initial_chamber_height; ++i){
        add_level()
      }
    }
  }

  get_indices(): Coord[] {
    console.log('parent function, this shouldnt be called')
    return []
  }

  move_horiz(amount: number) {
    let old_lc = this.left_col
    this.left_col += amount

    if (this.collides()) {
      this.left_col = old_lc
      return false
    }

    return true
  }

  move_down() {
    let old_br = this.bottom_row
    this.bottom_row--;

    if (this.collides()) {
      this.bottom_row = old_br
      return false
    }

    return true

  }

  collides() {
    let indices: Coord[] = this.get_indices()

    for (let i = 0; i < indices.length; ++i) {
      let p = indices[i];
      if (p.col < 0 || p.col >= CHAMBER_WIDTH) {
        //console.log('failing 1')
        return true
      }

      if (p.row < 0){
        //console.log('failing 2')
        return true
      }

      if (chamber[p.row][p.col] != '.'){
        //console.log('failing 3')
        return true
      }
    }
    return false
  }

  get_highest_rock() {
    console.log('this shouldnt be called')
    return -1
  }

  place_piece() {
    let indices = this.get_indices()
    indices.forEach( (p) => {
      chamber[p.row][p.col] = '#'
    })

    if (this.get_highest_rock() > highest_rock) {
      highest_rock = this.get_highest_rock()
    }

    rocks_placed++;
  }
}

class minus_piece extends Piece {
  get_indices() {
    let lc = this.left_col
    let br = this.bottom_row
    return [ new Coord(br, lc), new Coord(br, lc + 1), new Coord(br, lc + 2), new Coord(br, lc + 3)  ]
  }

  get_highest_rock() {
    return this.bottom_row + 1
  }
}

class plus_piece extends Piece {
  get_indices() {
    let lc = this.left_col
    let br = this.bottom_row
    return [             new Coord(br + 2, lc + 1),
  new Coord(br + 1, lc), new Coord(br + 1, lc + 1), new Coord(br + 1, lc + 2),
                         new Coord(br + 0, lc + 1)                        ]

  }

  get_highest_rock() {
    return this.bottom_row + 3
  }
}

class L_piece extends Piece {
  get_indices() {
    let lc = this.left_col
    let br = this.bottom_row
    return [                                              new Coord(br + 2, lc + 2),
                                                          new Coord(br + 1, lc + 2),
    new Coord(br + 0, lc + 0), new Coord(br + 0, lc + 1), new Coord(br + 0, lc + 2)    ]

  }

  get_highest_rock() {
    return this.bottom_row + 3
  }
}

class pipe_piece extends Piece {
  get_indices() {
    let lc = this.left_col
    let br = this.bottom_row
    return [  new Coord(br + 3, lc + 0),
              new Coord(br + 2, lc + 0),
              new Coord(br + 1, lc + 0),
              new Coord(br + 0, lc + 0)]

  }

  get_highest_rock() {
    return this.bottom_row + 4
  }
}

class square_piece extends Piece {
  get_indices() {
    let lc = this.left_col
    let br = this.bottom_row
    return [  new Coord(br + 1, lc + 0), new Coord(br + 1, lc + 1),
              new Coord(br + 0, lc + 0), new Coord(br + 0, lc + 1)]

  }

  get_highest_rock() {
    return this.bottom_row + 2
  }
}

function draw_chamber_slice(start: number, end: number) {
  for (let i = end - 1; i >= start; --i) {
    for (let j = 0; j < CHAMBER_WIDTH; ++j) {
      process.stdout.write(chamber[i][j])
    }
    console.log()
  }
}



let pieces = ['-', '+', 'L', '|', 'o']
let pieces_idx = 0
let jet_idx = 0

function next_piece() {
  if (++pieces_idx >= pieces.length)
    pieces_idx = 0

  switch (pieces[pieces_idx]) {
    case '-': return new minus_piece()
    case '+': return new plus_piece()
    case 'L': return new L_piece()
    case '|': return new pipe_piece()
    default: return new square_piece()
  }

}

let p = new minus_piece()

while (rocks_placed < 2022) {
  let move = input[jet_idx]
  if (++jet_idx >= input.length)
    jet_idx = 0

  if (move == '<')
    p.move_horiz(-1)
  else if (move == '>')
    p.move_horiz(1)

  if (p.move_down() == false) {
    p.place_piece()
    p = next_piece()
  }
}

console.log(highest_rock)
