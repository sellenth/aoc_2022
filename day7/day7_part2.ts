import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let testing = false
let input = testing ? test_input : real_input;

class Node {
  parent: Node | null = null
  children: Record<string, Node> = {}
  size: number = 0
}

let fs: Node = new Node()

let curr_node = fs;

function build_fs(input: any) {
  let lines = input.split('\n')

  lines.forEach((line: string ) => {
    if (line[0] == "$"){
      if (line.slice(2,4) == "cd")
      {
        let dir = line.split(' ')[2]
        if (dir == '/') {
          curr_node = fs
        } else if (dir == '..'){
          if (curr_node.parent)
            curr_node = curr_node.parent
          else
            curr_node = fs
        } else {
          curr_node = curr_node.children[dir]
        }
      }

      //if (line.slice(2,4) == "ls")
       // console.log('ls command')
    } else // listing files/directories
    {
      if (line[0] == 'd') { // looking at a directory
        let dir = line.split(' ')[1]
        if (dir in curr_node.children) {
          curr_node = curr_node.children[dir]
        } else {
          curr_node.children[dir] = new Node()
          curr_node.children[dir].parent = curr_node
        }
      } else {
        let [filesize, filename] = line.split(' ')
        curr_node.children[filename] = new Node()
        curr_node.children[filename].parent = curr_node
        curr_node.children[filename].size = parseInt(filesize)
      }
    }
  } )
}

build_fs(input)

function calc_size(node: Node) {
  let size = 0;

  let nodes: Array<Node> = [];
  Object.values(node.children).forEach( (child) => {
    nodes.push(child)
  } )

  if (nodes.length == 0) {
    return
  }

  let curr_node = nodes.pop()
  while (curr_node)
  {
    if (curr_node.size > 0) {
      size += curr_node.size
    } else {
      calc_size(curr_node)
      size += curr_node.size
    }
    curr_node = nodes.pop()
  }

  node.size = size
}

calc_size(fs)

function sum_sizes(node: Node) {
  let size = 0;

  let nodes: Array<Node> = [];
  Object.values(node.children).forEach( (child) => {
    nodes.push(child)
  } )

  if (nodes.length == 0) {
    return 0
  }

  let curr_node = nodes.pop()
  while (curr_node)
  {
    Object.values(curr_node.children).forEach( (child) => {
      nodes.push(child)
    } )

    if (Object.keys(curr_node.children).length > 0
       && curr_node.size < 100000) {
      size += curr_node.size
    }

    curr_node = nodes.pop()
  }

  return size
}

let unused_space = 70000000 - fs.size
let need_to_free = 30000000 - unused_space

console.log("Need to free this many units: ", need_to_free)

function find_smallest_size(node: Node, need_to_free: number) {
  let smallest_size = node.size;

  let nodes: Array<Node> = [];
  Object.values(node.children).forEach( (child) => {
    nodes.push(child)
  } )

  if (nodes.length == 0) {
    return 0
  }

  let curr_node = nodes.pop()
  while (curr_node)
  {
    Object.values(curr_node.children).forEach( (child) => {
      nodes.push(child)
    } )

    if (Object.keys(curr_node.children).length > 0
       && curr_node.size > need_to_free
       && curr_node.size < smallest_size) {
      smallest_size = curr_node.size
    }

    curr_node = nodes.pop()
  }

  return smallest_size;
}

console.log("smallest viable directory to delete: ", find_smallest_size(fs, need_to_free))
