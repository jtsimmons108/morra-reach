import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isAlice = await ask.ask(
  `Are you Alice?`,
  ask.yesno
);
const who = isAlice ? 'Alice' : 'Bob';

console.log(`Starting Morra as ${who}`);

let acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));

let ctc = null;
if (isAlice) {
  ctc = acc.contract(backend);
  ctc.getInfo().then((info) => {
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
} else {
  const info = await ask.ask(
    `Please paste the contract information:`,
    JSON.parse
  );
  ctc = acc.contract(backend, info);
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

interact.informTimeout = () => {
  console.log(`There was a timeout.`);
  process.exit(1);
};

if (isAlice) {
  const amt = await ask.ask(
    `How much do you want to wager?`,
    stdlib.parseCurrency
  );
  interact.wager = amt;
  interact.deadline = { ETH: 100, ALGO: 100, CFX: 1000 }[stdlib.connector];
} else {
  interact.acceptWager = async (amt) => {
    const accepted = await ask.ask(
      `Do you accept the wager of ${fmt(amt)}?`,
      ask.yesno
    );
    if (!accepted) {
      process.exit(0);
    }
  };
}



interact.pickFingers = async () => {
  const fingers = await ask.ask(`How many fingers do you want to throw?`, (x) => {
    console.log(`Picked ${x}`)
    if (isNaN(parseInt(x))){
      throw Error(`Please pick an integer between 0-5`);
    }
    const fingers = parseInt(x);
    if (x < 0 || x > 5 ) {
      throw Error(`You do not have that many fingers`);
    }
    return fingers;
  });
  console.log(`You played ${fingers} fingers`);
  return fingers;
};


interact.pickTotal = async () => {
  const total = await ask.ask(`What is your guess for the total?`, (x) => {
    if (isNaN(parseInt(x))){
      throw Error(`Please pick an integer between 0-10`);
    }
    const total = parseInt(x);
    if (x < 0 || x > 10 ) {
      throw Error(`You do not have that many fingers`);
    }
    return total;
  });
  console.log(`You guessed ${total} fingers total.`);
  return total;
};

interact.checkRound = (aliceFingers, aliceGuess, bobFingers, bobGuess) => {
  const total = parseInt(aliceFingers) + parseInt(bobFingers);
  console.log(`Alice threw ${aliceFingers} and guessed ${aliceGuess}. Bob threw ${bobFingers} and guessed ${bobGuess}. Total`)
  console.log(aliceGuess == total);
  console.log(bobGuess == total);
  if (aliceGuess == total){
    console.log('Alice guessed correctly.');
  }
  if (bobGuess == total){
    console.log('Bob guessed correctly.');
  }
}


const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);

ask.done();