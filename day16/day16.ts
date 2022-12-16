import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


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

let testing = true
let input = testing ? test_input : real_input;

class Valve {
  rate: number
  neighbors: string[]

  constructor(rate: number, neighbors: string[])
  {
    this.rate = rate
    this.neighbors = neighbors
  }
}

let v_map: Record<string, Valve> = {}
let total_num_valves = 0

let valves = input.split('\n').forEach( (line) => {
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

  v_map[nameMatch] = new Valve(flowRate, tunnelValves)
  total_num_valves++
} )


function calc_pressure_release(curr_valve: string, opened: string[], time_left: number, pressure_released: number) {
  if (time_left == 0 || opened.length == total_num_valves) {
    return pressure_released
  }

  let best_outcome = -1

  v_map[curr_valve].neighbors.forEach( (neighbor) => {
    best_outcome = Math.max( best_outcome,
                              calc_pressure_release(neighbor, opened, time_left - 1, pressure_released)
                           )

    if (!opened.includes(curr_valve)) {
      let pressure_released_if_opened = pressure_released + v_map[curr_valve].rate * (time_left - 1)
      let new_opened = opened.map((x) => x)
      new_opened.push(curr_valve)
      best_outcome = Math.max( best_outcome,
                               calc_pressure_release(neighbor, new_opened, time_left - 2, pressure_released_if_opened)
                             )
    }


  } )

  return best_outcome
}

let res = calc_pressure_release('AA', [], 30, 0)
console.log(res)
