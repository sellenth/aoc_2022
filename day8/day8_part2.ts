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

function scenic_score(input: string[], curr_i: number, curr_j: number) {

  let curr_tree = parseInt(input[curr_i][curr_j])

  let top_score = 0
  let bottom_score = 0
  let left_score = 0
  let right_score = 0

  // checking to top
  for (let i = curr_i - 1; i >= 0; --i){
    let tree_score = parseInt(input[i][curr_j])
    if (tree_score < curr_tree)
      top_score++
    else {
      top_score++
      break
    }
  }

    // checking to bottom
  for (let i = curr_i + 1; i < input.length; ++i){
    let tree_score = parseInt(input[i][curr_j])
    if (tree_score < curr_tree)
      bottom_score++
    else {
      bottom_score++
      break
    }
  }

    // checking to left
  for (let j = curr_j - 1; j >= 0; --j){
    let tree_score = parseInt(input[curr_i][j])
    if (tree_score < curr_tree)
      left_score++
    else {
      left_score++
      break
    }
  }

    // checking to right
  for (let j = curr_j + 1; j < input[0].length; ++j){
    let tree_score = parseInt(input[curr_i][j])
    if (tree_score < curr_tree)
      right_score++
    else {
      right_score++
      break
    }
  }

  if (curr_i == 3 && curr_j == 2) {
    console.log(top_score, bottom_score, left_score, right_score)
  }

  return top_score * bottom_score * left_score * right_score
}

for (let i = 0; i < vis_matrix.length; i++) {
  for (let j = 0; j < vis_matrix[i].length; j++) {
    vis_matrix[i][j] = scenic_score(split_input, i, j)
  }
}

console.log(vis_matrix)

let max_score = 0

for (let i = 0; i < vis_matrix.length; i++) {
  for (let j = 0; j < vis_matrix[i].length; j++) {
    if (vis_matrix[i][j] > max_score)
      max_score = vis_matrix[i][j]
  }
}

console.log("Ideal scenic score is: ", max_score)
