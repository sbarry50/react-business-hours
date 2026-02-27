/** @jsxImportSource @emotion/react */
import React, { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { css } from "@emotion/react";
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

const BusinessHoursDay = ({
  day,
  hours: initialHours,
  name,
  timeIncrement,
  type,
  color,
  switchWidth,
  hourFormat24,
  localization,
  hoursChange,
}) => {
  const [hours, setHours] = useState(initialHours);
  const [validations, setValidations] = useState(() =>
    vlds.runValidations(initialHours)
  );

  const hoursRef = useRef(hours);
  hoursRef.current = hours;

  const errors = {
    open: {
      invalidInput: localization.open.invalidInput,
      greaterThanNext: localization.open.greaterThanNext,
      lessThanPrevious: localization.open.lessThanPrevious,
      midnightNotLast: localization.open.midnightNotLast,
    },
    close: {
      invalidInput: localization.close.invalidInput,
      lessThanPrevious: localization.close.lessThanPrevious,
      greaterThanNext: localization.close.greaterThanNext,
      midnightNotLast: localization.close.midnightNotLast,
    },
  };

  const updateState = useCallback(
    (newHours) => {
      setHours(newHours);
      setValidations(vlds.runValidations(newHours));
      hoursChange({ [day]: newHours });
    },
    [day, hoursChange]
  );

  const resetHours = (hrs) => {
    hrs.splice(1);
    hrs[0].open = "";
    hrs[0].close = "";
    return hrs;
  };

  const handleChange = useCallback(
    (whichTime, index, value) => {
      let hrs = [...hoursRef.current.map((h) => ({ ...h }))];

      if (value === "24hrs") {
        hrs = resetHours(hrs);
        hrs[0].open = hrs[0].close = value;
        updateState(hrs);
        return;
      }
      if (
        (hrs[index].open === "24hrs" || hrs[index].close === "24hrs") &&
        value === ""
      ) {
        hrs[index].open = hrs[index].close = value;
        updateState(hrs);
        return;
      }
      if (
        !helpers.onlyOneRow(hrs) &&
        value === "" &&
        ((whichTime === "open" && hrs[index].close === "") ||
          (whichTime === "close" && hrs[index].open === ""))
      ) {
        hrs.splice(index, 1);
        updateState(hrs);
        return;
      }
      hrs[index][whichTime] = value;
      updateState(hrs);
    },
    [updateState]
  );

  const handleToggle = useCallback(() => {
    let hrs = [...hoursRef.current.map((h) => ({ ...h }))];
    hrs = resetHours(hrs);
    hrs[0].isOpen = !hrs[0].isOpen;
    updateState(hrs);
  }, [updateState]);

  const addRow = useCallback(() => {
    const hrs = [...hoursRef.current.map((h) => ({ ...h }))];
    hrs.push({
      id: uniqid(),
      open: "",
      close: "",
      isOpen: true,
    });
    updateState(hrs);
  }, [updateState]);

  const removeRow = useCallback(
    (index) => {
      const hrs = [...hoursRef.current.map((h) => ({ ...h }))];
      if (index !== -1) {
        hrs.splice(index, 1);
      }
      updateState(hrs);
    },
    [updateState]
  );

  const activeErrors = (index) => {
    const vld = validations[index];
    const errs = [];

    Object.keys(vld).forEach((key) => {
      if (typeof vld[key] === "object") {
        const validation = vld[key];
        Object.keys(validation)
          .filter((k) => validation[k] === true)
          .forEach((error) => {
            errs.push({ whichTime: key, error });
          });
      }
    });

    return errs;
  };

  const errorMessage = (whichTime, error) => errors[whichTime][error];

  const isOpenToday = () => hours[0].isOpen;

  const anyOpen = () => hours.some((hour) => hour.isOpen === true);

  const inputNum = (whichTime, index) => {
    if (whichTime === "open") return index * 2 + 1;
    if (whichTime === "close") return index * 2 + 2;
  };

  const showDay = (index) => index === 0;

  const showRemoveButton = () => hours.length > 1;

  const showAddButton = (index) => {
    return (
      hours.length === index + 1 &&
      hours[index].open !== "" &&
      hours[index].close !== "" &&
      hours[index].open !== "24hrs" &&
      hours[index].close !== "24hrs" &&
      !(
        type === "select" &&
        timeIncrement === 15 &&
        hours[index].close === "2345"
      ) &&
      !(
        type === "select" &&
        timeIncrement === 30 &&
        hours[index].close === "2330"
      ) &&
      !(
        type === "select" &&
        timeIncrement === 60 &&
        hours[index].close === "2300"
      ) &&
      hours[index].close !== "2400" &&
      validations[index].anyErrors === false
    );
  };

  return (
    <div>
      {hours.map(({ open, close, id, isOpen }, index) => (
        <div key={id}>
          <FlexRow role="rowgroup">
            <div
              css={css`
                width: 130px;
              `}
              role="cell"
            >
              {showDay(index) && <div>{localization.days[day]}</div>}
            </div>
            <div
              css={css`
                width: 90px;
                margin-right: 20px;
              `}
              role="cell"
            >
              {showDay(index) && (
                <ToggleSwitch
                  id={id}
                  Name={day}
                  Text={[localization.switchOpen, localization.switchClosed]}
                  onChange={handleToggle}
                  currentValue={anyOpen()}
                  switchWidth={switchWidth}
                  color={color}
                />
              )}
            </div>
            {isOpenToday() && (
              <div
                css={css`
                  width: 110px;
                `}
                role="cell"
              >
                <BusinessHoursInput
                  index={index}
                  name={name}
                  type={type}
                  inputNum={inputNum("open", index)}
                  totalInputs={helpers.totalInputs(hours)}
                  day={day}
                  hours={hours}
                  timeIncrement={timeIncrement}
                  selectedTime={open}
                  whichHour="open"
                  localization={localization}
                  hourFormat24={hourFormat24}
                  onTimeChange={(val) => handleChange("open", index, val)}
                  anyError={vlds.anyError(validations[index].open)}
                />
              </div>
            )}
            {isOpenToday() && (
              <div
                css={css`
                  margin: 0 7px;
                  width: 4px;
                `}
                role="cell"
              >
                -
              </div>
            )}
            {isOpenToday() && (
              <div
                css={css`
                  width: 110px;
                `}
                role="cell"
              >
                <BusinessHoursInput
                  index={index}
                  name={name}
                  type={type}
                  inputNum={inputNum("close", index)}
                  totalInputs={helpers.totalInputs(hours)}
                  day={day}
                  hours={hours}
                  timeIncrement={timeIncrement}
                  selectedTime={close}
                  whichHour="close"
                  localization={localization}
                  hourFormat24={hourFormat24}
                  onTimeChange={(val) => handleChange("close", index, val)}
                  anyError={vlds.anyError(validations[index].close)}
                />
              </div>
            )}
            {isOpenToday() && (
              <div
                css={css`
                  display: flex;
                  justify-content: center;
                  width: 50px;
                `}
                role="cell"
              >
                {showRemoveButton() && (
                  <IconButton
                    icon={faTimes}
                    onClick={() => removeRow(index)}
                  />
                )}
              </div>
            )}
            {isOpenToday() && (
              <div
                css={css`
                  width: 20%;
                `}
                role="cell"
              >
                {showAddButton(index) && (
                  <AddHoursButton
                    type="button"
                    style={{ color: color }}
                    onClick={addRow}
                  >
                    {localization.addHours}
                  </AddHoursButton>
                )}
              </div>
            )}
          </FlexRow>
          {validations[index].anyErrors && (
            <ErrorsList>
              {activeErrors(index).map(({ whichTime, error }) => (
                <ErrorsListItem key={whichTime + "." + error}>
                  {errorMessage(whichTime, error)}
                </ErrorsListItem>
              ))}
            </ErrorsList>
          )}
        </div>
      ))}
    </div>
  );
};

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
  hoursChange: PropTypes.func.isRequired,
};

export default BusinessHoursDay;
