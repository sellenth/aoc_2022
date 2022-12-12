import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true
let input = testing ? test_input : real_input;

class Monkey {
  num_inspected: bigint = BigInt(0)
  starting_items: bigint[] = []
  operation: (old: bigint) => bigint = (_) => BigInt(0)
  test: (worry: bigint) => boolean = (_) => true
  if_true: number = 0
  if_false: number = 0
}

function parse_input(input: string) {
  let chunks = input.split('\n\n')
  return chunks.map( (chunk: string) => parse_monkey_info(chunk) )
}

let monkeys = parse_input(input)

let common_product = 1

function parse_monkey_info(monkey_chunk: string) {
  // Use a regular expression to match the starting items
  const startingItemsRegex = /Starting items: (\d+(, \d+)*)/;
  const startingItemsMatch = monkey_chunk.match(startingItemsRegex);
  const startingItems = startingItemsMatch ? startingItemsMatch[1] : null;

  // Use a regular expression to match the operation
  const operationRegex = /Operation: new = (.*)/;
  const operationMatch = monkey_chunk.match(operationRegex);
  const operation = operationMatch ? operationMatch[1] : null;

  // Use a regular expression to match the test
  const testRegex = /Test: divisible by (.*)/;
  const testMatch = monkey_chunk.match(testRegex);
  const test = testMatch ? testMatch[1] : null;

  // Use a regular expression to match the 'If true' and 'If false' text
  const ifTrueRegex = /If true: throw to monkey (\d+)/;
  const ifFalseRegex = /If false: throw to monkey (\d+)/;
  const ifTrueMatch = monkey_chunk.match(ifTrueRegex);
  const ifFalseMatch = monkey_chunk.match(ifFalseRegex);
  const ifTrue = ifTrueMatch ? ifTrueMatch[1] : null;
  const ifFalse = ifFalseMatch ? ifFalseMatch[1] : null;

  let monkey = new Monkey()
  monkey.starting_items = startingItems ?
        startingItems.split(', ').map( (item: string) => BigInt(item) ) :
        []
  if (operation) {
    let tokens = operation.split(' ')
    let other_term = tokens[2] == 'old' ? BigInt(0) : BigInt(tokens[2])
    switch (tokens[1]) {
          case '+':
            monkey.operation = (old: bigint) => {
              if (tokens[2] == 'old')
                return old + old
              else
                return old + other_term
            }
            break
          case '*':
            monkey.operation = (old: bigint) => {
              if (tokens[2] == 'old')
                return old * old
              else
                return old * other_term
            }
            break
          case '/':
            monkey.operation = (old: bigint) => {
              if (tokens[2] == 'old')
                return old / old
              else
                return old / other_term
            }
            break
          default:
            monkey.operation = (old: bigint) => {
              if (tokens[2] == 'old')
                return old - old
              else
                return old - other_term
            }
            break
      }
    }

  monkey.test = (input: bigint) => {
    return input % BigInt(test ? test : "1") === BigInt(0)
  }

  common_product *= test ? parseInt(test) : 1

  monkey.if_true = parseInt(ifTrue ? ifTrue : "1")
  monkey.if_false = parseInt(ifFalse ? ifFalse : "1")

  return monkey
}

function do_monkey_turn(monkey: Monkey, monkeys: Monkey[]) {
  while (monkey.starting_items.length > 0) {
    monkey.num_inspected++
    let item_worry = monkey.starting_items.shift()
    if (item_worry) {
      let calculated_worry = monkey.operation(item_worry) % common_product
      if (monkey.test(calculated_worry)){
        monkeys[monkey.if_true].starting_items.push(calculated_worry)
      } else {
        monkeys[monkey.if_false].starting_items.push(calculated_worry)
      }

    }
  }
}

for (let rounds = 0; rounds < 1000; rounds++)
{
  if (rounds % 100 == 0) {
    console.log(`Finished round ${rounds}`)
  }
  monkeys.forEach( (monkey: Monkey) => {
    do_monkey_turn(monkey, monkeys)
  } )
}

monkeys.forEach( (monkey: Monkey) => {
  console.log(monkey.num_inspected)
} )

//let two_most_active_monkeys = monkeys.sort((a, b) => a.num_inspected - b.num_inspected)
//                                    .slice(-2)

//console.log(two_most_active_monkeys.map( (monkey: Monkey) => monkey.num_inspected )
//                                   .reduce( (product, curr) => product * curr, 1 ))
