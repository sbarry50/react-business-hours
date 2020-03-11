import React from 'react'
import forms from '../utils/forms.js'
import helpers from '../utils/helpers.js'

const BusinessHoursDatalist = props => {
    const formattedTime = () => {
        return this.frontendInputFormat(this.selected);
      };
      const datalistID = () => {
        return (
          this.name.replace('_', '-') +
          '-' +
          this.day +
          '-' +
          this.index +
          '-' +
          this.whichTime
        );
      };
    return (
        <div>
        <input
          className={"time-input " + (anyError ? 'has-error' : '')}
          type="text"
          list={datalistID()}
          placeholder={forms.defaultText()}
          onChange={inputEventHandler()}
          :value="formattedTime"
        />
        <datalist :id="datalistID">
          <option v-if="isFirstRow(index)">{{ localization.t24hours }}</option>
          <option v-for="time in filteredTimes" :key="time">{{
            time | formatTime(hourFormat24)
          }}</option>
          <option v-if="showMidnightOption">{{ localization.midnight }}</option>
        </datalist>
        <input :name="optionName" type="hidden" :value="selected" />
      </div>
    )
}

BusinessHoursDatalist.PropTypes = {
    name: PropTypes.string.isRequired,
    day: PropTypes.string.isRequired,
    hours: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    inputNum: PropTypes.number.isRequired,
    totalInputs: PropTypes.number.isRequired,
    selectedTime: PropTypes.string.isRequired,
    timeIncrement: PropTypes.number.isRequired,
    anyError: PropTypes.bool.isRequired,
    localization: PropTypes.object,
    hourFormat24: PropTypes.bool,
  };

export default BusinessHoursDatalist