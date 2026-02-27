import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import helpers from "../utils/helpers";

dayjs.extend(customParseFormat);

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

const BusinessHoursInput = ({
  name,
  day,
  hours,
  index,
  inputNum,
  totalInputs,
  selectedTime,
  whichHour,
  timeIncrement,
  type,
  localization,
  hourFormat24,
  onTimeChange,
  anyError,
}) => {
  const times = useMemo(() => {
    let currentTime = "0000";
    const result = [];
    do {
      result.push(currentTime);
      currentTime = dayjs(currentTime, "HHmm")
        .add(timeIncrement, "minutes")
        .format("HHmm");
    } while (currentTime !== "0000");
    return result;
  }, [timeIncrement]);

  const handleChange = useCallback(
    (e) => {
      const value = helpers.backendInputFormat(
        e.target.value,
        localization,
        hourFormat24
      );
      onTimeChange(value);
    },
    [localization, hourFormat24, onTimeChange]
  );

  const formatTime = (time) => {
    return dayjs(time, "HHmm").format(hourFormat24 ? "HH:mm" : "hh:mm A");
  };

  const defaultText = () => {
    return whichHour === "open"
      ? localization.placeholderOpens
      : localization.placeholderCloses;
  };

  const optionName = () => {
    return name + "[" + day + "][" + index + "][" + whichHour + "]";
  };

  const getFiltered = (when, adjacentTime, collection) => {
    if (
      helpers.isLastInput(inputNum, totalInputs) &&
      hours[index].open === ""
    ) {
      collection = collection.filter((value) => value > adjacentTime);
      collection.shift();
      return collection;
    }

    if (adjacentTime === "") {
      return collection;
    }

    if (when === "before") {
      collection = collection.filter((value) => value < adjacentTime);
    } else if (when === "after") {
      collection = collection.filter((value) => value > adjacentTime);
    }

    return collection;
  };

  const filteredTimes = () => {
    let prevTime = helpers.getPrevious(hours, index, inputNum);
    let nextTime = helpers.getNext(hours, index, inputNum, totalInputs);
    let filtered = times;

    if (!helpers.isFirstRow(index) && prevTime === "") {
      prevTime = helpers.getPrevious(hours, index, inputNum - 1);
    }

    if (helpers.isFirstInput(inputNum)) {
      filtered = getFiltered("before", nextTime, filtered);
    } else if (helpers.isLastInput(inputNum, totalInputs)) {
      filtered = getFiltered("after", prevTime, filtered);
    } else {
      filtered = getFiltered("before", nextTime, filtered);
      filtered = getFiltered("after", prevTime, filtered);
    }

    return filtered;
  };

  const showMidnightOption = () => {
    return (
      helpers.isLastRow(index, hours) &&
      whichHour === "close" &&
      hours[index].close !== "24hrs"
    );
  };

  const formattedTime = () => {
    return helpers.frontendInputFormat(selectedTime, localization, hourFormat24);
  };

  const datalistID = () => {
    return (
      name.replace("_", "-") + "-" + day + "-" + index + "-" + whichHour
    );
  };

  return (
    <>
      {type === "select" ? (
        <Select name={name} value={selectedTime} onChange={handleChange}>
          {helpers.isFirstRow(index) && helpers.onlyOneRow(hours) && (
            <option value="">{defaultText()}</option>
          )}
          {helpers.isFirstRow(index) && (
            <option value="24hrs">{localization.t24hours}</option>
          )}
          {filteredTimes().map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
          {showMidnightOption() && (
            <option value="2400">{localization.midnight}</option>
          )}
        </Select>
      ) : (
        <div key={selectedTime}>
          <Input
            style={{ border: anyError ? "solid #e3342f 1px" : "" }}
            type="text"
            list={datalistID()}
            placeholder={defaultText()}
            onBlur={handleChange}
            defaultValue={formattedTime()}
          />
          <datalist id={datalistID()}>
            {helpers.isFirstRow(index) && (
              <option>{localization.t24hours}</option>
            )}
            {filteredTimes().map((time) => (
              <option key={time}>{formatTime(time)}</option>
            ))}
            {showMidnightOption() && (
              <option>{localization.midnight}</option>
            )}
          </datalist>
          <input name={optionName()} type="hidden" value={selectedTime} />
        </div>
      )}
    </>
  );
};

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
  type: PropTypes.string.isRequired,
  localization: PropTypes.object.isRequired,
  hourFormat24: PropTypes.bool.isRequired,
  anyError: PropTypes.bool.isRequired,
  onTimeChange: PropTypes.func.isRequired,
};

export default BusinessHoursInput;
