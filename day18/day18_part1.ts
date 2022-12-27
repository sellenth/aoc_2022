import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

let x_min = Number.MAX_SAFE_INTEGER
let x_max = Number.MIN_SAFE_INTEGER
let y_min = Number.MAX_SAFE_INTEGER
let y_max = Number.MIN_SAFE_INTEGER
let z_min = Number.MAX_SAFE_INTEGER
let z_max = Number.MIN_SAFE_INTEGER

class Droplet {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y
    this.z = z
  }

  toHash() {
    return [this.x, this.y, this.z].join(',')
  }

  getNeighborHashes() {
    return [
      [this.x - 1, this.y    , this.z    ].join(','),
      [this.x + 1, this.y    , this.z    ].join(','),
      [this.x    , this.y - 1, this.z    ].join(','),
      [this.x    , this.y + 1, this.z    ].join(','),
      [this.x    , this.y    , this.z - 1].join(','),
      [this.x    , this.y    , this.z + 1].join(','),
    ]
  }

  getNumNeighbors() {
    let num = 0;
    this.getNeighborHashes().forEach( (hash) => {
      if (hash in droplets) {
        ++num
      }
    })

    return num
  }
}

let droplets: Record<string, Droplet> = {}

input.split('\n').forEach( (line) => {
  let [x, y, z] = line.split(',').map( x => parseInt(x) )
  let droplet = new Droplet(x, y, z)

  x_min = Math.min(x, x_min)
  x_max = Math.max(x, x_max)
  y_min = Math.min(y, y_min)
  y_max = Math.max(y, y_max)
  z_min = Math.min(z, z_min)
  z_max = Math.max(z, z_max)

  droplets[droplet.toHash()] = droplet
} )

let num_surfaces = 0;

--x_min
++x_max
--y_min
++y_max
--z_min
++z_max

let x_range = x_max - x_min
let y_range = y_max - y_min
let z_range = z_max - z_min

let space = new Array()
for (let i = 0; i < x_range; ++i) {
  let arr = new Array()
    for (let j = 0; j < y_range; ++j) {
      arr.push(new Array(z_range).fill('.'))
    }
  space.push(arr)
}

Object.values(droplets).forEach( (droplet) => {
  let x = droplet.x;
  let y = droplet.y;
  let z = droplet.z;
  let num_neighbors = droplet.getNumNeighbors()
  num_surfaces += 6 - num_neighbors;

  space[x][y][z] = 'x'
} )

function get_air_neighbor([x, y, z]: [number, number, number]) {
  let n: Array<[number, number, number]> = []
  if (x - 1 >= 0) {
    n.push([x - 1, y, z])
  }
  if (x + 1 < x_range) {
    n.push([x + 1, y, z])
  }
  if (y - 1 >= 0) {
    n.push([x, y - 1, z])
  }
  if (y + 1 < y_range) {
    n.push([x, y + 1, z])
  }
  if (z - 1 >= 0) {
    n.push([x, y, z - 1])
  }
  if (z + 1 < z_range) {
    n.push([x, y, z + 1])
  }

  return n
}

// change air around droplets to be 'a'
let stack: Array<[number, number, number]> = [ [0, 0, 0] ]
while (stack.length > 0) {
  let curr: [number, number, number] = stack.pop()!;
  let [x, y, z] = curr
  if (space[x][y][z] == '.') {
    space[x][y][z] = 'a'

    let neighbors = get_air_neighbor(curr)
    stack.push(...neighbors)
  }
}

let innerAir: Droplet[] = []
let num_inner_air_surfaces = 0
for (let i = 0; i < x_range; ++i)
  for (let j = 0; j < y_range; ++j)
    for (let k = 0; k < z_range; ++k){
      if (space[i][j][k] == '.')
        innerAir.push(new Droplet(i, j, k))
    }

innerAir.forEach( (inner) => {
  num_inner_air_surfaces += inner.getNumNeighbors()
} )

console.log(num_inner_air_surfaces)
console.log(num_surfaces)
console.log(num_surfaces - num_inner_air_surfaces)