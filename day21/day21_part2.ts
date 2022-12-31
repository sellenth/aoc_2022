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
type op = '+' | '-' | '*' | '/' | '='
type DoubleMonkey = [string, op, string]
type Monkey = number | DoubleMonkey

let real_input = syncReadFile('./input.txt');

let testing = true
let input = testing ? test_input : real_input;

let monkeys: Record<string, Monkey> = {}

input.split('\n').map( (line) => {
  let [name, other] = line.split(': ')!

  let other_split = other.split(' ')
  if (name == 'root') {
    monkeys[name] = [other_split[0], '=', other_split[2]] as DoubleMonkey
  }
  else if (name == 'humn') {
    monkeys[name] = 0
  }
  else if (other_split.length > 1) {
    monkeys[name] = other_split as DoubleMonkey
  } else {
    monkeys[name] = parseInt(other)
  }
} )


function solve(monkey: Monkey): number {
  if (typeof monkey === 'number')
    return monkey

  if (monkey[1] == '=') {
    return solve(monkeys[monkey[0]]) - solve(monkeys[monkey[2]])
  } else
    return eval([solve(monkeys[monkey[0]]), monkey[1], solve(monkeys[monkey[2]])].join(' '))
}

monkeys['humn'] = 0
let humn_zero = solve(monkeys['root'])
monkeys['humn'] = 1_000_000_000_0000
let humn_hundred = solve(monkeys['root'])

console.log(humn_zero)
console.log(humn_hundred)

let dt = (humn_hundred - humn_zero) / 1_000_000_000_0000

console.log(humn_zero / dt * -1)