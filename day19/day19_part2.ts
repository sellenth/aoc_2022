import { readFileSync } from 'fs';
import { join } from 'path';


let test_input = `Blueprint 1:  Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
Blueprint 3: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

type ore = number
type clay = number
type obsidian = number //[ore, clay]
type geode = number//[ore, obsidian]

class Blueprint {
  ore_r: ore
  clay_r: ore
  obsidian_r: [ore, clay]
  geode_r: [ore, obsidian]
  max_needed_ore_bots: number
  max_needed_clay_bots: number
  max_needed_obs_bots: number
  geode_best_for_this_blueprint: number = -1

  constructor( a: number, b: number, c: number, d: number, e: number, f: number) {
    this.ore_r = a
    this.clay_r = b
    this.obsidian_r = [c, d]
    this.geode_r = [e, f]


    this.max_needed_ore_bots = Math.max(this.ore_r, this.clay_r, this.obsidian_r[0], this.geode_r[0])
    this.max_needed_clay_bots = Math.max(this.obsidian_r[1])
    this.max_needed_obs_bots = Math.max(this.geode_r[1])

  }
}

let blueprints: Blueprint[]= []
let reg = /([0-9]+)/g

input.split('\n').forEach( (line: string) => {
  let res: number[] = line.match(reg)!.map( x => parseInt(x!) )

  blueprints.push( new Blueprint(res [1], res [2], res [3], res [4], res [5], res [6]) )
})

function find_max_geodes_DFS(b: Blueprint) {
  let runtime = 32

  let best = -1;

  let states = [{time_left: runtime,
                 ore: 0,
                 clay: 0,
                 obsidian: 0,
                 geode: 0,

                 ore_bots: 1,
                 clay_bots: 0,
                 obs_bots: 0,
                 geode_bots: 0}]


  while (states.length > 0) {
    let curr = states.pop()!
    // If we're out of time, check if we've created a new max
    if (curr.time_left <= 0) {
      if (curr.time_left == 0 && curr.geode > best) {
        console.log(`found new max with ${curr.geode_bots} geode bots`)
        best = curr.geode
      }
      continue
    }

    // Optimistically assume we can create a new geode bot every turn
    // if that still yields fewer bots than our best, don't consider this state
    let n = curr.time_left
    if (curr.geode + curr.geode_bots + (n ** 3) < best) {
      continue
    }

    // Create a geode bot
    if (curr.obs_bots > 0)
    {
      let time_til_bot = 0;
      if ( curr.ore >= b.geode_r[0] && curr.obsidian >= b.geode_r[1] ) {
        time_til_bot = 1
      } else if (curr.ore >= b.geode_r[0]) {
        time_til_bot = Math.ceil((b.geode_r[1] - curr.obsidian) / curr.obs_bots) + 1
      } else if (curr.obsidian >= b.geode_r[1]) {
        time_til_bot = Math.ceil((b.geode_r[0] - curr.ore) / curr.ore_bots) + 1
      } else {
        time_til_bot = Math.max(Math.ceil((b.geode_r[1] - curr.obsidian) / curr.obs_bots) + 1,
                                Math.ceil((b.geode_r[0] - curr.ore) / curr.ore_bots) + 1
        )
      }

      states.push({time_left: curr.time_left - time_til_bot,
                   ore: curr.ore + (curr.ore_bots * time_til_bot) - b.geode_r[0],
                   clay: curr.clay + (curr.clay_bots * time_til_bot),
                   obsidian: curr.obsidian + (curr.obs_bots * time_til_bot) - b.geode_r[1],
                   geode: curr.geode + (curr.geode_bots * time_til_bot),

                   ore_bots: curr.ore_bots,
                   clay_bots: curr.clay_bots,
                   obs_bots: curr.obs_bots,
                   geode_bots: curr.geode_bots + 1
                   })
    }

    // Create an obsidian bot
    if (curr.clay_bots > 0)
    {
        //continue

      let time_til_bot = 0;
      if ( curr.ore >= b.obsidian_r[0] && curr.clay >= b.obsidian_r[1] ) {
        time_til_bot = 1
      } else if (curr.ore >= b.obsidian_r[0]) {
        time_til_bot = Math.ceil((b.obsidian_r[1] - curr.clay) / curr.clay_bots) + 1
      } else if (curr.clay >= b.obsidian_r[1]){
        time_til_bot = Math.ceil((b.obsidian_r[0] - curr.ore) / curr.ore_bots) + 1
      } else {
        time_til_bot = Math.max(
          Math.ceil((b.obsidian_r[1] - curr.clay) / curr.clay_bots) + 1,
          Math.ceil((b.obsidian_r[0] - curr.ore) / curr.ore_bots) + 1
        )
      }

      states.push({time_left: curr.time_left - time_til_bot,
                   ore: curr.ore + (curr.ore_bots * time_til_bot) - b.obsidian_r[0],
                   clay: curr.clay + (curr.clay_bots * time_til_bot) - b.obsidian_r[1],
                   obsidian: curr.obsidian + (curr.obs_bots * time_til_bot),
                   geode: curr.geode + (curr.geode_bots * time_til_bot),

                   ore_bots: curr.ore_bots,
                   clay_bots: curr.clay_bots,
                   obs_bots: curr.obs_bots + 1,
                   geode_bots: curr.geode_bots
                   })
    }

    // Create a clay bot
    {

      let time_til_bot = curr.ore >= b.clay_r ? 1
        : Math.ceil((b.clay_r - curr.ore) / curr.ore_bots) + 1

      states.push({time_left: curr.time_left - time_til_bot,
                   ore: curr.ore + (curr.ore_bots * time_til_bot) - b.clay_r,
                   clay: curr.clay + (curr.clay_bots * time_til_bot),
                   obsidian: curr.obsidian + (curr.obs_bots * time_til_bot),
                   geode: curr.geode + (curr.geode_bots * time_til_bot),

                   ore_bots: curr.ore_bots,
                   clay_bots: curr.clay_bots + 1,
                   obs_bots: curr.obs_bots,
                   geode_bots: curr.geode_bots
                   })
    }

    // Create an ore bot
    if (curr.ore_bots < b.max_needed_ore_bots)
    {
      let time_til_bot = curr.ore >= b.ore_r ? 1
        : Math.ceil((b.ore_r - curr.ore) / curr.ore_bots) + 1

      states.push({time_left: curr.time_left - time_til_bot,
                   ore: curr.ore + (curr.ore_bots * time_til_bot) - b.ore_r,
                   clay: curr.clay + (curr.clay_bots * time_til_bot),
                   obsidian: curr.obsidian + (curr.obs_bots * time_til_bot),
                   geode: curr.geode + (curr.geode_bots * time_til_bot),

                   ore_bots: curr.ore_bots + 1,
                   clay_bots: curr.clay_bots,
                   obs_bots: curr.obs_bots,
                   geode_bots: curr.geode_bots
                   })
    }

    // Do nothing
    {
      let time_til_bot = curr.time_left

      states.push({time_left: curr.time_left - time_til_bot,
                   ore: curr.ore + (curr.ore_bots * time_til_bot),
                   clay: curr.clay + (curr.clay_bots * time_til_bot),
                   obsidian: curr.obsidian + (curr.obs_bots * time_til_bot),
                   geode: curr.geode + (curr.geode_bots * time_til_bot),

                   ore_bots: curr.ore_bots,
                   clay_bots: curr.clay_bots,
                   obs_bots: curr.obs_bots,
                   geode_bots: curr.geode_bots
                   })
    }
  }

  return best
}


let ans = 1

for (let i = 0; i < 3; ++i) {
  console.time(`t${i+1}`)
  let b = blueprints[i]

  let quality_level = find_max_geodes_DFS(b)
  console.log(quality_level)

  ans *= quality_level
  console.timeEnd(`t${i+1}`)
}

console.log("Quality level for these blueprints is: ", ans)
