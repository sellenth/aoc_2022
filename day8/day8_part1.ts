import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `30373
25512
65332
33549
35390`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

let split_input = input.split('\n')

function create_vis_matrix(lines: string[]) {
  let visibility_matrix: Array<Array<number>> = [];
  lines.forEach((line: string) => {
    visibility_matrix.push(new Array(line.length).fill(0))
  })

  return visibility_matrix
}

let vis_matrix = create_vis_matrix(split_input)

function tree_is_visible(input: string[], curr_i: number, curr_j: number) {

  let curr_tree = parseInt(input[curr_i][curr_j])

  let visible = false

  // checking from top
  for (let i = 0; i < curr_i; ++i){
    if (parseInt(input[i][curr_j]) < curr_tree )
        visible = true
    else {
      visible = false
      break
    }
  }
  if (visible)
    return true

    // checking from bottom
  for (let i = input.length - 1; i > curr_i; --i){
    if (parseInt(input[i][curr_j]) < curr_tree )
        visible = true
    else {
      visible = false
      break
    }
  }
  if (visible)
    return true

    // checking from left
  for (let j = 0; j < curr_j; ++j){
    if (parseInt(input[curr_i][j]) < curr_tree )
        visible = true
    else {
      visible = false
      break
    }
  }
  if (visible)
    return true

    // checking from right
  for (let j = input.length - 1; j > curr_j; --j){
    if (parseInt(input[curr_i][j]) < curr_tree )
        visible = true
    else {
      visible = false
      break
    }
  }
  if (visible)
    return true
}

for (let i = 0; i < vis_matrix.length; i++) {
  for (let j = 0; j < vis_matrix[i].length; j++) {
    if (j == 0 || i == 0
      || j == vis_matrix[i].length - 1
      || i == vis_matrix.length - 1)
      vis_matrix[i][j] = 1

    if (tree_is_visible(split_input, i, j))
      vis_matrix[i][j] = 1
  }
}

let num_vis_trees = 0;

for (let i = 0; i < vis_matrix.length; i++) {
  for (let j = 0; j < vis_matrix[i].length; j++) {
    if (vis_matrix[i][j] == 1)
      num_vis_trees++
  }
}

console.log("Number of visible trees = ", num_vis_trees)
