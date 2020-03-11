import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import moment from "moment";
import helpers from "../utils/helpers";

const Input = styled.input`
  margin: 1px;
  padding: 3px 5px;
  width: 110px;
  height: 28px;
  font-size: 14px;
  line-height: 28px;
  vertical-align: middle;
  border: 1px solid #d5d5d5;
  box-sizing: border-box;
`;

const Select = styled.select`
  margin: 1px;
  padding: 3px 5px;
  width: 110px;
  height: 28px;
  font-size: 14px;
  line-height: 28px;
  vertical-align: middle;
  border: 1px solid #d5d5d5;
  box-sizing: border-box;
`;

class BusinessHoursInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: this.props.selectedTime,
      times: []
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      times: this.generateTimes(this.props.timeIncrement)
    });
  }

  handleChange(e) {
    this.setState({
      selectedTime: e.target.value
    });
    this.props.onTimeChange(e.target.value);
  }

  defaultText() {
    return this.props.whichHour === "open"
      ? this.props.localization.placeholderOpens
      : this.props.localization.placeholderCloses;
  }

  optionName() {
    return (
      this.props.name +
      "[" +
      this.props.day +
      "][" +
      this.props.index +
      "][" +
      this.props.whichHour +
      "]"
    );
  }

  filteredTimes() {
    let prevTime = helpers.getPrevious(
        this.props.hours,
        this.props.index,
        this.props.inputNum
      ),
      nextTime = helpers.getNext(
        this.props.hours,
        this.props.index,
        this.props.inputNum,
        this.props.totalInputs
      ),
      filteredTimes = this.state.times;

    if (!helpers.isFirstRow(this.props.index) && prevTime === "") {
      prevTime = helpers.getPrevious(
        this.props.hours,
        this.props.index,
        this.props.inputNum - 1
      );
    }

    if (helpers.isFirstInput(this.props.inputNum)) {
      filteredTimes = this.getFiltered("before", nextTime, filteredTimes);
    } else if (
      helpers.isLastInput(this.props.inputNum, this.props.totalInputs)
    ) {
      filteredTimes = this.getFiltered("after", prevTime, filteredTimes);
    } else {
      filteredTimes = this.getFiltered("before", nextTime, filteredTimes);
      filteredTimes = this.getFiltered("after", prevTime, filteredTimes);
    }

    return filteredTimes;
  }

  showMidnightOption() {
    return (
      helpers.isLastRow(this.props.index, this.props.hours) &&
      this.props.whichHour === "close" &&
      this.props.hours[this.props.index].close !== "24hrs"
    );
  }

  formatTime(time, hourFormat24) {
    return moment(time, "HHmm").format(hourFormat24 ? "HH:mm" : "hh:mm A");
  }

  generateTimes(timeIncrement) {
    let currentTime = "0000",
      times = [];

    do {
      times.push(currentTime);
      currentTime = moment(currentTime, "HHmm")
        .add(timeIncrement, "minutes")
        .format("HHmm");
    } while (currentTime !== "0000");

    return times;
  }

  getFiltered(when, adjacentTime, collection) {
    if (
      helpers.isLastInput(this.props.inputNum, this.props.totalInputs) &&
      this.props.hours[this.props.index].open === ""
    ) {
      collection = collection.filter(value => value > adjacentTime);
      collection.shift();
      return collection;
    }

    if (adjacentTime === "") {
      return collection;
    }

    if (when === "before") {
      collection = collection.filter(value => value < adjacentTime);
    } else if (when === "after") {
      collection = collection.filter(value => value > adjacentTime);
    }

    return collection;
  }

  formattedTime() {
    return helpers.frontendInputFormat(
      this.state.selectedTime,
      this.props.localization,
      this.props.hourFormat24
    );
  }

  datalistID() {
    return (
      this.props.name.replace("_", "-") +
      "-" +
      this.props.day +
      "-" +
      this.props.index +
      "-" +
      this.props.whichHour
    );
  }

  render() {
    const selected = this.state.selectedTime;
    const name = this.props.name;
    const type = this.props.type;
    const index = this.props.index;
    const hours = this.props.hours;
    const localization = this.props.localization;
    const hourFormat24 = this.props.hourFormat24;
    const anyError = this.props.anyError;
    return (
      <>
        {type === "select" ? (
          <Select name={name} onChange={this.handleChange}>
            {helpers.isFirstRow(index) && helpers.onlyOneRow(hours) && (
              <option value>{this.defaultText()}</option>
            )}
            {helpers.isFirstRow(index) && (
              <option value='24hrs'>{localization.t24hours}</option>
            )}
            {this.filteredTimes().map(time => (
              <option key={time} value={time} selected={time === selected}>
                {this.formatTime(time, hourFormat24)}
              </option>
            ))}
            {this.showMidnightOption() && (
              <option value='2400'>{localization.midnight}</option>
            )}
          </Select>
        ) : (
          <div>
            <Input
              style={{ border: anyError ? "solid #e3342f 1px" : "" }}
              type='text'
              list={this.datalistID()}
              placeholder={this.defaultText()}
              onChange={this.handleChange}
              value={this.formattedTime()}
            />
            <datalist id={this.datalistID()}>
              {helpers.isFirstRow(index) && (
                <option>{localization.t24hours}</option>
              )}
              {this.filteredTimes().map(time => (
                <option key={time}>
                  {this.formatTime(time, hourFormat24)}
                </option>
              ))}
              {this.showMidnightOption() && (
                <option>{localization.midnight}</option>
              )}
            </datalist>
            <input name={this.optionName()} type='hidden' value={selected} />
          </div>
        )}
      </>
    );
  }
}

BusinessHoursInput.propTypes = {
  name: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
  hours: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  inputNum: PropTypes.number.isRequired,
  totalInputs: PropTypes.number.isRequired,
  selectedTime: PropTypes.string.isRequired,
  whichHour: PropTypes.string.isRequired,
  timeIncrement: PropTypes.number.isRequired,
  localization: PropTypes.object.isRequired,
  hourFormat24: PropTypes.bool.isRequired,
  anyError: PropTypes.bool.isRequired
};

export default BusinessHoursInput;
