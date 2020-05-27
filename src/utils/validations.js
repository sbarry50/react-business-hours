import helpers from "./helpers";

export default {
  defaultValidations: function() {
    return {
      open: this.defaultValidation(),
      close: this.defaultValidation(),
      anyErrors: false
    };
  },
  defaultValidation: function() {
    return {
      invalidInput: false,
      greaterThanNext: false,
      lessThanPrevious: false,
      midnightNotLast: false
    };
  },
  resetValidations: function(hours) {
    const validations = [];

    for (let i = 0; i < hours.length; i++) {
      validations[i] = this.defaultValidations();
    }

    return validations;
  },
  runValidations: function(hours) {
    const totalInputs = helpers.totalInputs(hours);
    let inputNum = 1;
    let validations = this.resetValidations(hours);

    hours.forEach((hour, index) => {
      validations[index].open = this.runInputValidation(
        hour.open,
        hours,
        index,
        inputNum,
        totalInputs
      );

      validations = this.updateAdjacentValidations(
        validations,
        index,
        "open",
        inputNum,
        totalInputs
      );

      inputNum++;

      validations[index].close = this.runInputValidation(
        hour.close,
        hours,
        index,
        inputNum,
        helpers.totalInputs(hours)
      );

      validations = this.updateAdjacentValidations(
        validations,
        index,
        "close",
        inputNum,
        totalInputs
      );

      inputNum++;

      validations[index].anyErrors = this.anyErrors(validations[index]);
    });

    return validations;
  },
  runValidation: function(
    value,
    hours,
    validations,
    index,
    inputNum,
    whichTime
  ) {
    if (helpers.isValidBackendTime(value)) {
      validations[index][whichTime] = this.runInputValidation(
        value,
        hours,
        index,
        inputNum,
        helpers.totalInputs(hours)
      );
    }

    validations[index][whichTime].invalidInput = !helpers.isValidInput(value);

    validations = this.updateAdjacentValidations(
      hours,
      validations,
      index,
      whichTime,
      inputNum
    );

    return validations;
  },
  runInputValidation: function(value, hours, index, inputNum, totalInputs) {
    const prevTime = helpers.getPrevious(hours, index, inputNum);
    const nextTime = helpers.getNext(hours, index, inputNum, totalInputs);
    let validation = this.defaultValidation();

    if (value === "24hrs") {
      validation.greaterThanNext = validation.lessThanPrevious = false;
      return validation;
    }

    validation.midnightNotLast =
      value === "2400" && !helpers.isLastInput(inputNum, totalInputs);
    if (prevTime === undefined) {
      validation.greaterThanNext = value >= nextTime && nextTime !== "";
    } else if (nextTime === undefined) {
      validation.lessThanPrevious =
        value <= prevTime && value !== "" && prevTime !== "";
    } else {
      validation.lessThanPrevious =
        value <= prevTime && value !== "" && prevTime !== "";
      validation.greaterThanNext = value >= nextTime && nextTime !== "";
    }

    validation.invalidInput = !helpers.isValidInput(value);
    return validation;
  },
  updateAdjacentValidations: function(
    validations,
    index,
    whichTime,
    inputNum,
    totalInputs
  ) {
    const prevIndex = index - 1;
    const nextIndex = index + 1;
    const currentValidations = validations[index][whichTime];
    let prevValidations = helpers.getPrevious(validations, index, inputNum);
    let nextValidations = helpers.getNext(
      validations,
      index,
      inputNum,
      totalInputs
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
      validations[prevIndex].close = prevValidations;
    } else if (whichTime === "close") {
      validations[index].open = prevValidations;
    }

    if (!helpers.isLastInput(inputNum, totalInputs) && whichTime === "close") {
      validations[nextIndex].open = nextValidations;
    } else if (whichTime === "open") {
      validations[index].close = nextValidations;
    }

    return validations;
  },
  anyErrors: function(validation) {
    return this.anyError(validation.open) || this.anyError(validation.close);
  },
  anyError: function(validation) {
    return Object.keys(validation).some(key => {
      return validation[key] === true;
    });
  }
};
