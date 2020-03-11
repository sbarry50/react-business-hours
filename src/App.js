import React from "react";
// import styled from "@emotion/styled";
import BusinessHours from "./components/business-hours";
import demoDays from "./data/demoDays.json";
import "./App.css";

function App() {
  return (
    <div className='App'>
      <div className='demo-container'>
        <h1>React Business Hours</h1>
        <p>
          React component for setting business hours in an administration panel.
        </p>
        <a href='https://github.com/sbarry50/vue-BusinessHours'>Github</a>
        <div className='demo-component'>
          <h2>Business Hours</h2>
          <BusinessHours days={demoDays} time-increment={15}></BusinessHours>
        </div>
      </div>
    </div>
  );
}

export default App;
