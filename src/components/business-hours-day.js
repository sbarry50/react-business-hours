/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { jsx, css } from "@emotion/core";
import styled from "@emotion/styled";
import uniqid from "uniqid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import BusinessHoursInput from "./business-hours-input";
import ToggleSwitch from "./toggle-switch";
import helpers from "../utils/helpers";
import vlds from "../utils/validations";

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-flow: row nowrap;
  align-items: center;
  margin: 0.75em 0;
  height: 45px;
  width: 100%;
`;

const IconButton = styled(FontAwesomeIcon)`
  width: 25px;
  height: 25px;
  font-size: 1.25rem;
  background-color: transparent;
  border-color: transparent;
  border-style: none;
  border-width: 0;
  padding: 0;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

const AddHoursButton = styled.button`
  font-size: 0.875rem;
  font-weight: bold;
  background-color: transparent;
  border-color: transparent;
  border-style: none;
  border-width: 0;
  padding: 0;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

const ErrorsList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 12px;
  color: #e3342f;
  list-style: none;
`;

const ErrorsListItem = styled.li`
  margin-bottom: 6px;
`;

class BusinessHoursDay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hours: props.hours,
      validations: vlds.runValidations(props.hours),
    };
    // this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.addRow = this.addRow.bind(this);
    this.removeRow = this.removeRow.bind(this);
  }

  componentDidMount() {
    // console.log(this.state.validations);
    // vlds.runValidations(this.state.hours);
  }

  setHours(hours) {
    this.setState({
      hours: hours,
    });
  }

  setValidations(hours) {
    const validations = vlds.runValidations(hours);
    this.setState({
      validations: validations,
    });
  }

  handleChange(whichTime, index, e) {
    let hours = this.state.hours;
    const value = helpers.backendInputFormat(
      e,
      this.props.localization,
      this.props.hourFormat24
    );

    if (value === "24hrs") {
      hours = this.resetHours(hours);
      hours[0].open = hours[0].close = value;
      this.setHours(hours);
      this.setValidations(hours);
      this.updateHours();
      return;
    }
    if (
      (hours[index].open === "24hrs" || hours[index].close === "24hrs") &&
      value === ""
    ) {
      hours[index].open = hours[index].close = value;
      this.setHours(hours);
      this.setValidations(hours);
      this.updateHours();
      return;
    }
    if (
      !helpers.onlyOneRow(hours) &&
      value === "" &&
      ((whichTime === "open" && hours[index].close === "") ||
        (whichTime === "close" && hours[index].open === ""))
    ) {
      this.removeRow(index);
      this.setValidations(hours);
      this.updateHours();
      return;
    }
    hours[index][whichTime] = value;
    this.setHours(hours);
    this.setValidations(hours);
    this.updateHours();
  }

  handleToggle() {
    const hours = this.resetHours(this.state.hours);
    hours[0].isOpen = hours[0].isOpen ? false : true;
    this.setHours(hours);
    this.setValidations(hours);
    this.updateHours();
  }

  addRow() {
    const hours = this.state.hours;

    hours.push({
      id: uniqid(),
      open: "",
      close: "",
      isOpen: true,
    });

    this.setHours(hours);
    this.setValidations(hours);
    this.updateHours();
  }

  removeRow(index) {
    const hours = this.state.hours;
    if (index !== -1) {
      hours.splice(index, 1);
      this.setState({ hours: hours });
    }
    vlds.runValidations(this.state.hours);
    this.updateHours();
  }

  resetHours(hours) {
    hours.splice(1);
    hours[0].open = "";
    hours[0].close = "";

    return hours;
  }

  errors = {
    open: {
      invalidInput: this.props.localization.open.invalidInput,
      greaterThanNext: this.props.localization.open.greaterThanNext,
      lessThanPrevious: this.props.localization.open.lessThanPrevious,
      midnightNotLast: this.props.localization.open.midnightNotLast,
    },
    close: {
      invalidInput: this.props.localization.close.invalidInput,
      lessThanPrevious: this.props.localization.close.lessThanPrevious,
      greaterThanNext: this.props.localization.close.greaterThanNext,
      midnightNotLast: this.props.localization.close.midnightNotLast,
    },
  };

  activeErrors(index) {
    const validations = this.state.validations[index];
    let errors = [];

    Object.keys(validations).forEach((key) => {
      if (typeof validations[key] === "object") {
        let validation = validations[key];
        Object.keys(validation)
          .filter((key) => {
            return validation[key] === true;
          })
          .forEach((error) => {
            errors.push({
              whichTime: key,
              error: error,
            });
          });
      }
    });

    return errors;
  }

  errorMessage(whichTime, error) {
    return this.errors[whichTime][error];
  }

  isOpenToday() {
    return this.state.hours[0].isOpen;
  }

  anyOpen() {
    return this.state.hours.some((hour) => {
      return hour.isOpen === true;
    });
  }

  inputNum(whichTime, index) {
    if (whichTime === "open") {
      return index * 2 + 1;
    } else if (whichTime === "close") {
      return index * 2 + 2;
    }
  }

  showDay(index) {
    return index > 0 ? false : true;
  }

  showRemoveButton() {
    return this.state.hours.length > 1 ? true : false;
  }

  showAddButton(index) {
    return (
      this.state.hours.length === index + 1 &&
      this.state.hours[index].open !== "" &&
      this.state.hours[index].close !== "" &&
      this.state.hours[index].open !== "24hrs" &&
      this.state.hours[index].close !== "24hrs" &&
      !(
        this.props.type === "select" &&
        this.props.timeIncrement === 15 &&
        this.state.hours[index].close === "2345"
      ) &&
      !(
        this.props.type === "select" &&
        this.props.timeIncrement === 30 &&
        this.state.hours[index].close === "2330"
      ) &&
      !(
        this.props.type === "select" &&
        this.props.timeIncrement === 60 &&
        this.state.hours[index].close === "2300"
      ) &&
      this.state.hours[index].close !== "2400" &&
      this.state.validations[index].anyErrors === false
    );
  }

  updateHours() {
    const updatedHours = { [this.props.day]: this.state.hours };
    this.props.hoursChange(updatedHours);
  }

  render() {
    const validations = this.state.validations;
    const day = this.props.day;
    const name = this.props.name;
    const type = this.props.type;
    const color = this.props.color;
    const timeIncrement = this.props.timeIncrement;
    const switchWidth = this.props.switchWidth;
    const hourFormat24 = this.props.hourFormat24;
    const localization = this.props.localization;

    return (
      <div>
        {this.state.hours.map(({ open, close, id, isOpen }, index) => (
          <div key={id}>
            <FlexRow role='rowgroup'>
              <div
                css={css`
                  width: 130px;
                `}
                role='cell'
              >
                {this.showDay(index) && <div>{localization.days[day]}</div>}
              </div>
              <div
                css={css`
                  width: 90px;
                  margin-right: 20px;
                `}
                role='cell'
              >
                {this.showDay(index) && (
                  <ToggleSwitch
                    id={id}
                    Name={day}
                    Text={[localization.switchOpen, localization.switchClosed]}
                    onChange={this.handleToggle}
                    currentValue={this.anyOpen()}
                    switchWidth={switchWidth}
                    color={this.props.color}
                  />
                )}
              </div>
              {this.isOpenToday() && (
                <div
                  css={css`
                    width: 110px;
                  `}
                  role='cell'
                >
                  <BusinessHoursInput
                    index={index}
                    name={name}
                    type={type}
                    inputNum={this.inputNum("open", index)}
                    totalInputs={helpers.totalInputs(this.state.hours)}
                    day={day}
                    hours={this.state.hours}
                    timeIncrement={timeIncrement}
                    selectedTime={open}
                    whichHour='open'
                    localization={localization}
                    hourFormat24={hourFormat24}
                    onTimeChange={this.handleChange.bind(this, "open", index)}
                    anyError={vlds.anyError(validations[index].open)}
                  ></BusinessHoursInput>
                </div>
              )}
              {this.isOpenToday() && (
                <div
                  css={css`
                    margin: 0 7px;
                    width: 4px;
                  `}
                  role='cell'
                >
                  -
                </div>
              )}
              {this.isOpenToday() && (
                <div
                  css={css`
                    width: 110px;
                  `}
                  role='cell'
                >
                  <BusinessHoursInput
                    index={index}
                    name={name}
                    type={type}
                    inputNum={this.inputNum("close", index)}
                    totalInputs={helpers.totalInputs(this.state.hours)}
                    day={day}
                    hours={this.state.hours}
                    timeIncrement={timeIncrement}
                    selectedTime={close}
                    whichHour='close'
                    localization={localization}
                    hourFormat24={hourFormat24}
                    onTimeChange={this.handleChange.bind(this, "close", index)}
                    anyError={vlds.anyError(validations[index].close)}
                  ></BusinessHoursInput>
                </div>
              )}
              {this.isOpenToday() && (
                <div
                  css={css`
                    display: flex;
                    justify-content: center;
                    width: 50px;
                  `}
                  role='cell'
                >
                  {this.showRemoveButton() && (
                    <IconButton
                      icon={faTimes}
                      onClick={this.removeRow.bind(this, index)}
                    />
                  )}
                </div>
              )}
              {this.isOpenToday() && (
                <div
                  css={css`
                    width: 20%;
                  `}
                  role='cell'
                >
                  {this.showAddButton(index) && (
                    <AddHoursButton
                      type='button'
                      style={{ color: color }}
                      onClick={this.addRow}
                    >
                      {localization.addHours}
                    </AddHoursButton>
                  )}
                </div>
              )}
            </FlexRow>
            {validations[index].anyErrors && (
              <ErrorsList>
                {this.activeErrors(index).map(({ whichTime, error }) => (
                  <ErrorsListItem key={whichTime + "." + error}>
                    {this.errorMessage(whichTime, error)}
                  </ErrorsListItem>
                ))}
              </ErrorsList>
            )}
          </div>
        ))}
      </div>
    );
  }
}

BusinessHoursDay.propTypes = {
  day: PropTypes.string.isRequired,
  hours: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  timeIncrement: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  switchWidth: PropTypes.number.isRequired,
  hourFormat24: PropTypes.bool.isRequired,
  localization: PropTypes.object.isRequired,
};

export default BusinessHoursDay;
