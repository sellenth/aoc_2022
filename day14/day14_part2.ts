import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

let rocks_raw = input.split('\n').map( (rock) => rock.split(' -> ') )

let rocks: number[][][] = rocks_raw.map( (rock) => rock.map( (segment) => segment.split(',').map( (num) => parseInt(num) )) )

let cave: string[][] = []
let cave_depth = 200
let deepest_rock = -1
for (let i = 0 ; i < cave_depth; ++i) {
  cave.push(new Array(1000).fill('.'))
}

function print_cave() {
  for (let i = 0; i < cave_depth; ++i) {
    console.log(cave[i].join(''))
  }
}

let col_offset = 0

function add_rocks_to_cave() {
  for (let i = 0; i < rocks.length; ++i) {
    let rock_descriptor = rocks[i]
    for (let j = 0; j < rock_descriptor.length - 1; ++j) {
      let rock = rock_descriptor[j].map((x) => x)
      let next_rock = rock_descriptor[j+1].map((x) => x)

      if (rock[1] > deepest_rock)
        deepest_rock = rock[1]
      rock[0] -= col_offset
      next_rock[0] -= col_offset

      // vertical rock
      if (rock[0] == next_rock[0]) {
        if (next_rock[1] < rock[1]){
          let tmp = rock
          rock = next_rock
          next_rock = tmp
        }
        for (let x = rock[1]; x <= next_rock[1]; ++x) {
          cave[x][rock[0]] = '#'
        }
      } else {
        if (next_rock[0] < rock[0]){
          let tmp = rock
          rock = next_rock
          next_rock = tmp
        }
        for (let x = rock[0]; x <= next_rock[0]; ++x) {
          cave[rock[1]][x] = '#'
        }

      }

    }
  }
}

function add_floor_to_cave() {
  for (let r_col = 0; r_col < cave[0].length; ++r_col)
  {
    cave[deepest_rock + 2][r_col] = '#'
  }
}

add_rocks_to_cave()
add_floor_to_cave()

function simulate_one_sand() {
  let s_col = 500 - col_offset
  let s_row = -1

  while (true) {
    // goes down one unit
    if (cave[s_row + 1][s_col] == '.') {
      s_row++
    }

    // goes down and to the left
    else if (s_col - 1 < 0) {
      console.log('abyss 2')
      return -1
    }
    else if (cave[s_row + 1][s_col - 1] == '.') {
      s_col--
      s_row++
    }

    // goes down and to the right
    else if (s_col + 1 >= cave[0].length) {
      console.log('abyss 3')
      return -1
    }
    else if (cave[s_row + 1][s_col + 1] == '.') {
      s_col++
      s_row++
    }
    else {
      if (s_row == 0 ) {
        return -1
      }
      cave[s_row][s_col] = 'o'
      return 0
    }

  }
}

let iters = 0
while (simulate_one_sand() != -1) {
  iters++
}

print_cave()
console.log(iters + 1)
