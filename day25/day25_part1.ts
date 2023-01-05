import { readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';


let test_input = `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`

function syncReadFile(filename: string) {
  let result = readFileSync(join(__dirname, filename), 'utf-8');
  return result;
}

let real_input = syncReadFile('./input.txt');

let example = false
let input = example ? test_input : real_input;


let SNAFUs = input.split('\n')

let searching = true

function strategic_force(target: number, snafu: string[], idx: number) {
  let dec = SNAFU_to_decimal(snafu)

  //if (idx == 0) {
  //  console.log(target, dec)
  //}

  if (!searching || idx < 0 || dec < target) {
    return
  }
  if (dec == target) {
    searching = false
    console.log(snafu)
    return
  }

  if (idx != snafu.length - 1) {
    let c0 = snafu.map(x => x)
    c0[idx] = '2'
    strategic_force(target, c0, idx - 1)
  }

  let c1 = snafu.map(x => x)
  c1[idx] = '1'
  strategic_force(target, c1, idx - 1)

  let c2 = snafu.map(x => x)
  c2[idx] = '0'
  strategic_force(target, c2, idx - 1)

  let c3 = snafu.map(x => x)
  c3[idx] = '-'
  strategic_force(target, c3, idx - 1)

  let c4 = snafu.map(x => x)
  c4[idx] = '='
  strategic_force(target, c4, idx - 1)
}

function decimal_to_snafu(n: number) {
  console.log(n)
  let ans: string[] = []
  let pow = 0

  // get power larger than n
  while (5 ** pow < n) {
    ++pow
  }
  --pow

  ans.push('2')
  for (; pow > 0; --pow) {
      ans.push('=')
  }

  for (let i = 1; i < ans.length; ++i) {
    ans[i] = '-'
    if (SNAFU_to_decimal(ans) > n) {
      ans[i] = '='
      continue
    }
    ans[i] = '0'
    if (SNAFU_to_decimal(ans) > n) {
      ans[i] = '-'
      continue
    }
    ans[i] = '1'
    if (SNAFU_to_decimal(ans) > n) {
      ans[i] = '0'
      continue
    }
    ans[i] = '2'
    if (SNAFU_to_decimal(ans) > n) {
      ans[i] = '1'
      continue
    }
  }


  //strategic_force(n, ans, ans.length-1)
  console.log(SNAFU_to_decimal(ans))
  return ans.join('')
}

function SNAFU_to_decimal(S: string[]) {
  let val = 0
  let l = S.length

  S.forEach((char, i) => {
    let v = 0
    switch (char) {
        case '2':
          v = 2
          break
        case '1':
          v = 1
          break
        case '0':
          v = 0
          break
        case '-':
          v = -1
          break
        case '=':
          v = -2
          break
    }

    v = 5 ** (l - (i + 1)) * v
    val += v
  })

  return val
}

let ans = SNAFUs.map( S => SNAFU_to_decimal(S.split('')) ).reduce( (sum, curr) => sum += curr )
console.log(decimal_to_snafu(ans))


//console.log(SNAFU_to_decimal(SNAFUs[0]) == 1747)
//console.log(SNAFU_to_decimal(SNAFUs[1]) == 906)
//console.log(SNAFU_to_decimal(SNAFUs[2]) == 198)
