import React from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import uniqid from "uniqid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import BusinessHoursInput from "./business-hours-input";
import ToggleSwitch from "./toggle-switch";
import helpers from "../utils/helpers";

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
  width: 30px;
  height: 30px;
  font-size: 1.5rem;
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
  font-size: 1rem;
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
      hours: this.props.hours,
      validations: this.initValidations(props.hours, props.day)
    };
    this.handleChange = this.handleChange.bind(this);
    this.addRow = this.addRow.bind(this);
    this.removeRow = this.removeRow.bind(this);
  }

  componentDidMount() {
    this.runValidations(this.state.hours);
  }

  handleChange(whichTime, index, e) {
    const value = helpers.backendInputFormat(
      e.target.value,
      this.props.localization,
      this.props.hourFormat24
    );
    if (value === "24hrs") {
      this.removeExtraHours();
      this.setState({
        hours: [
          {
            open: value,
            close: value
          }
        ]
      });
      this.runValidations(this.state.hours);
      this.updateHours();
      return;
    }
    if (
      (this.state.hours[index].open === "24hrs" ||
        this.state.hours[index].close === "24hrs") &&
      value === ""
    ) {
      this.setState({
        hours: {
          [index]: {
            open: value,
            close: value
          }
        }
      });
      this.runValidations(this.state.hours);
      this.updateHours();
      return;
    }
    if (
      !helpers.onlyOneRow(this.state.hours) &&
      value === "" &&
      ((whichTime === "open" && this.state.hours[index].close === "") ||
        (whichTime === "close" && this.state.hours[index].open === ""))
    ) {
      this.removeRow(index);
      this.runValidations(this.state.hours);
      this.updateHours();
      return;
    }
    this.setState({
      hours: {
        [index]: {
          [whichTime]: value
        }
      }
    });
    this.runValidations(this.state.hours);
    this.updateHours();
  }

  addRow() {
    const hours = this.state.hours;

    hours.push({
      id: uniqid(),
      open: "",
      close: "",
      isOpen: true
    });

    this.setState({ hours: hours });
    this.runValidations(this.state.hours);
    this.updateHours();
  }

  removeRow(index) {
    const hours = this.state.hours;
    if (index !== -1) {
      hours.splice(index, 1);
      this.setState({ hours: hours });
    }
    this.runValidations(this.state.hours);
    this.updateHours();
  }

  errors = {
    open: {
      invalidInput: this.props.localization.open.invalidInput,
      greaterThanNext: this.props.localization.open.greaterThanNext,
      lessThanPrevious: this.props.localization.open.lessThanPrevious,
      midnightNotLast: this.props.localization.open.midnightNotLast
    },
    close: {
      invalidInput: this.props.localization.close.invalidInput,
      lessThanPrevious: this.props.localization.close.lessThanPrevious,
      greaterThanNext: this.props.localization.close.greaterThanNext,
      midnightNotLast: this.props.localization.close.midnightNotLast
    }
  };

  defaultValidation = {
    invalidInput: false,
    greaterThanNext: false,
    lessThanPrevious: false,
    midnightNotLast: false
  };

  defaultValidations() {
    return {
      anyErrors: false,
      open: this.defaultValidation,
      close: this.defaultValidation
    };
  }

  initValidations(hours, day) {
    const validations = [];

    hours.forEach((hour, index) => {
      validations[index] = this.defaultValidations();
    });

    return validations;
  }

  isValidInput(input) {
    return (
      helpers.isValidBackendTime(input) ||
      input === "2400" ||
      input === "24hrs" ||
      input === ""
    );
  }

  resetValidations(hours) {
    let validations = [];

    hours.forEach((hour, index) => {
      validations[index] = this.defaultValidations();
    });

    this.setState({
      validations: validations
    });
  }

  runValidations(hours) {
    let inputNum = 1;

    this.resetValidations(hours);

    hours.forEach((hour, index) => {
      this.runValidation(hours, hour.open, index, inputNum, "open");
      inputNum++;
      this.runValidation(hours, hour.close, index, inputNum, "close");
      inputNum++;
    });

    this.updateAnyErrors();
  }

  runValidation(hours, value, index, inputNum, whichTime) {
    if (helpers.isValidBackendTime(value)) {
      this.setState({
        validations: {
          [index]: {
            [whichTime]: this.runInputValidation(
              hours,
              value,
              index,
              inputNum,
              this.totalInputs(hours)
            )
          }
        }
      });
    }

    this.setState({
      validations: {
        [index]: {
          [whichTime]: {
            invalidInput: !this.isValidInput(value)
          }
        }
      }
    });

    this.updateAdjacentValidations(hours, index, whichTime, inputNum);
  }

  runInputValidation(hours, value, index, inputNum, totalInputs) {
    const prevTime = helpers.getPrevious(hours, index, inputNum);
    const nextTime = helpers.getNext(hours, index, inputNum, totalInputs);
    let validations = this.defaultValidation;

    validations.midnightNotLast =
      value === "2400" && !helpers.isLastInput(inputNum, totalInputs)
        ? true
        : false;

    if (prevTime === undefined) {
      validations.greaterThanNext =
        value >= nextTime && nextTime !== "" ? true : false;
    } else if (nextTime === undefined) {
      validations.lessThanPrevious =
        value <= prevTime && prevTime !== "" ? true : false;
    } else {
      validations.lessThanPrevious =
        value <= prevTime && prevTime !== "" ? true : false;
      validations.greaterThanNext =
        value >= nextTime && nextTime !== "" ? true : false;
    }

    return validations;
  }

  updateAdjacentValidations(hours, index, whichTime, inputNum) {
    const totalInputs = this.totalInputs(hours);
    const prevIndex = index - 1;
    const nextIndex = index + 1;
    const currentValidations = this.state.validations[index][whichTime];
    let prevValidations = helpers.getPrevious(
      this.state.validations,
      index,
      inputNum
    );

    let nextValidations = helpers.getNext(
      this.state.validations,
      index,
      inputNum,
      totalInputs,
      whichTime,
      this.props.day
    );

    if (prevValidations !== undefined) {
      if (currentValidations.lessThanPrevious) {
        prevValidations.greaterThanNext = true;
      } else if (!currentValidations.lessThanPrevious) {
        prevValidations.greaterThanNext = false;
      }
    }

    if (nextValidations !== undefined) {
      if (currentValidations.greaterThanNext) {
        nextValidations.lessThanPrevious = true;
      } else if (!currentValidations.greaterThanNext) {
        nextValidations.lessThanPrevious = false;
      }
    }

    if (!helpers.isFirstInput(inputNum) && whichTime === "open") {
      this.setState({
        validations: {
          [prevIndex]: {
            close: prevValidations
          }
        }
      });
    } else if (whichTime === "close") {
      this.setState({
        validations: {
          [index]: {
            open: prevValidations
          }
        }
      });
    }

    if (!helpers.isLastInput(inputNum, totalInputs) && whichTime === "close") {
      this.setState({
        validations: {
          [nextIndex]: {
            open: nextValidations
          }
        }
      });
    } else if (whichTime === "open") {
      this.setState({
        validations: {
          [index]: {
            close: nextValidations
          }
        }
      });
    }
  }

  updateAnyErrors() {
    this.state.validations.forEach((validation, index) =>
      this.setState({
        validations: {
          [index]: {
            anyErrors: this.anyErrors(validation)
          }
        }
      })
    );
  }

  anyErrors(validation) {
    return this.anyError(validation.open) || this.anyError(validation.close);
  }

  anyError(validation) {
    console.log(this.props.day);
    console.log(validation);
    return Object.keys(validation).some(key => {
      return validation[key] === true;
    });
  }

  activeErrors(index) {
    const validations = this.state.validations[index];
    let errors = [];

    Object.keys(validations).forEach(key => {
      if (typeof validations[key] === "object") {
        let validation = validations[key];
        Object.keys(validation)
          .filter(key => {
            return validation[key] === true;
          })
          .forEach(error => {
            errors.push({
              whichTime: key,
              error: error
            });
          });
      }
    });

    return errors;
  }

  errorMessage(whichTime, error) {
    return this.errors[whichTime][error];
  }

  totalInputs(hours) {
    return hours.length * 2;
  }

  isOpenToday() {
    return this.state.hours[0].isOpen;
  }

  anyOpen() {
    return this.state.hours.some(hour => {
      return hour.isOpen === true;
    });
  }

  removeExtraHours() {
    const hours = this.state.hours;
    hours.splice(1);
    this.setState({
      hours: hours
    });
  }

  inputNum(whichTime, index) {
    if (whichTime === "open") {
      return index * 2 + 1;
    } else if (whichTime === "close") {
      return index * 2 + 2;
    }
  }

  toggleOpen() {
    this.setState({
      hours: [
        {
          isOpen: this.state.hours[0] ? false : true
        }
      ]
    });
  }

  resetHours() {
    this.removeExtraHours();
    this.setState({
      hours: [
        {
          open: "",
          close: ""
        }
      ]
    });
    this.updateHours();
  }

  showDay(index) {
    return index > 0 ? false : true;
  }

  showRemoveButton() {
    return this.state.hours.length > 1 ? true : false;
  }

  showAddButton(index) {
    return this.state.hours.length === index + 1 &&
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
      ? true
      : false;
  }

  updateHours() {
    const updatedHours = { [this.props.day]: this.state.hours };
    this.props.hoursChange(updatedHours);
  }

  render() {
    const hours = this.state.hours;
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
        {hours.map(({ open, close, id, isOpen }, index) => (
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
                  width: 130px;
                `}
                role='cell'
              >
                {this.showDay(index) && (
                  <ToggleSwitch
                    id={id}
                    Name={day}
                    Text={[localization.switchOpen, localization.switchClosed]}
                    onChange={() => {
                      this.toggleOpen();
                      this.resetHours();
                      this.runValidations(hours);
                    }}
                    currentValue={this.anyOpen()}
                    switchWidth={switchWidth}
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
                    totalInputs={this.totalInputs(hours)}
                    day={day}
                    hours={hours}
                    timeIncrement={timeIncrement}
                    selectedTime={open}
                    whichHour='open'
                    localization={localization}
                    hourFormat24={hourFormat24}
                    onTimeChange={e => this.handleChange("open", index, e)}
                    anyError={this.anyError(validations[index].open)}
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
                    totalInputs={this.totalInputs(hours)}
                    day={day}
                    hours={hours}
                    timeIncrement={timeIncrement}
                    selectedTime={close}
                    whichHour='close'
                    localization={localization}
                    hourFormat24={hourFormat24}
                    onTimeChange={e => this.handleChange("open", index, e)}
                    anyError={this.anyError(validations[index].close)}
                  ></BusinessHoursInput>
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
  localization: PropTypes.object.isRequired
};

export default BusinessHoursDay;
