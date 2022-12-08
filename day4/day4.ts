
let test_input = `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`


import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

// ✅ read file SYNCHRONOUSLY
function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./day4_input.txt');

function parse_input(input: string) {
    let elf_pairs = input.split('\n')
    let pairs = elf_pairs.map( (pair: string) => pair.split(',') )
    let intervals: number[][][] = [];

    pairs.forEach( (pair) => {
        console.log(pair)
        let interval1 = pair[0].split('-')
        let interval2 = pair[1].split('-')

        intervals.push( [ interval1.map( (val) => parseInt(val) ) ,
                        interval2.map( (val) => parseInt(val) ) ] )
    })
    return intervals
}

function find_overlap(sectionID_pair: number[][]) {
    let [first_int, second_int] = sectionID_pair;

    if (first_int[0] >= second_int[0] && first_int[0] <= second_int[1])
        return true
    if (second_int[0] >= first_int[0] && second_int[0] <= first_int[1])
        return true
}
let testing = false

let input = testing ? test_input : real_input

let sectionIDs_pairs = parse_input(input)

let overlaps = sectionIDs_pairs.filter( (section_pair) => {
    return find_overlap(section_pair)
})

console.log(overlaps.length)
