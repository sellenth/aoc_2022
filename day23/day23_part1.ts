import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `..............
..............
.......#......
.....###.#....
...#...#.#....
....#...##....
...#.###......
...##.#.##....
....#..#......
..............
..............
..............`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let example = false
let input = example ? test_input : real_input;

enum Dir {
  N = 0,
  S = 1,
  W = 2,
  E = 3
}

function cycle_dir(d: Dir) {
  return (d + 1) % 4
}

let first_dir = Dir.N

class Elf {
  r: number
  c: number

  constructor(r: number, c: number) {
    this.r = r
    this.c = c
  }

  toHash() {
    return [this.r, this.c].join(',')
  }

}

let elves: Elf[] = []

input.split('\n').forEach( (line: string, row: number) => {
  line.split('').forEach( (char: string, col: number) => {
    if (char == '#') {
      elves.push( new Elf(row, col) )
    }
  })
})

let min_x = Number.MAX_SAFE_INTEGER
let min_y = Number.MAX_SAFE_INTEGER
let max_x = Number.MIN_SAFE_INTEGER
let max_y = Number.MIN_SAFE_INTEGER

function get_limits() {
  elves.forEach((elf) => {
    min_x = Math.min(min_x, elf.c)
    min_y = Math.min(min_y, elf.r)

    max_x = Math.max(max_x, elf.c)
    max_y = Math.max(max_y, elf.r)
  })
}

function draw_map() {
  for (let i = min_y; i <= max_y; ++i) {
    for (let j = min_x; j <= max_x; ++j) {
      if (elves.find( (e) => e.r == i && e.c == j )) {
        process.stdout.write('#')
      } else {
        process.stdout.write('.')
      }
    }
    console.log()
  }
}

function get_num_empty() {
  return (max_x - min_x + 1) * (max_y - min_y + 1) - elves.length
}

get_limits()
//draw_map()
console.log()

let proposals: Record<string, Elf[]> = {}

function first_half() {
  let locations: Record<string, number> = {}
  proposals = {}

  elves.forEach( (elf) => {
    locations[ [elf.r, elf.c].join(',') ] = 1
  } )

  let num_no_moves = 0

  elves.forEach( (elf) => {
    let r = elf.r
    let c = elf.c

    let NW = [r-1, c-1].join(',')
    let N = [r-1, c].join(',')
    let NE = [r-1, c+1].join(',')

    let W = [r, c-1].join(',')
    let E = [r, c+1].join(',')

    let SW = [r+1, c-1].join(',')
    let S = [r+1, c].join(',')
    let SE = [r+1, c+1].join(',')

    let west_neighbor  = NW in locations || W in locations || SW in locations
    let south_neighbor = SW in locations || S in locations || SE in locations
    let north_neighbor = NW in locations || N in locations || NE in locations
    let east_neighbor  = NE in locations || E in locations || SE in locations

    let no_neighbor = !(west_neighbor || south_neighbor || east_neighbor || north_neighbor)
    if (no_neighbor) {
      num_no_moves += 1
      return
    }


    let try_dir = first_dir
    for (let i = 0; i < 4; ++i) {
      switch (try_dir) {
          case Dir.N:
            if (!north_neighbor) {
              let hash = [elf.r - 1, elf.c].join(',')
              if (!(hash in proposals)) {
                proposals[hash] = [elf]
              } else {
                proposals[hash].push(elf)
              }
              i = 4
            }
          break
          case Dir.S:
            if (!south_neighbor) {
              let hash = [elf.r + 1, elf.c].join(',')
              if (!(hash in proposals)) {
                proposals[hash] = [elf]
              } else {
                proposals[hash].push(elf)
              }
              i = 4
            }
          break
          case Dir.W:
            if (!west_neighbor) {
              let hash = [elf.r, elf.c - 1].join(',')
              if (!(hash in proposals)) {
                proposals[hash] = [elf]
              } else {
                proposals[hash].push(elf)
              }
              i = 4
            }
          break
          case Dir.E:
            if (!east_neighbor) {
              let hash = [elf.r, elf.c + 1].join(',')
              if (!(hash in proposals)) {
                proposals[hash] = [elf]
              } else {
                proposals[hash].push(elf)
              }
              i = 4
            }
          break
          default:
           console.log('no move to propose')
      }

      try_dir = cycle_dir(try_dir)
    }

  })

  if (num_no_moves == elves.length)
    return true
  else
    return false
}

function second_half() {
  Object.keys(proposals).forEach( (k) => {
    if (proposals[k].length == 1) {
      let elf = proposals[k].pop()!
      let [r, c] = k.split(',')
      elf.r = parseInt(r)
      elf.c = parseInt(c)
    }
  })
}

function execute_round() {
  let res = first_half()
  if (res)
    return true
  second_half()
  first_dir = cycle_dir(first_dir)
  return false
}

for (let i = 0; i < 1000; ++i) {
  let res = execute_round()
  if (res){
    console.log(i + 1)
    break
  }
}

get_limits()
//draw_map()
console.log(get_num_empty())