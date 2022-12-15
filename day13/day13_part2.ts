import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

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
    let [left, right] = pairs_raw[i].split('\n')
    output.push( parse_line(left), parse_line(right) )
  }
  return output
}

let packets = parse_input(input)
packets.push([[2]], [[6]])

type troolean = 1 | -1 | 0

function compare(left: any, right: any): troolean {
  let right_idx = 0
  for (let left_idx = 0; left_idx < left.length; ++left_idx, ++right_idx) {
    if (right_idx >= right.length) {
      console.log('right ran out of items')
      return -1
    }

    let l_is_arr = left[left_idx] instanceof Array
    let r_is_arr = right[right_idx] instanceof Array

    if (l_is_arr && r_is_arr) {
      let res = compare(left[left_idx], right[right_idx])
      if (res !== 0) {
        return res
      }
    }
    else if (!l_is_arr && r_is_arr) {
      let res = compare([left[left_idx]], right[right_idx])
      if (res !== 0) {
        return res
      }
    }
    else if (l_is_arr && !r_is_arr) {
      let res = compare(left[left_idx], [right[right_idx]])
      if (res !== 0) {
        return res
      }
    }
    else if (!l_is_arr && !r_is_arr) {
      if (left[left_idx] < right[right_idx]) {
        return 1
      } else if (left[left_idx] > right[right_idx]) {
        console.log('right is less than left')
        return -1
      }
    }
  }

  if (right_idx < right.length) {
    return 1
  }

  return 0
}


let sorted: any[] = packets.sort( (a: any, b: any) => {
  return compare(a, b)
} ).reverse()

let decoder_key = 1

for (let i = 0; i < sorted.length; ++i) {
  let item = JSON.stringify(sorted[i])

  if (item == '[[2]]' || item == '[[6]]')
    decoder_key *= (i + 1)
}

console.log(decoder_key)