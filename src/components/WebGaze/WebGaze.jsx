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
  // For simplicity, we track the current and “next” images in state
  const [currentImg, setCurrentImg] = useState(getRandomImageUrl);
  const [nextImg, setNextImg] = useState(getRandomImageUrl);
  // This class is used to animate the current image out (left/right)
  const [swipeClass, setSwipeClass] = useState("");

  // We'll define our “cutoff” values once. In a more robust setup,
  // you might recompute if the user resizes the browser:
  const leftCutoff = window.innerWidth / 4;
  const rightCutoff = window.innerWidth - window.innerWidth / 4;

  // Refs for ephemeral data (not necessarily re-rendering the component)
  const startLookTime = useRef < Number > Infinity;
  const lookDirection = (useRef < String) | (null > null);

  useEffect(() => {
    // Start WebGazer & set the gaze listener
    webgazer
      .setGazeListener((data, timestamp) => {
        if (!data) return;

        // If we're already in a “swipe” animation, ignore further gaze
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
        // Otherwise, user is looking near the center => reset
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

          // Stop further gaze checks until we reset
          lookDirection.current = "STOP";
          startLookTime.current = Infinity;

          // Wait for CSS transition to finish (200ms or so),
          // then remove the old image, reveal the next, and reset
          setTimeout(() => {
            // Reset the swipe class so the new image is stationary
            setSwipeClass("");
            // Current image becomes next image
            setCurrentImg(nextImg);
            // Generate a new next image
            setNextImg(getRandomImageUrl());
            // Let the user swipe again
            lookDirection.current = "RESET";
          }, 200);
        }
      })
      .showVideoPreview(true)
      .showPredictionPoints(true)
      .begin();

    // Cleanup on component unmount
    return () => {
      webgazer.end();
    };
  }, [leftCutoff, lookDirection, nextImg, rightCutoff, startLookTime]);

  // Apply swipe animation if needed
  let currentTransform = "translateX(0)";
  if (swipeClass === "left") currentTransform = "translateX(-100vw)";
  if (swipeClass === "right") currentTransform = "translateX(100vw)";

  return (
    <div className="webgazer-wrapper">
      <div className="img-container">
        {/* Current image with possible swipe transform */}
        <img
          src={currentImg}
          alt="Current"
          className={`random-image ${swipeClass ? swipeClass : ""}`}
          style={{ transform: currentTransform }}
        />
        {/* Next image hidden behind current */}
        <img
          src={nextImg}
          alt="Next"
          className="random-image"
          style={{ display: swipeClass ? "none" : "none" }}
          // NOTE: In your original code, next image was hidden until the old image is removed.
          // We do a simple `display: none` here. After the transition, we set currentImg -> nextImg.
        />
      </div>
    </div>
  );
}
