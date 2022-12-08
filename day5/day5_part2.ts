import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `    [D]
[N] [C]
[Z] [M] [P]
 1   2   3

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`


function extract_stack_diagram(input: string) {
    let diagram = input.split('\n\n')[0]
    let diagram_lines = diagram.split('\n')

    // last character of last line of stack diagram indicates
    // how many stacks we need
    let last_line = diagram_lines.pop()
    if (last_line == undefined)
        return
    let num_stacks = last_line[last_line.length -1]

    // allocate array of stacks with number of stacks retrieved
    // above
    let stacks: Array<Array<string>> = new Array()
    for (let i = 0 ; i < parseInt(num_stacks); i++) {
        stacks.push([])
    }

    // every fourth character (starting from character 1) will
    // represent an item on stack ( charIdx / 4 )
    diagram_lines.forEach( (line) => {
        for (let i = 1; i < line.length; i+=4) {
            if (line[i] != ' ') {
                stacks[Math.floor(i / 4)].push(line[i])
            }
        }
    } )

    return stacks
}

function extract_movements(input: string) {
    let raw_moves = input.split('\n\n')[1].split('\n')

    return raw_moves.map( (move) =>  {
        let pattern = /[0-9]+/g
        return move.match(pattern)
    })
}

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./day5_input.txt');

let testing = false
let input = testing ? test_input : real_input;
let stacks = extract_stack_diagram(input)

let movements = extract_movements(input)


function apply_movements(stacks: any, movements: any) {
    movements.forEach( (movement: string[]) => {
        let [num, from, to] = movement;

        let moved = stacks[parseInt(from) - 1].slice(0, num)
        let remaining = stacks[parseInt(from) - 1].slice(num)


        stacks[parseInt(to) - 1].unshift(...moved)
        stacks[parseInt(from) - 1] = remaining
    } )
}

apply_movements(stacks, movements)

if (stacks != undefined)
{
    let answer = stacks.map( stack => stack.shift() )

    answer.forEach( (char) => { if (char) { process.stdout.write(char) } } )
    console.log()

}
