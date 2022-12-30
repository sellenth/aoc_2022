import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `1
2
-3
3
-2
0
4`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = true

let input = testing ? test_input : real_input;

type LL = Node | null

class Node {
  v: number
  next: LL = null
  prev: LL = null

  constructor(v: number) {
    this.v = v
  }
}


let arr = input.split('\n').map( x => parseInt(x) )
let first = new Node(arr[0])
let prev = first
let curr: LL
let node_map: Record<number, [Node]> = {}
node_map[arr[0]] = [first]

let zero: Node | null = null

for (let i = 1; i < arr.length; ++i) {
  curr = new Node(arr[i])
  curr.prev = prev
  prev.next = curr
  prev = curr

  if (arr[i] == 0 && zero == null)
    zero = curr

  if (arr[i] in node_map)
    node_map[arr[i]].push(curr)
  else
    node_map[arr[i]] = [curr]
}


curr!.next = first
first.prev = curr!

//console.log(node_map[4])

/*
curr = node_map[0].shift()!

function print_arrangement(first: Node) {
  let n = Object.keys(node_map).length
  let curr = first
  for (let i = 0; i < n; ++i) {
    process.stdout.write(curr.v + ' ')
    curr = curr.next!
  }
  console.log()
}*/

function move_node(v: number) {
  let curr = node_map[v].shift()!

  let next = curr.next!
  let prev = curr.prev!

  next.prev = prev
  prev.next = next


  if (v > 0) {
    for (let i = 0; i < v; ++i) {
      next = next.next!
    }

    prev = next.prev as Node

    prev.next = curr
    curr.prev = prev
    curr.next = next
    next.prev = curr

  } else {
    for (let i = v; i < 0; ++i) {
      prev = prev.prev!
    }

    next = prev.next as Node

    prev.next = curr
    curr.prev = prev
    curr.next = next
    next.prev = curr
  }
}

//print_arrangement(first)
for (let i = 0; i < arr.length; ++i) {
  let v = arr[i]
  //console.log("Moving ", v)
  move_node(v)
  //print_arrangement(first)
  //console.log()
}

function get_1000th_after() {
  let curr = zero!
  for (let i = 0; i < 1000; ++i){
    curr = curr.next!
  }
  zero = curr
  return curr.v
}

let one_thousand = get_1000th_after()
let two_thousand = get_1000th_after()
let three_thousand = get_1000th_after()

console.log("Sum of three grove coordinates ", one_thousand + two_thousand + three_thousand)