import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import BusinessHoursDay from "./business-hours-day";

const Container = styled.div`
  display: block;
  width: 100%;
  font-family: -apple-system, Helvetica, Arial, sans-serif;
  font-size: 15px;
  color: #3d4852;
`;

const BusinessHours = props => {
  return (
    <Container>
      {Object.entries(props.days).map(([day, hours]) => (
        <BusinessHoursDay
          key={day}
          day={day}
          hours={hours}
          name={props.name}
          timeIncrement={props.timeIncrement}
          type={props.type}
          color={props.color}
          switchWidth={props.switchWidth}
          hourFormat24={props.hourFormat24}
          localization={props.localization}
          hoursChange={val => props.updatedValues(val)}
        />
      ))}
    </Container>
  );
};

BusinessHours.propTypes = {
  days: PropTypes.object.isRequired,
  name: PropTypes.string,
  timeIncrement: PropTypes.oneOf([15, 30, 60]),
  type: PropTypes.oneOf(["datalist", "select"]),
  color: PropTypes.string,
  switchWidth: PropTypes.number,
  hourFormat24: PropTypes.bool,
  localization: PropTypes.object,
  updatedValues: PropTypes.func
};

BusinessHours.defaultProps = {
  name: "businessHours",
  timeIncrement: 30,
  type: "datalist",
  color: "#2779bd",
  switchWidth: 90,
  hourFormat24: false,
  localization: {
    switchOpen: "Open",
    switchClosed: "Closed",
    placeholderOpens: "Opens",
    placeholderCloses: "Closes",
    addHours: "Add hours",
    open: {
      invalidInput:
        'Please enter an opening time in the 12 hour format (ie. 08:00 AM). You may also enter "24 hours".',
      greaterThanNext:
        "Please enter an opening time that is before the closing time.",
      lessThanPrevious:
        "Please enter an opening time that is after the previous closing time.",
      midnightNotLast:
        "Midnight can only be selected for the day's last closing time."
    },
    close: {
      invalidInput:
        'Please enter a closing time in the 12 hour format (ie. 05:00 PM). You may also enter "24 hours" or "Midnight".',
      greaterThanNext:
        "Please enter a closing time that is after the opening time.",
      lessThanPrevious:
        "Please enter a closing time that is before the next opening time.",
      midnightNotLast:
        "Midnight can only be selected for the day's last closing time."
    },
    t24hours: "24 hours",
    midnight: "Midnight",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      newYearsEve: 'New Year\'s Eve', // prettier-ignore
      newYearsDay: 'New Year\'s Day', // prettier-ignore
      martinLutherKingJrDay: "Martin Luther King, Jr. Day",
      presidentsDay: 'Presidents\' Day', // prettier-ignore
      easter: "Easter",
      memorialDay: "Memorial Day",
      independenceDay: "Independence Day",
      fourthOfJuly: "4th of July",
      laborDay: "Labor Day",
      columbusDay: "Columbus Day",
      veteransDay: "Veterans Day",
      thanksgivingDay: "Thanksgiving Day",
      christmasEve: "Christmas Eve",
      christmas: "Christmas"
    }
  },
  updatedValues: val => {
    return val;
  }
};

export default BusinessHours;
