import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

//let test_input = `Valve AA has flow rate=0; tunnels lead to valves BB
//Valve BB has flow rate=13; tunnels lead to valves CC, AA
//Valve CC has flow rate=2; tunnels lead to valves BB`

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
  name: string
  rate: number
  neighbors: string[]
  idx: number

  constructor(name: string, rate: number, neighbors: string[], idx: number)
  {
    this.name = name
    this.rate = rate
    this.neighbors = neighbors
    this.idx = idx
  }
}

let v_map: Record<string, Valve> = {}
let i_to_v_map: Record<string, Valve> = {}
let total_num_valves = 0
let num_worth_opening = 0

let valves = input.split('\n').forEach( (line, i) => {
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

  v_map[nameMatch] = new Valve(nameMatch, flowRate, tunnelValves, i)
  i_to_v_map[i] = v_map[nameMatch]
  total_num_valves++
  if (flowRate > 0) {
    num_worth_opening++
  }
} )

let shortest_distances: number[][] = new Array(Object.keys(v_map).length)
for (let i = 0; i < shortest_distances.length; ++i){
  shortest_distances[i] = new Array(Object.keys(v_map).length).fill(Number(-1))
}

class State {
  p_released = 0;
  opened: string[] = [];
  curr_valve: Valve;
  t_remain: number;
  num_worth_opening: number = 0;

  constructor(p: number, opened: string[], valve: Valve, time: number, n_worth_opening: number) {
    this.p_released = p
    this.opened = opened
    this.curr_valve = valve
    this.t_remain = time
    this.num_worth_opening = n_worth_opening
  }

  add_children(arr: State[]) {
    // add current valve as an option to open (only if it hasn't been opened before)
    if (this.curr_valve.rate > 0 && !this.opened.includes(this.curr_valve.name)) {
      let new_t = this.t_remain - 1

      arr.push(new State(
        this.p_released + new_t * this.curr_valve.rate,
        [...this.opened, this.curr_valve.name],
        this.curr_valve,
        new_t,
        this.num_worth_opening + 1
      ))
    }

    this.curr_valve.neighbors.forEach( (neighbor) => {
      let new_t = this.t_remain - 1

      arr.push(new State(
        this.p_released,
        [...this.opened],
        v_map[neighbor],
        new_t,
        this.num_worth_opening
      ))
    } )
  }
}

let root = new State(0, [], v_map['AA'], 30, 0)

let nodes: State[] = []
let curr_node: State | undefined = root
let limit = 100000

let best_release = 0

while (curr_node) {
  limit--
  //console.log(limit, nodes.length)
  //console.log(curr_node)
  //console.log('\n\n')

  if (curr_node.num_worth_opening == num_worth_opening) {
    if (curr_node.p_released > best_release) {
      best_release = curr_node.p_released
      console.log('opened all the valves with pressure release of ', curr_node.p_released)
    }
  }
  else if (curr_node.t_remain > 0) {
    curr_node.add_children(nodes)
  }
  else {
    if (curr_node.p_released > best_release) {
      best_release = curr_node.p_released
      console.log('reached end with pressure release of ', curr_node.p_released)
    }

  }

  curr_node = nodes.pop()
}

console.log(best_release)