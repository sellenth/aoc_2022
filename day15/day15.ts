import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

class Beacon {
  x_pos: number
  y_pos: number
  constructor(x: number, y: number) {
    this.x_pos = x
    this.y_pos = y
  }
}

class Sensor {
  x_pos: number
  y_pos: number
  closest_beacon: Beacon

  constructor(x: number, y: number, b: Beacon) {
    this.x_pos = x
    this.y_pos = y
    this.closest_beacon = b
  }
}


let min_row = Number.MAX_SAFE_INTEGER
let max_row = Number.MIN_SAFE_INTEGER
let min_col = Number.MAX_SAFE_INTEGER
let max_col = Number.MIN_SAFE_INTEGER

function update_row_limits(v: number) {
  if (v < min_row)
    min_row = v
  if (v > max_row)
    max_row = v
}
function update_col_limits(v: number) {
  if (v < min_col)
    min_col = v
  if (v > max_col)
    max_col = v
}

function parse_line(line: string) {
  let [l1, l2] = line.split(':')

  // Use a regular expression to extract the x and y values from the input string
  // and convert them to numbers using the 'Number()' function
  const x1 = Number(l1.match(/x=(-?\d+)/)![1]);
  const y1 = Number(l1.match(/y=(-?\d+)/)![1]);
  const x2 = Number(l2.match(/x=(-?\d+)/)![1]);
  const y2 = Number(l2.match(/y=(-?\d+)/)![1]);

  update_col_limits(x1)
  update_col_limits(x2)
  update_row_limits(y1)
  update_row_limits(y2)

  // Push the coordinates onto the array
  return new Sensor(x1, y1, new Beacon(x2, y2))
}

function m_distance(x1: number, x2: number, y1: number, y2: number) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

function find_range_of_sensor_at_row(sensor: Sensor, row: number) {
  let beacon = sensor.closest_beacon
  let d = m_distance(sensor.x_pos, beacon.x_pos, sensor.y_pos, beacon.y_pos)


  let farthest_col = d - Math.abs(sensor.y_pos - row)

  if (farthest_col >= 0) {
    let l_limit = sensor.x_pos - farthest_col
    let r_limit = sensor.x_pos + farthest_col

    return [l_limit, r_limit]
  }
  else
    return []
}

let sensors = input.split('\n').map( line => parse_line(line) )

let test_row = testing ? 10 : 2000000

function get_merged_ranges_at_row(sensors: Sensor[], row: number) {
  let all_ranges_at_row: number[][] = []
    sensors.forEach( (sensor) => {
      let ret = find_range_of_sensor_at_row(sensor, row)
      if (ret.length > 0) {
        all_ranges_at_row.push(ret)
      }
  } )
  let all_ranges_sorted = all_ranges_at_row.sort( (a, b) => a[0] - b[0] )
  return merge_ranges(all_ranges_sorted)
}

// now it's like I'm doing calendar merge problem... :l
// thanks chatGPT
function merge_ranges(intervals: number[][]): number[][] {
  if (intervals.length == 0) {
    return []
  }
  // Initialize an empty array to store the merged intervals
  const mergedIntervals = [];

  // Iterate over the sorted intervals and merge them
  let currentInterval = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const interval = intervals[i];
    if (interval[0] <= currentInterval[1]) {
      // The current interval and the next interval overlap, so merge them
      currentInterval = [currentInterval[0], Math.max(currentInterval[1], interval[1])];
    } else {
      // The current interval and the next interval do not overlap, so add the current interval to the
      // merged intervals array and set the current interval to the next interval
      mergedIntervals.push(currentInterval);
      currentInterval = interval;
    }
  }

  // Push the final current interval onto the merged intervals array
  mergedIntervals.push(currentInterval);

  // Return the merged intervals
  return mergedIntervals;
}

let merged_ranges_row10 = get_merged_ranges_at_row(sensors, test_row)
let num_spaces = 0
merged_ranges_row10.forEach((interval: number[]) => {
  num_spaces += interval[1] - interval[0]
})
console.log(`Part1: Number of positions that a beacon can't be at row ${test_row}: ${num_spaces}`)

function tuning_frequency(x: number, y: number) {
  return x * 4000000 + y
}

let merged_ranges_row11 = get_merged_ranges_at_row(sensors, 11)

let search_range = testing ? 20 : 4000000
for (let i = 0; i < search_range; ++i) {
  let range = get_merged_ranges_at_row(sensors, i)

  if (range.length > 1) {
    for (let j = 0; j < range.length - 1; ++j) {
      if (range[j][1] + 1 != range[j + 1][0] )
        console.log(`Row ${i} col ${range[j][1] + 1}\t Tuning frequency: ${tuning_frequency(range[j][1] + 1, i)}`)
    }
  }
  else if ((range.length == 1 && (range[0][0] > 0 || range[0][1] < search_range)) )
    console.log(i)
}
