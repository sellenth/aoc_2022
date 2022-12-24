import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

//let test_input = `Valve AA has flow rate=0; tunnels lead to valves BB
//Valve BB has flow rate=1; tunnels lead to valves AA`

let test_input = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

class Valve {
  name: string
  rate: number
  neighbors: string[]

  constructor(name: string, rate: number, neighbors: string[])
  {
    this.name = name
    this.rate = rate
    this.neighbors = neighbors
  }
}

let str_to_idx: Record<string, number> = {}

let valves: Valve[] = []
let num_worth_opening = 0

input.split('\n').forEach( (line) => {
  // Extract the valve name and flow rate
  let [first, second] = line.split(';')

  const valveRegex = /Valve (\w+) has flow rate=(\d+)/;
  const valveMatch = first.match(valveRegex);
  const nameMatch = valveMatch![1];
  const flowRate = parseInt(valveMatch![2], 10);

  // Extract the valves that the tunnel leads to
  const tunnelRegex = /[A-Z]./g;
  const tunnelMatch = second.match(tunnelRegex);
  const tunnelValves = tunnelMatch!

  valves.push(new Valve(nameMatch, flowRate, tunnelValves))
  if (flowRate > 0) {
    num_worth_opening++
  }
} )

valves = valves.sort( (a, b) => b.rate - a.rate )
valves.forEach( (valve, i) => {
  str_to_idx[valve.name] = i
})

let DP_table: number[] = new Array( num_worth_opening * valves.length * 31 ).fill(-1)

function solve(curr_valve_idx: number, opened: number, time: number) {
  if (time == 0)
    return 0

  let key = (opened * valves.length * 31) +
            (curr_valve_idx * 31) +
            (time)

  let state_lookup = DP_table[key]
  if (state_lookup > -1)
    return state_lookup

  let ans = 0

  let already_opened = ((1 << curr_valve_idx) & opened)
  let curr_valve = valves[curr_valve_idx]
  let curr_rate = curr_valve.rate
  if (!already_opened && curr_rate > 0) {
    ans = Math.max(ans, (time - 1) * curr_rate + solve(curr_valve_idx,
                              opened + (1 << curr_valve_idx),
                              time - 1,
                              ))
  }

  if (curr_valve.neighbors.length) {
    curr_valve.neighbors.forEach( (neighbor) => {
      ans = Math.max(ans, solve( str_to_idx[neighbor],
                                 opened,
                                 time - 1,
                                 ))
    })
  }

  DP_table[key] = ans;

  return ans;
}

console.log(solve(str_to_idx['AA'], 0, 30 ))