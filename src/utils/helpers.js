import moment from "moment";

export default {
  titleCase: function(str) {
    return str
      .split("-")
      .map(function capitalize(part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  },
  frontendTimeFormat: function(value, hourFormat24) {
    return moment(value, "HHmm").format(hourFormat24 ? "HH:mm" : "hh:mm A");
  },
  backendTimeFormat: function(value) {
    return moment(value, "hh:mm A").format("HHmm");
  },
  isValidFrontendTime: function(value, hourFormat24) {
    return moment(value, hourFormat24 ? "HH:mm" : "hh:mm A", true).isValid();
  },
  isValidBackendTime: function(value) {
    return moment(value, "HHmm", true).isValid();
  },
  isValidInput: function(value) {
    return (
      this.isValidBackendTime(value) ||
      value === "2400" ||
      value === "24hrs" ||
      value === ""
    );
  },
  frontendInputFormat: function(value, localization, hourFormat24) {
    if (value === "24hrs") {
      value = localization.t24hours;
    } else if (value === "2400") {
      value = localization.midnight;
    } else if (this.isValidBackendTime(value)) {
      value = this.frontendTimeFormat(value, hourFormat24);
    } else if (value === "") {
      value = "";
    }

    return value;
  },
  backendInputFormat: function(value, localization, hourFormat24) {
    if (
      value === localization.midnight ||
      value === localization.midnight.toLowerCase()
    ) {
      return "2400";
    } else if (value.toLowerCase() === localization.t24hours.toLowerCase()) {
      return "24hrs";
    } else if (this.isValidFrontendTime(value, hourFormat24)) {
      return this.backendTimeFormat(value);
    } else {
      return value;
    }
  },
  totalInputs: function(hours) {
    return hours.length * 2;
  },
  isEven: function(value) {
    return value % 2 === 0 ? true : false;
  },
  isFirstInput: function(inputNum) {
    return inputNum === 1;
  },
  isLastInput: function(inputNum, totalInputs) {
    return inputNum === totalInputs;
  },
  isFirstRow: function(index) {
    return index === 0;
  },
  isLastRow: function(index, hours) {
    return index === hours.length - 1;
  },
  isMiddleRow: function(index, hours) {
    return !this.isFirstRow(index) && !this.isLastRow(index, hours);
  },
  onlyOneRow: function(hours) {
    return hours.length === 1;
  },
  getPrevious: function(value, index, inputNum) {
    if (inputNum === 1) {
      return;
    }
    return this.isEven(inputNum) ? value[index].open : value[index - 1].close;
  },
  getNext: function(value, index, inputNum, totalInputs) {
    if (inputNum === totalInputs) {
      return;
    }
    return this.isEven(inputNum) ? value[index + 1].open : value[index].close;
  }
};
