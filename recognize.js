import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const demosSection = document.getElementById("demos");
let gestureRecognizer = GestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton = HTMLButtonElement;
let passingScore = 80;
let webcamRunning = false;

//words for lvl 1
let words = ["Bad", "Bed", "Cab", "Had", "Bag", "Fed"];
//words for lvl2
let wordslvl2 = ["Head", "Ache", "Deaf", "Face", "Bead", "Cage", "Gage"];
//words for lvl3
let wordslvl3 = ["Ahead", "Decaf", "Facade", "Badge", "Beach", "Hagged", "Baggage", "Behead", "Chafe", "Chased"]
//arry containing each letter from the word to sign by user
let splitWord = [];
const videoHeight = "360px";
const videoWidth = "480px";
//the letter we want the user to replicate
let letterToPredict = "";
//the word we want the user to replicate
let wordToPredict = "";
let currentWordArray = words; // Initialize with the first set of words



window.onload = function () {


  // Function to check if the word is completed
  function checkWordCompletion() {
    if (splitWord.length === 0) {
      outputWords(); // Move to the next word
      outputLetter(); // Display the first letter of the new word
    }
  }

  // Function to handle successful completion of a letter
  function handleSuccessfulLetterCompletion() {
    if (splitWord.length > 0) {
      splitWord.shift(); // Remove the letter that the user completed
      outputLetter(); // Display the next letter
      checkWordCompletion(); // Check if the word is completed
    }
  }
  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    //     gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    //       baseOptions: {
    //         modelAssetPath:
    //           "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
    //         delegate: "GPU"
    //       },
    //       runningMode: runningMode
    //     });
    //   };

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "./gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: runningMode
    });
  };

  createGestureRecognizer();


  /********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/

  const video = document.getElementById("webcam");
  const canvasElement = document.getElementById("output_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  const gestureOutput = document.getElementById("gesture_output");
  const gestureToDo = document.getElementById("gesture_toDo");
  const wordToDo= document.getElementById("word_toDo");

  // Check if webcam access is supported.
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }

  // Enable the live webcam view and start detection.
  function enableCam(event) {
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    if (webcamRunning === true) {
      webcamRunning = false;
      enableWebcamButton.innerText = "START";


    } else {
      webcamRunning = true;
      enableWebcamButton.innerText = "STOP";
    }

    // getUsermedia parameters.
    const constraints = {
      video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }
  // displaying the required letter
  //shuffle array
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }

    return array;
  }


  //output the word  that the player has to replicate with their hands
  function outputWords() {
    //change all the words to uppercase or the comparaison does not work
    currentWordArray = currentWordArray.map(function (x) {
      return x.toUpperCase();
    })
    // const shuffledArray = shuffle(words);
    // wordToPredict = shuffledArray[0];

    // //remove the word form the words array when it is selcted to be signed
    // words = words.filter(e => e !== wordToPredict);
    // // console.log(words);
    // splitWord = wordToPredict.split("");
    if (currentWordArray.length === 0) {
      levelCompleted();
      if (currentWordArray === wordslvl2) {
        currentWordArray = wordslvl3; // If wordslvl2 is done, move to wordslvl3
      } else {
        currentWordArray = wordslvl2; // Else, move to wordslvl2
      }
    }
    
    const shuffledArray = shuffle(currentWordArray);
    wordToPredict = shuffledArray[0];
    currentWordArray = currentWordArray.filter((e) => e !== wordToPredict);
    wordToDo.innerText=wordToPredict;
    splitWord = wordToPredict.split("");
  }


  
  


  //output the next letter that the player has to replicate with their hands
  function outputLetter() {
    //change all the words to uppercase or the comparaison does not work
    splitWord = splitWord.map(function (x) {
      return x.toUpperCase();
    })
    if (splitWord && splitWord.length > 0) {
      letterToPredict = splitWord[0];
      console.log(letterToPredict);
      // display a letter for the user to sign
      gestureToDo.innerText = "Letter to sign: "+letterToPredict;
      //splitword is the array of the word that the user currently has to spell
      console.log(splitWord);
    }
    

  }

  let lastVideoTime = -1;
  let results = undefined;


  //display word to gesture
  outputWords();
  //display letter to gesture
  outputLetter();
  async function predictWebcam() {

    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({
        runningMode: "VIDEO"
      });
    }
    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;


    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5
          }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 2
        });
      }
    }
    canvasCtx.restore();

    if (results.gestures.length > 0) {
      gestureOutput.style.display = "block";
      gestureOutput.style.width = videoWidth;
      const categoryName = results.gestures[0][0].categoryName;
      const categoryScore = parseInt(
        results.gestures[0][0].score * 100
      );
      const handedness = results.handednesses[0][0].displayName;
      // Add a delay before updating the displayed score
      const delayMilliseconds = 2000; // Adjust the delay time as needed (in milliseconds)
      setTimeout(() => {
        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
      }, delayMilliseconds);
      // gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
      // detect if the accuracy lvl is greater than the passing score
      if (categoryScore >= passingScore && categoryName == letterToPredict) {
        if (splitWord.length > 0) {
          console.log("pass");
          //remove the letter that the user has on didsplay from the array
          splitWord.shift();
          //display next letter to gesture-
          outputLetter();
        } else {
          if (splitWord.length === 0) {
            console.log("splitWord is empty, switching to next word");
            outputWords(); // This will move to the next set of words
            outputLetter(); // Display the first letter of the new word
          }
        }

      } else {
        console.log("fail");
      }
    } else {
      gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }



  } //predictwebcam fucntion end
  //tanstion screen 

  // Transition screen functions
  function showTransitionScreen() {
    // Hide the game canvas
    document.getElementById("gameCanvas").style.display = "none";

    // Display the transition screen
    const transitionScreen = document.getElementById("transitionScreen");
    transitionScreen.style.display = "block";

    // Add logic for what happens when the "Continue" button is clicked
    const continueButton = document.getElementById("continueButton");
    continueButton.addEventListener("click", function () {
      // Hide the transition screen
      transitionScreen.style.display = "none";

      // Show the game canvas again or load the next level
      document.getElementById("gameCanvas").style.display = "block";

      // You can trigger the logic to start the next level here
      // For example: startNextLevel();
    });
  }

  // Example usage: Call this function when the level is completed
  // Replace this with your logic for when the level is successfully completed
  // For example, when all words in a level are signed correctly
  function levelCompleted() {
    // Show the transition screen
    showTransitionScreen();
  }
  //transtiion screen






} //window onload function that contains all the functions