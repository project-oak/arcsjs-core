export const camera = async video => {
  const cameraStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      //deviceId,
      width: 1280,
      height: 720,
    }
  });
  //video.addEventListener('loadeddata', streamPredictLoop);
  video.srcObject = cameraStream;
  /*await*/ video.play();
  console.log('PLAY');
  return cameraStream;
};