import React from "react";
import "./App.css";
// import WebGaze from "./components/WebGaze/WebGaze";
const WebGaze = React.lazy(() => import("./components/WebGaze/WebGaze.jsx"));

function App() {
  return (
    <>
      <React.Suspense fallback={<div>Loading Eye Tracking...</div>}>
        <WebGaze />
      </React.Suspense>
    </>
  );
}

export default App;
