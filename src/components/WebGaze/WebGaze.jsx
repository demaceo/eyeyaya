import React, { useEffect, useRef, useState } from "react";
import webgazer from "webgazer";
import "./WebGaze.css";

// How long (ms) the user must look left/right before a swipe
const LOOK_DELAY = 1000;

// Generate a random image URL
function getRandomImageUrl() {
  return "https://picsum.photos/1000?" + Math.random();
}

export default function WebGaze() {
  // Current and next images in state
  const [currentImg, setCurrentImg] = useState(getRandomImageUrl);
  const [nextImg, setNextImg] = useState(getRandomImageUrl);

  // This holds "left" / "right" to animate the current image offscreen
  const [swipeClass, setSwipeClass] = useState("");

  // Cutoff boundaries
  const leftCutoff = window.innerWidth / 4;
  const rightCutoff = window.innerWidth - window.innerWidth / 4;

  // Refs to store ephemeral data without re-rendering
  const startLookTime = useRef(Infinity);
  const lookDirection = useRef(null);

  useEffect(() => {
    // Start WebGazer & set the gaze listener
    webgazer
      .setGazeListener((data, timestamp) => {
        if (!data) return;

        // If we're already swiping, ignore further gaze changes
        if (lookDirection.current === "STOP") return;

        // Check if the user is looking left
        if (
          data.x < leftCutoff &&
          lookDirection.current !== "LEFT" &&
          lookDirection.current !== "RESET"
        ) {
          startLookTime.current = timestamp;
          lookDirection.current = "LEFT";
        }
        // Check if the user is looking right
        else if (
          data.x > rightCutoff &&
          lookDirection.current !== "RIGHT" &&
          lookDirection.current !== "RESET"
        ) {
          startLookTime.current = timestamp;
          lookDirection.current = "RIGHT";
        }
        // Otherwise, user is looking center => reset
        else if (data.x >= leftCutoff && data.x <= rightCutoff) {
          startLookTime.current = Infinity;
          lookDirection.current = null;
        }

        // If user has maintained a left/right gaze for LOOK_DELAY
        if (startLookTime.current + LOOK_DELAY < timestamp) {
          // Trigger the swipe out
          if (lookDirection.current === "LEFT") {
            setSwipeClass("left");
          } else {
            setSwipeClass("right");
          }

          // Prevent further gaze checks until we reset
          lookDirection.current = "STOP";
          startLookTime.current = Infinity;

          // Wait for the CSS transition (200ms),
          // then remove the old image, reveal the next, and reset
          setTimeout(() => {
            setSwipeClass(""); // reset the swipe
            setCurrentImg(nextImg); // move next -> current
            setNextImg(getRandomImageUrl()); // pick a fresh next
            lookDirection.current = "RESET";
          }, 200);
        }
      })
      .showVideoPreview(true)
      .showPredictionPoints(true)
      .begin();

    // Cleanup on unmount
    return () => {
      //   webgazer.end();
      //   webgazer.pause();
      // <---- Use pause instead of end
      try {
        webgazer.end();
      } catch (error) {
        console.warn("Error ending WebGazer:", error);
      }
    };
  }, [leftCutoff, rightCutoff, nextImg]);

  // Decide transform based on swipeClass
  let currentTransform = "translateX(0)";
  if (swipeClass === "left") currentTransform = "translateX(-100vw)";
  if (swipeClass === "right") currentTransform = "translateX(100vw)";

  return (
    <div className="webgazer-wrapper">
      <div className="img-container">
        {/* CURRENT image (visible & swiping) */}
        <img
          src={currentImg}
          alt="Current"
          className={`random-image ${swipeClass}`}
          style={{ transform: currentTransform }}
        />
        {/* NEXT image (hidden behind current until swap) */}
        <img
          src={nextImg}
          alt="Next"
          className="random-image"
          style={{ display: swipeClass ? "none" : "none" }}
        />
      </div>
    </div>
  );
}
