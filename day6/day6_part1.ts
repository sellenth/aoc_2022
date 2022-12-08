import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input: string = testing ? test_input : real_input;

let chars: Record<string, number> = {};
let begin_ptr = 0
for (let i = 0; i < input.length; i++) {
  if (input[i] in chars) {
    chars[input[i]] += 1
  } else {
    chars[input[i]] = 1
  }

  if (i > 13) {
    let window_start = input[begin_ptr]
    chars[window_start]--;
    if (chars[window_start] == 0)
      delete chars[window_start]
    begin_ptr++;
  }

  if (Object.keys(chars).length >= 14) {
    console.log("Packet start at: ", i + 1)
    break;
  }

}
