'reach 0.1';

const Player = {
  ...hasRandom,
  pickFingers: Fun([], UInt),
  pickTotal: Fun([], UInt),
  informTimeout: Fun([], Null),
  checkRound: Fun([UInt, UInt, UInt, UInt], Null)
};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Player,
    wager: UInt,
    deadline: UInt, 
  });
  const Bob   = Participant('Bob', {
    ...Player,
    acceptWager: Fun([UInt], Null),
  });
  init();

  const informTimeout = () => {
    each([Alice, Bob], () => {
      interact.informTimeout();
    });
  };

  Alice.only(() => {
    const wager = declassify(interact.wager);
    const deadline = declassify(interact.deadline);
  });
  Alice.publish(wager, deadline)
    .pay(wager);
  commit();

  Bob.only(() => {
    interact.acceptWager(wager);
  });
  Bob.pay(wager)
    .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));

  const TARGET_WINS = 1;
  var winningHands = {alice: 0, bob: 0};
  invariant( balance() == 2 * wager );
  while ( winningHands.alice < TARGET_WINS && winningHands.bob < TARGET_WINS ) {
    commit();

    Alice.only(() => {
      const _fingersAlice = interact.pickFingers();
      const _totalAlice = interact.pickTotal();
      const [_commitFingersAlice, _saltFingersAlice] = makeCommitment(interact, _fingersAlice);
      const [_commitTotalAlice, _saltTotalAlice] = makeCommitment(interact, _totalAlice);
      const commitFingersAlice = declassify(_commitFingersAlice);
      const commitTotalAlice = declassify(_commitTotalAlice);
    });

    Alice.publish(commitFingersAlice, commitTotalAlice)
      .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
    commit();

    unknowable(Bob, Alice(_fingersAlice, _saltFingersAlice, _totalAlice, _saltTotalAlice));
    Bob.only(() => {
      const fingersBob = declassify(interact.pickFingers());
      const totalBob = declassify(interact.pickTotal())
    });
    Bob.publish(fingersBob, totalBob)
      .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
    commit();

    Alice.only(() => {
      const fingersAlice = declassify(_fingersAlice);
      const saltFingersAlice = declassify(_saltFingersAlice);
      const totalAlice = declassify(_totalAlice);
      const saltTotalAlice = declassify(_saltTotalAlice);
    });
    Alice.publish(fingersAlice, saltFingersAlice, totalAlice, saltTotalAlice)
      .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
    checkCommitment(commitFingersAlice, saltFingersAlice, fingersAlice);
    checkCommitment(commitTotalAlice, saltTotalAlice, totalAlice);


    each([Alice, Bob], () => {
      interact.checkRound(fingersAlice, totalAlice, fingersBob, totalBob);
    })

    const total = fingersAlice + fingersBob;
    winningHands = {alice: winningHands.alice + (total == totalAlice ? 1 : 0), bob: winningHands.bob + (total == totalBob ? 1 : 0)}
    continue;
  }


  if (winningHands.alice == winningHands.bob){
    transfer(wager).to(Alice);
    transfer(wager).to(Bob);
  } else{
    transfer(2 * wager).to(winningHands.alice == TARGET_WINS ? Alice : Bob);
  }
  
  commit();

  exit();
});