import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import { isNumber } from 'util';


let test_input = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}
type op = '+' | '-' | '*' | '/'
type DoubleMonkey = [string, op, string]
type LMonkey = [number, op, string]
type RMonkey = [string, op, number]
type Monkey = number | DoubleMonkey | LMonkey | RMonkey

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

let monkeys: Record<string, Monkey> = {}

input.split('\n').map( (line) => {
  let [name, other] = line.split(': ')!

  let other_split = other.split(' ')
  if (other_split.length > 1) {
    monkeys[name] = other_split as DoubleMonkey
  } else {
    monkeys[name] = parseInt(other)
  }
} )


function solve(monkey: Monkey): number {
  if (typeof monkey === 'number')
    return monkey
  return eval([solve(monkeys[monkey[0]]), monkey[1], solve(monkeys[monkey[2]])].join(''))
}

console.log(solve(monkeys['root']))