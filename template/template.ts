import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = ``

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true
let input = testing ? test_input : real_input;
