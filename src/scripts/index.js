import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement, likeCard, unlikeCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  changeLikeCardStatus,
  getUserInfo,
  getCardList,
  setUserInfo,
  updateUserAvatar,
  addCard,
  deleteCardFromServer,
} from "./components/api.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM-узлы
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_add");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const avatarFormModalWindow = document.querySelector(".popup_type_avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

let currentUserId = "";

// Универсальная функция отображения процесса загрузки на кнопке
const renderLoading = (isLoading, buttonElement, initialText = "Сохранить") => {
  if (isLoading) {
    if (initialText === "Создать") {
      buttonElement.textContent = "Создание...";
    } else if (initialText === "Да") {
      buttonElement.textContent = "Удаление...";
    } else {
      buttonElement.textContent = "Сохранение...";
    }
  } else {
    buttonElement.textContent = initialText;
  }
};

// Просмотр картинки в модальном окне
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Удаление карточки (без подтверждения, т.к. модального окна нет)
const handleDeleteCard = (cardElement, cardId) => {
  deleteCardFromServer(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
    });
};

// Отправка формы профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton, "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;

      profileForm.reset();
      clearValidation(profileForm, validationConfig);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении данных профиля:", err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Сохранить");
    });
};

// Отправка формы аватара
const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton, "Сохранить");

  updateUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

      avatarForm.reset();
      clearValidation(avatarForm, validationConfig);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Сохранить");
    });
};

// Отправка формы добавления карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton, "Создать");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId
        )
      );

      cardForm.reset();
      clearValidation(cardForm, validationConfig);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при создании карточки:", err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Создать");
    });
};

// Обработчик лайка
const handleLikeClick = (likeButton, isLiked, cardId, likeCountElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      likeCountElement.textContent = updatedCardData.likes.length;

      const isNowLiked = updatedCardData.likes.some(
        (like) => like._id === currentUserId
      );

      if (isNowLiked) {
        likeCard(likeButton);
      } else {
        unlikeCard(likeButton);
      }
    })
    .catch((err) => {
      console.error("Ошибка при обновлении лайка:", err);
    });
};

// Слушатели форм
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

// Открытие модального окна редактирования профиля
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

// Открытие модального окна обновления аватара
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

// Открытие модального окна добавления карточки
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

// Первичная загрузка данных с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    currentUserId = userData._id;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeClick,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId
        )
      );
    });
  })
  .catch((err) => {
    console.error("Ошибка при первичной загрузке данных:", err);
  });

// Настройка обработчиков закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);