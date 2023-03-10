import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


//let test_input = `[9]
//[[8,7,6]]
//`

/*
 *
 */
let test_input = `[1,1,3,1,1]
[1,1,3,1,1]`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

function parse_line(input: string) {
  let output = JSON.parse(input)
  return output
}

function parse_input(input: string) {
  let output: any = []
  let pairs_raw = input.split('\n\n')
  for (let i = 0; i < pairs_raw.length; ++i) {
  //for (let i = 6; i < 7; ++i) {
    let [left, right] = pairs_raw[i].split('\n')
    output.push( [parse_line(left), parse_line(right) ] )
  }
  return output
}

let pairs = parse_input(input)

type troolean = true | false | "neither"

function compare(left: any, right: any): troolean {
  let right_idx = 0
  for (let left_idx = 0; left_idx < left.length; ++left_idx, ++right_idx) {
    if (right_idx >= right.length) {
      console.log('right ran out of items')
      return false
    }

    let l_is_arr = left[left_idx] instanceof Array
    let r_is_arr = right[right_idx] instanceof Array

    if (l_is_arr && r_is_arr) {
      let res = compare(left[left_idx], right[right_idx])
      if (res !== 'neither') {
        return res
      }
    }
    else if (!l_is_arr && r_is_arr) {
      let res = compare([left[left_idx]], right[right_idx])
      if (res !== 'neither') {
        return res
      }
    }
    else if (l_is_arr && !r_is_arr) {
      let res = compare(left[left_idx], [right[right_idx]])
      if (res !== 'neither') {
        return res
      }
    }
    else if (!l_is_arr && !r_is_arr) {
      if (left[left_idx] < right[right_idx]) {
        return true
      } else if (left[left_idx] > right[right_idx]) {
        console.log(left[left_idx], right[right_idx])
        console.log('right is less than left')
        return false
      }
    }
  }

  if (right_idx < right.length) {
    return true
  }

  return "neither"
}

let pairs_in_order: number[] = []

for (let i = 0; i < pairs.length; ++i)
{
  let [left, right] = pairs[i]
  if ([true, "neither"].includes(compare(left, right)) ) {
  //if (compare(left, right) == true ) {
    pairs_in_order.push(i + 1)
  }
}


console.log(pairs_in_order)
console.log(pairs_in_order.reduce( (sum, curr) => sum + curr, 0 ))
