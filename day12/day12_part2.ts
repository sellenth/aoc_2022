import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

class HillClimb {
  map: Cell[][] = []
  start_row = -1
  start_col = -1
  end_row = -1
  end_col = -1
  best_path = -1


  get_all_surrounding_cells(i: number, j: number) {
    let cells = []

    if (i - 1 >= 0)
      cells.push(this.map[i-1][j])
    if (i + 1 < this.map.length)
      cells.push(this.map[i+1][j])

    if (j - 1 >= 0)
      cells.push(this.map[i][j-1])
    if (j + 1 < this.map[i].length)
      cells.push(this.map[i][j+1])

    return cells
  }

  display_map() {
    for (let i = 0; i < this.map.length; ++i) {
      for (let j = 0; j < this.map[i].length; ++j) {
        process.stdout.write(this.map[i][j].elevation);
      }
      console.log()
    }
  }

  get_valid_neighbors(i: number, j: number) {
    let cells = this.get_all_surrounding_cells(i, j)
    let curr_cell = this.map[i][j]

    return cells.filter( (cell) => {
      return (cell.is_reachable_from(curr_cell.elevation))
    } )
  }

  traverse_map() {
    let neighbors = this.get_valid_neighbors(this.start_row, this.start_col)

    let curr_cell: Cell | undefined = neighbors.pop()
    if (!curr_cell)
      return
    curr_cell.shortest_path = 1

    while(neighbors.length) {
      let new_neighbors =
        this.get_valid_neighbors(curr_cell.row, curr_cell.col)
          .filter( (n) => {
            if (curr_cell
              && (curr_cell.shortest_path + 1 < n.shortest_path
                || n.shortest_path == -1)) {
              n.shortest_path = curr_cell.shortest_path + 1
              return true
            } else {
              return false
            }
          } )
      neighbors.push(...new_neighbors)
      curr_cell = neighbors.pop()
      if (!curr_cell)
        return
    }

    if (this.best_path == -1
      || this.map[this.end_row][this.end_col].shortest_path < this.best_path)
    console.log("The shortest path to the end is:",
                this.map[this.end_row][this.end_col].shortest_path)
  }

}
let hc = new HillClimb()

let input_lines = input.split('\n')

class Cell {
  elevation: string
  shortest_path: number = -1
  row: number
  col: number

  constructor(el: string, row: number, col: number) {
    this.elevation = el
    this.row = row
    this.col = col
  }

  is_one_higher(el: string) {
    return (el.charCodeAt(0) - this.elevation.charCodeAt(0) == 1)
  }

  is_reachable_from(el: string) {
    return el.charCodeAt(0) - this.elevation.charCodeAt(0) >= -1
      || el == 'S'
  }
}

let starting_points = []

for (let i = 0; i < input_lines.length; ++i) {
  hc.map.push([])
  for (let j = 0; j < input_lines[i].length; ++j) {
    let char = input_lines[i][j]
    if (char == 'S') {
      starting_points.push([i, j])
      hc.map[i].push(new Cell('a', i, j))
      continue
    }
    else if (char == 'E') {
      hc.end_row = i
      hc.end_col = j
      hc.map[i].push(new Cell('z', i, j))
      continue
    } else {
      if (char == 'a')
        starting_points.push([i, j])
      hc.map[i].push(new Cell(char, i, j))
    }

  }
}

hc.display_map()

for (let i = 0; i < starting_points.length; ++i) {
  let point = starting_points[i]
  if (point)
  {
    hc.start_row = point[0]
    hc.start_col = point[1]
    hc.traverse_map()
  }
}
