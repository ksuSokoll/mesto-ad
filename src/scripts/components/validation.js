const showInputError = (formElement, inputElement, errorMessage, config) => {
  if (!inputElement.id) return;
  
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add(config.inputErrorClass);
  
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  }
};

const hideInputError = (formElement, inputElement, config) => {
  if (!inputElement.id) return;
  
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove(config.inputErrorClass);
  
  if (errorElement) {
    errorElement.classList.remove(config.errorClass);
    errorElement.textContent = "";
  }
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage || "Разрешены только буквы, дефисы и пробелы");
  } else {
    inputElement.setCustomValidity("");
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, config);
  } else {
    hideInputError(formElement, inputElement, config);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (buttonElement, config) => {
  if (!buttonElement) return;
  buttonElement.classList.add(config.inactiveButtonClass);
  buttonElement.setAttribute("disabled", true);
};

const enableSubmitButton = (buttonElement, config) => {
  if (!buttonElement) return;
  buttonElement.classList.remove(config.inactiveButtonClass);
  buttonElement.removeAttribute("disabled");
};

const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
};

const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formElement) => {
    formElement.addEventListener("submit", (evt) => {
      evt.preventDefault();
    });
    setEventListeners(formElement, config);
  });
};

export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });

  if (buttonElement) {
    disableSubmitButton(buttonElement, config);
  }
};