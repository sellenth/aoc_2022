import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `Blueprint 1:  Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

type ore = number
type clay = number
type obsidian = number //[ore, clay]
type geode = number//[ore, obsidian]

class Blueprint {
  ore_r: ore
  clay_r: ore
  obsidian_r: [ore, clay]
  geode_r: [clay, obsidian]

  constructor( a: number, b: number, c: number, d: number, e: number, f: number) {
    this.ore_r = a
    this.clay_r = b
    this.obsidian_r = [c, d]
    this.geode_r = [e, f]

  }
}

let blueprints: Blueprint[]= []
let reg = /([0-9]+)/g

input.split('\n').forEach( (line: string) => {
  let res: number[] = line.match(reg)!.map( x => parseInt(x!) )

  blueprints.push( new Blueprint(res [1], res [2], res [3], res [4], res [5], res [6]) )
})

let geode_best_for_this_blueprint = -1

function find_max_geodes(time_left: number,
                         ore: number, clay: number, obsidian: number, geodes: number,
                         num_ore_r: number, num_clay_r: number, num_obsidian_r: number, num_geode_r: number): number {
  if (time_left == 0) {
    geode_best_for_this_blueprint = Math.max(geode_best_for_this_blueprint, geodes)
    return geodes;
  }



  let n = time_left + num_geode_r
  let geode_upper_threshold = geodes + (n * (n-1) / 2)
  if (geode_upper_threshold < geode_best_for_this_blueprint) {
    return 0
  }

  let ans = 0;

  // create geode robot (ore + obsidian)
  if (ore >= b.geode_r[0] && obsidian >= b.geode_r[1] ) {
    return find_max_geodes(time_left - 1,
                           ore - b.geode_r[0] + num_ore_r,
                           clay + num_clay_r,
                           obsidian - b.geode_r[1] + num_obsidian_r,
                           geodes + num_geode_r,

                           num_ore_r,
                           num_clay_r,
                           num_obsidian_r,
                           num_geode_r + 1)
  }

  // create obsidian robot ( ore, clay )
  if (ore >= b.obsidian_r[0] && clay >= b.obsidian_r[1] ) {
    assert( clay - b.obsidian_r[1] >= 0, `building obsidian bot ${b.obsidian_r[1]}, have ${clay}`)
    ans = Math.max(ans, find_max_geodes(time_left - 1,
                                        ore - b.obsidian_r[0] + num_ore_r,
                                        clay - b.obsidian_r[1] + num_clay_r,
                                        obsidian + num_obsidian_r,
                                        geodes + num_geode_r,

                                        num_ore_r,
                                        num_clay_r,
                                        num_obsidian_r + 1,
                                        num_geode_r))
  }

  // create ore robot
  if (ore >= b.ore_r && num_ore_r < max_needed_ore_bots) {
    //console.log(`spend ${b.ore_r} ore to create 1 ore bot`)
    ans = Math.max(ans, find_max_geodes(time_left - 1,
                                        ore - b.ore_r + num_ore_r,
                                        clay + num_clay_r,
                                        obsidian + num_obsidian_r,
                                        geodes + num_geode_r,

                                        num_ore_r + 1,
                                        num_clay_r,
                                        num_obsidian_r,
                                        num_geode_r))
  }


  // create clay robot
  if (ore >= b.clay_r && num_clay_r < max_needed_clay_bots) {
    //console.log(`spend ${b.clay_r} ore to create 1 clay bot`)
    assert( ore - b.clay_r >= 0, `building clay bot ${b.clay_r}, have ${ore}`)
    ans = Math.max(ans, find_max_geodes(time_left - 1,
                                        ore - b.clay_r + num_ore_r,
                                        clay + num_clay_r,
                                        obsidian + num_obsidian_r,
                                        geodes + num_geode_r,

                                        num_ore_r,
                                        num_clay_r + 1,
                                        num_obsidian_r,
                                        num_geode_r))
  }

  // do nothing
  ans = Math.max(ans, find_max_geodes(time_left - 1,
                                      ore + num_ore_r,
                                      clay + num_clay_r,
                                      obsidian + num_obsidian_r,
                                      geodes + num_geode_r,

                                      num_ore_r,
                                      num_clay_r,
                                      num_obsidian_r,
                                      num_geode_r))

  return ans

}


let runtime = 24

let b = blueprints[0]
let max_needed_ore_bots = Math.max(b.ore_r, b.clay_r, b.obsidian_r[0], b.geode_r[0])
let max_needed_clay_bots = Math.max(b.clay_r, b.obsidian_r[1])

let ans = 0

for (let i = 0; i < blueprints.length; ++i) {
console.time("t1")
  b = blueprints[i]
  max_needed_ore_bots = Math.max(b.ore_r, b.clay_r, b.obsidian_r[0], b.geode_r[0])
  max_needed_clay_bots = Math.max(b.clay_r, b.obsidian_r[1])
  geode_best_for_this_blueprint = -1

  let quality_level = find_max_geodes(runtime,
                              0, 0, 0, 0,
                              1, 0, 0, 0) * (i + 1)

console.timeEnd("t1")
  ans += quality_level
}

console.log("Quality level for these blueprints is: ", ans)
