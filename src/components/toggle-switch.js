import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import "../styles/toggle-switch.css";

const ToggleSwitchInner = styled.span`
  &:before {
    background-color: ${(props) => props.color};
  }
`;

const ToggleSwitch = ({
  id,
  Name,
  Text = ["Yes", "No"],
  onChange,
  currentValue,
  defaultChecked,
  switchWidth,
  disabled,
  color,
}) => {
  const handleChange = () => {
    if (typeof onChange === "function") onChange();
  };

  return (
    <div className="toggle-switch" style={{ width: switchWidth }}>
      <input
        type="checkbox"
        name={Name}
        className="toggle-switch-checkbox"
        id={id}
        checked={currentValue}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      {id ? (
        <label className="toggle-switch-label" htmlFor={id}>
          <ToggleSwitchInner
            className={
              disabled
                ? "toggle-switch-inner toggle-switch-disabled"
                : "toggle-switch-inner"
            }
            color={color}
            data-yes={Text[0]}
            data-no={Text[1]}
          />
          <span
            className={
              disabled
                ? "toggle-switch-switch toggle-switch-disabled"
                : "toggle-switch-switch"
            }
          />
        </label>
      ) : null}
    </div>
  );
};

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  Text: PropTypes.array,
  Name: PropTypes.string,
  onChange: PropTypes.func,
  defaultChecked: PropTypes.bool,
  switchWidth: PropTypes.number,
  currentValue: PropTypes.bool,
  disabled: PropTypes.bool,
  color: PropTypes.string,
};

export default ToggleSwitch;
