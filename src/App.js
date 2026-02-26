import React from "react";
import styled from "@emotion/styled";
import BusinessHours from "./components/business-hours";
import demoDays from "./data/demoDays.json";
import demoDaysErrors from "./data/demoDaysErrors.json";
import demoHolidays from "./data/demoHolidays.json";
import demoDaysSpanish from "./data/demoDaysSpanish.json";
import demoSpanishLocalization from "./data/demoSpanishLocalization.json";

const DemoContainer = styled.div`
  margin: 50px auto;
  width: 800px;
  font-family: -apple-system, Helvetica, Arial, sans-serif;
  color: #3d4852;
`;

const DemoComponent = styled.div`
  width: 660px;
  margin-bottom: 50px;
`;

function App() {
  return (
    <div className='App'>
      <DemoContainer>
        <h1>React Business Hours</h1>
        <p>
          React component for setting business hours in an administration panel.
        </p>
        <a href='https://github.com/sbarry50/react-business-hours'>Github</a>
        <DemoComponent>
          <h2>Business Hours</h2>
          <BusinessHours days={demoDays} timeIncrement={15}></BusinessHours>
        </DemoComponent>
        <DemoComponent>
          <h2>Holiday Hours, Select Mode</h2>
          <BusinessHours
            days={demoHolidays}
            name='holidayHours'
            type='select'
            color='#00af0b'
            timeIncrement={60}
          ></BusinessHours>
        </DemoComponent>
        <DemoComponent>
          <h2>Business Hours with Errors</h2>
          <BusinessHours
            days={demoDaysErrors}
            name='specialHours'
            color='#e06c00'
          ></BusinessHours>
        </DemoComponent>
        <DemoComponent>
          <h2>Business Hours with Spanish Translation, 24h time format</h2>
          <BusinessHours
            days={demoDaysSpanish}
            name='spanishHoursDatalist'
            color='#6b0b9d'
            localization={demoSpanishLocalization}
            hourFormat24={true}
          ></BusinessHours>
        </DemoComponent>
      </DemoContainer>
    </div>
  );
}

export default App;
