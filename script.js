const AudioElm = document.querySelector('audio');
const PlayBtn = document.querySelector('button');

const File = document.querySelector('#File');
File.addEventListener('change',()=>{
    let filereader = new FileReader();
    filereader.onload = ()=>{
        AudioElm.src = filereader.result;
    }
    filereader.readAsDataURL(File.files[0]);
})

let AudioCtx = new AudioContext();
let state;

PlayBtn.addEventListener('click',()=>{
    
    if(AudioElm.paused){
        AudioElm.play();
        PlayBtn.textContent = "Pause";
        state = 'playing';
    }else{
        AudioElm.pause();
        PlayBtn.textContent = "Play";
        state = 'paused';
    }
    if(AudioCtx.state === 'suspended'){
        AudioCtx.resume();
    }
},false);

//Seek
var seek = document.querySelector('#Seek');

seek.addEventListener('input',()=>{
    AudioElm.currentTime = seek.value/100;
})

function Seeking() {
    requestAnimationFrame(Seeking);
    seek.value = (AudioElm.currentTime/AudioElm.duration)*100;
}

    Seeking();


var track = AudioCtx.createMediaElementSource(AudioElm);

const gainNode = AudioCtx.createGain();
const gainControl = document.querySelector('#Gain');
gainControl.addEventListener('input',(e)=>{
   gainNode.gain.value = (gainControl.value)/100;
},false);

var panOpt = {pan:0};
const Panner = new StereoPannerNode(AudioCtx, panOpt);
const panControl = document.querySelector('#Pan');
panControl.addEventListener('input',()=>{
    Panner.pan.value = (panControl.value)-50;
},false);

// defining a lowshelf filter for the bass
var LowShelfRange = document.querySelector("#lowshelf");
var LowShelfFilter = AudioCtx.createBiquadFilter();
LowShelfFilter.type = "lowshelf";
LowShelfFilter.frequency.value = 400;
LowShelfRange.addEventListener('input',()=>{
    LowShelfFilter.gain.value = LowShelfRange.value;
},false);

var PeakingRange = document.querySelector("#peaking");
var PeakingQRange = document.querySelector("#peakingQ");
var PeakingFilter = AudioCtx.createBiquadFilter();
PeakingFilter.type = "peaking";
PeakingFilter.frequency.value = 800;
PeakingRange.addEventListener('input',()=>{
    PeakingFilter.gain.value = PeakingRange.value;
},false);
PeakingQRange.addEventListener('input',()=>{
    PeakingFilter.Q.value = PeakingQRange.value;
},false);

var HighShelfRange = document.querySelector("#highshelf");
var HighShelfFilter = AudioCtx.createBiquadFilter();
HighShelfFilter.type = "highshelf";
HighShelfFilter.frequency.value = 1200;
HighShelfRange.addEventListener('input',()=>{
    HighShelfFilter.gain.value = HighShelfRange.value;
});

//visualization 

//colors

var green = 55;
var blue = 55;
var red = 55;

var greenval = document.querySelector("#green");
greenval.addEventListener("input",()=>{
    green = greenval.value;
},false);

var blueval = document.querySelector("#blue");
blueval.addEventListener("input",()=>{
    blue = blueval.value;
},false);

var redval = document.querySelector("#red");
redval.addEventListener("input",()=>{
    red = redval.value;
})

//canvas
var canvas = document.querySelector("canvas");
var canvasCtx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

var Analyser = AudioCtx.createAnalyser();
Analyser.fftSize = 256;
var BufferLength = Analyser.frequencyBinCount;
var FrequencyData = new Uint8Array(BufferLength);



canvasCtx.clearRect(0,0,WIDTH,HEIGHT);

function draw() {
    canvasCtx.fillStyle = "black",
    canvasCtx.fillRect(0,0,canvas.width,canvas.height);
    

    Analyser.getByteFrequencyData(FrequencyData);

    //circle
    let radius = 20;
    //loops over all possible frequecnies,
    //The radian points of the imaginary circle are gotten by dividing a full circle 
    for(var i = 0 ; i<BufferLength ; i++) {
        let radians = (Math.PI*2) / BufferLength;
        let barheight = (FrequencyData[i]-radius) ;
        
        let x = canvas.width / 2 + Math.cos(radians * i) * radius;
        let y = canvas.height / 2 + Math.sin(radians * i) * radius;

        let x_end = canvas.width / 2 + Math.cos(radians * i) * (barheight) ;
        let y_end = canvas.height / 2 + Math.sin(radians * i) * (barheight) ;


        canvasCtx.strokeStyle = `rgb(${red + barheight},${green},${blue})`;
        canvasCtx.lineWidth = 5;
        canvasCtx.beginPath();
        
        canvasCtx.moveTo(x,y);
        
        canvasCtx.lineTo(x_end, y_end);
        canvasCtx.stroke();

    

    }

    requestAnimationFrame(draw);
}

draw();

track.connect(Analyser);
Analyser.connect(LowShelfFilter).connect(PeakingFilter).connect(HighShelfFilter).connect(gainNode).connect(Panner).connect(AudioCtx.destination);
