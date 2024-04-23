import React from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import { FiClock } from "react-icons/fi";
import { FiAward } from "react-icons/fi";

export default function App() {
  const [dice, setDice] = React.useState(allNewDice());
  const [numbrrrs, setNumbrrrs] = React.useState(false);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  // START/STOP the stopwatch based on game state
  React.useEffect(() => {
    if (numbrrrs) {
      setIsRunning(false);
      pushTimeToLocalStorage(timeElapsed);
    } else {
      setIsRunning(true);
      setTimeElapsed(0); // RESET time when starting a new game
    }
  }, [numbrrrs]);

  // INCREMENT the stopwatch every second while running
  React.useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 10); // UPDATE every 10 milliseconds for CENTIMALS
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // CHECK IF THE GAME IS WON
  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setNumbrrrs(true);
    }
  }, [dice]);

  // GENERATE NUMBER 1-6 IN DICE
  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  // GENERATE 10 DICES IN THE GAME
  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  // ROLL DICES (WHICH IS NOT HELD)
  function rollDice() {
    if (!numbrrrs) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
    } else {
      setNumbrrrs(false);
      setDice(allNewDice());
    }
  }

  // HOLD DICE ON CLICK
  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  // ALL DICES
  const diceElements = dice.map((die) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ));

  //
  //
  // UPDATE:
  // ADDING STOPWATCH AND GETTING THE FASTEST TIMES
  //
  //

  // FORMATING TIME
  const formatTime = (centiseconds) => {
    const minutes = Math.floor(centiseconds / 6000); // 1 minute = 6000 centiseconds
    const remainingCentiseconds = centiseconds % 6000;
    const seconds = Math.floor(remainingCentiseconds / 100);
    const centimals = remainingCentiseconds % 100;

    // FORMAT TIME IN - MM:SS:CC
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}:${centimals.toString().padStart(2, "0")}`;
  };

  // PUSH TIME TO LOCALSTORAGE ARRAY
  const pushTimeToLocalStorage = (time) => {
    // GET existing times from localStorage
    const existingTimesString = localStorage.getItem("numbrrrsTimes");
    const existingTimes = existingTimesString
      ? JSON.parse(existingTimesString)
      : [];

    existingTimes.push(time); // PUSH the new time

    localStorage.setItem("numbrrrsTimes", JSON.stringify(existingTimes)); // STORE the updated array back in localStorage
  };

  // GET THE BEST TIME FROM LOCALSTORAGE
  const getBestTime = () => {
    const existingTimesString = localStorage.getItem("numbrrrsTimes"); // Retrieve existing times from localStorage

    // Check if there are any stored times
    if (existingTimesString) {
      const existingTimes = JSON.parse(existingTimesString); // Parse the JSON string to convert it to an array

      const bestTime = Math.min(...existingTimes); // Find the best (fastest) time

      return formatTime(bestTime); // Format the best time in MM:SS:CC format
    }

    return "-"; // Return a default message if there are no stored times
  };

  const yourBest = getBestTime();

  return (
    <div className="app">
      <main>
        <h1 className="title">numbrrrs</h1>
        <p className="instructions">
          Roll until all the numbers are the same. Click each number to freeze
          it at its current value between rolls.
        </p>
        <p className="instructions"></p>
        <div className="dice-container">{diceElements}</div>
        <button className="roll-dice" onClick={rollDice}>
          {numbrrrs ? "New Game" : "Roll"}
        </button>

        <div className="winner-container">
          <div className="time-left">
            <p className="time-instructions">
              <span className="icon">
                <FiClock />
              </span>
              Current time:
            </p>
            <p className="winner time">{formatTime(timeElapsed)}</p>
          </div>

          <div className="time-right">
            <p className="time-instructions">
              <span className="icon">
                <FiAward />
              </span>
              Personal best:
            </p>
            <p className="winner time">{yourBest}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
