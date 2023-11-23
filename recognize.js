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
let letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
//words for lvl 1
let words = ["Bad", "Bed", "Cab","Had","Bag","Fed"];
//words for lvl2
let wordslvl2=["Head","Ache","Deaf","Face","Bead","Cage","Gage"];
//words for lvl3
let wordslvl3=["Ahead","Decaf","Facade","Badge","Beach","Hagged","Baggage","Behead","Chafe","Chased"]
//arry containing each letter from the word to sign by user
let splitWord = [];
const videoHeight = "360px";
const videoWidth = "480px";
//the letter we want the user to replicate
let letterToPredict = "";
//the word we want the user to replicate
let wordToPredict = "";

//timer for getting 80% TO D0 lvl1-10sec
//if they complete it they get points  onepoint per letter

window.onload = function () {

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
      enableWebcamButton.innerText = "ENABLE PREDICTIONS";


    } else {
      webcamRunning = true;
      enableWebcamButton.innerText = "DISABLE PREDICTIONS";
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
  //output the next letter that the player has to replicate with their hands
  function outputLetter() {
    //use array shuffle to output the letter the user has to predict
    const shuffledArray = shuffle(letters);
    letterToPredict = shuffledArray[0];
    gestureToDo.innerText = letterToPredict;
    // console.log(letterToPredict);
  }

  //output the word  that the player has to replicate with their hands
  function outputWords() {
    const shuffledArray = shuffle(words);
    wordToPredict = shuffledArray[0];
    //remove the word form the words array when it is selcted to be signed
    words = words.filter(e => e !== wordToPredict); 
    // console.log(words);
    splitWord = wordToPredict.split("");
    letterToPredict=splitWord[0];
    console.log(letterToPredict);
    for (var i = 0; i < wordToPredict.length; i++) {
      //console.log(wordToPredict);//entire word
      
      //split into arrays
      // for (let u = 0; u < splitWord.length; u++) {
      //   gestureToDo.innerText = splitWord;
      //   // console.log(splitWord[i]);
      // }
      
    }
    gestureToDo.innerText = letterToPredict;
  }


  let lastVideoTime = -1;
  let results = undefined;

  //display letter to gesture
  outputLetter();
  //display word to gesture
  outputWords();
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
      const categoryScore = parseFloat(
        results.gestures[0][0].score * 100
      ).toFixed(2);
      const handedness = results.handednesses[0][0].displayName;
      gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
      // detect if the accuracy lvl is greater than the passing score
      if (categoryScore >= passingScore && categoryName == letterToPredict) {
        // console.log("pass");
        console.log("pass");
        //display next letter to gesture
        // outputLetter();
        outputWords();
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




} //window onload function that contains all the functions