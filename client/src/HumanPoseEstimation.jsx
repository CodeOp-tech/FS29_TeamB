//1 Install dependencies DONE
//2 Import dependencies DONE
//3 Set up web cam and canvas DONE
//4 define referencies to those DONE
//5 load pose net DOne
//6 detect function Done
//7 drawing utilities from tensor flow
//8 draw function

import { useState, useEffect, useCallback } from "react";
import "./App.css";
import React, { useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";

function HumanPoseEstimation() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturePose, setCapturePose] = useState(null);

  const capture = useCallback(() => {
    const capturePose = webcamRef.current.getScreenshot();
    setCapturePose(capturePose);
  }, [webcamRef]);

  //Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.5,
    });
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    try {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        // Get Video Properties
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Make Detections
        const pose = await net.estimateSinglePose(video);

        console.log(pose);

        drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
      }
    } catch (error) {
      console.error("Error in detect function:", error);
    }
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  runPosenet();

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
      <div className="container">
        {capturePose ? (
          <img src={capturePose} alt="webcam" />
        ) : (
          <Webcam height={600} width={600} ref={webcamRef} />
        )}
        <div className="btn-container">
          <button onClick={capture}>Capture photo</button>
        </div>
        <div className="container">
          {capturePose ? (
            <img src={capturePose} alt="webcam" />
          ) : (
            <Webcam height={600} width={600} ref={webcamRef} />
          )}
          <div className="btn-container">
            <button onClick={capture}>Capture photo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HumanPoseEstimation;