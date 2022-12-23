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
} )

let shortest_distances: number[][] = new Array(Object.keys(v_map).length)
for (let i = 0; i < shortest_distances.length; ++i){
  shortest_distances[i] = new Array(Object.keys(v_map).length).fill(Number(-1))
}

Object.values(v_map).forEach( (valve) => {
  let i = valve.idx

  valve.neighbors.forEach( (neighbor_name) => {
    let neighbor_idx = v_map[neighbor_name].idx
    shortest_distances[i][neighbor_idx] = 1
  } )
  shortest_distances[i][i] = 0
} )

for (let i = 0; i < total_num_valves; ++i) {
  for (let j = 0; j < total_num_valves; ++j) {
    if (j == i) continue

    let d_src_to_other = shortest_distances[i][j]
    if (d_src_to_other != -1) {
      for (let k = 0; k < total_num_valves; ++k){
        if (k == i) continue
        let d_other_to_other = shortest_distances[j][k]
        if (d_other_to_other > 0 && (d_other_to_other + d_src_to_other < shortest_distances[i][k] || shortest_distances[i][k] == -1)) {
          shortest_distances[i][k] = d_other_to_other + d_src_to_other
        }
      }
    }
  }
}

process.stdout.write('\t')
for (let i = 0; i < shortest_distances.length; ++i){
  process.stdout.write(`\t${Object.keys(v_map)[i]}`)
}
process.stdout.write('\n')

for (let i = 0; i < shortest_distances.length; ++i){
  process.stdout.write(`\t${Object.keys(v_map)[i]}`)
  for (let j = 0; j < shortest_distances.length; ++j){
    process.stdout.write(`\t${shortest_distances[i][j]}`)
  }
  process.stdout.write('\n')
}

let curr = v_map['AA']
let opened_idxs: number[] = []
let t_remain = 30
let pressure_released = 0

while (t_remain > 0 && opened_idxs.length != total_num_valves) {
  let p_release_opening_others = new Array(total_num_valves).fill(0)
  for (let i = 0; i < total_num_valves; ++i) {
    let time_to_get_to_other = shortest_distances[curr.idx][i]
    if (!opened_idxs.includes(i)) {
      p_release_opening_others[i] = i_to_v_map[i].rate * (t_remain - time_to_get_to_other - 1)
    }
  }

  let max_p = 0;
  let max_p_idx = -1
  for (let i = 0; i < total_num_valves; ++i) {
    if (p_release_opening_others[i] > max_p) {
      max_p = p_release_opening_others[i]

      max_p_idx = i
    }
  }

  console.log(max_p)
  console.log(i_to_v_map[max_p_idx])

  if (max_p_idx == -1)
    break
  else if (max_p_idx == curr.idx) {
    opened_idxs.push(max_p_idx)
    t_remain--;
  }

  break
  //else {
  //  curr = neighbor_in_shortest_path_to(i_to_v_map[max_p_idx])
  //}

  t_remain--
}