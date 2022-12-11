import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop
`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

type Instruction = "noop" | "addx"

class Command {
  type: Instruction
  amount: number = 0

  constructor(type: Instruction, amount = 0) {
    this.type = type
    this.amount = amount
  }
}

function parse_input(input: string) {
  let lines = input.split('\n')
  let instructions: Array<Command> = []
  lines.forEach( (line) => {
    if (line == "noop")
    {
      instructions.push(new Command("noop"))
    } else {
      let [_, amount] = line.split(' ')
      instructions.push(new Command("addx", parseInt(amount)))
    }
  } )

  return instructions
}

let instructions = parse_input(input)

let x_reg = 1
let cycles_to_next_command = 0
let instruction = instructions.shift()
if (instruction && instruction.type == "addx")
  cycles_to_next_command = 1
let signal_sum = 0

let CRT_pixel = 0

for (let pc = 1; instruction; ++pc)
{
  if (pc == 20 || ( (pc - 20) % 40 == 0))
  {
    //console.log(`At cycle ${pc}, x-register = ${x_reg}`)
    //console.log(pc * x_reg)
    signal_sum += pc * x_reg;
  }

  // draw CRT pixel

  if (CRT_pixel >= x_reg - 1 && CRT_pixel <= x_reg + 1)
    process.stdout.write("#");
  else
    process.stdout.write(".");

  CRT_pixel++

  if (pc % 40 == 0) {
    CRT_pixel = 0
    console.log()
  }


  if (cycles_to_next_command == 0){
    if (instruction.type == "addx")
    {
     // console.log(`(${pc}) Adding ${instruction.amount}`)
      x_reg += instruction.amount
    }
    //else
      //console.log(`(${pc}) noop `)

    instruction = instructions.shift()

    if (instruction)
    {
      if (instruction.type == "noop")
        cycles_to_next_command = 1
      else if (instruction.type == "addx") {
        cycles_to_next_command = 2
      }

    }
  }

  cycles_to_next_command -= 1

}

console.log(signal_sum)
