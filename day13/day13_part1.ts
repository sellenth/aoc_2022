import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


//let test_input = `[9]
//[[8,7,6]]
//`

/*
 *
 */
let test_input = `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true
let input = testing ? test_input : real_input;

function parse_line(input: string) {
  let output = JSON.parse(input)
  return output
}

/*
 function parse_line(input: string) {
  let output: any = []
  let arr_stack = [output]
  for (let i = 1; i < input.length - 1; ++i) {
    let char = input[i]

    if (char == '['){
      arr_stack.push([])
    }
    else if (char == ']') {
      let last = arr_stack.pop()
      arr_stack[arr_stack.length - 1].push(last)
    }
    else if (char == ',') {
      continue
    }
    else {
      let next_comma = input.indexOf(',', i)
      let next_bracket = input.indexOf(']', i)
      let nearest = -1
      if (next_comma == -1)
        nearest = next_bracket
      else if (next_bracket == -1)
        nearest = next_comma
      else
        nearest = Math.min(next_comma, next_bracket)

      let num = parseInt(input.slice(i, nearest))
      arr_stack[arr_stack.length - 1].push(num)
      i = nearest - 1
    }
  }



  return output
}
*/

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

let parsed = parse_input(input)

function compare(pair: any) {
  let [left, right] = pair

  let left_idx = 0
  let right_idx = 0


  for (let left_idx = 0; left_idx < left.length; ++left_idx) {
    //console.log(right.length, right_idx)
    if (right_idx >= right.length)
    {
      console.log("Comparing")
      console.log(left)
      console.log(right)
      console.log('failing because right side ran out of items\n')
      return false
    }
    let l_val = left[left_idx]
    let r_val = right[right_idx]

    // comparing two numbers
    if (!(l_val instanceof Array) && !(r_val instanceof Array))
    {
      if (l_val < r_val) {
        return true
      }
      else if (l_val > r_val) {
        console.log("Comparing")
        console.log(left)
        console.log(right)
        console.log('failing because right side is less than left\n')
        return false
      }
    }

    // right is a list
    else if (!(l_val instanceof Array) && (r_val instanceof Array))
    {
      if (compare([[l_val], r_val]) === false)
        return false
    }

    // left is a list
    else if ((l_val instanceof Array) && !(r_val instanceof Array))
    {
      if (compare([l_val, [r_val]]) === false)
        return false
    }

    // both are lists
    else {
      if (compare([l_val, r_val]) === false)
        return false
    }

    right_idx++

  }
  return true
}

let pairs_in_order = []

for (let i = 0; i < parsed.length; ++i) {
  let pair = parsed[i]
  let in_order = compare(pair)
  if (in_order)
    pairs_in_order.push(i + 1)
}

console.log(pairs_in_order)
console.log(pairs_in_order.reduce( (sum, curr) => sum + curr, 0 ))
