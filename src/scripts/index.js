/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement, likeCard, unlikeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { changeLikeCardStatus, getUserInfo, getCardList, setUserInfo, updateUserAvatar, addCard, deleteCardFromServer } from "./components/api.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible"
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoDlContainer = infoModalWindow.querySelector(".popup__info");
const infoUlContainer = infoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const infoUserPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;

let cardToDeleteElement = null;
let cardToDeleteId = null;

let currentUserId = "";

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const deleteCard = (cardElement, cardId) => {
  cardToDeleteElement = cardElement;       
  cardToDeleteId = cardId;                 
  openModalWindow(removeCardModalWindow);   
};

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

const formatDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoRow = (label, value) => {
  const rowElement = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true);
  rowElement.querySelector(".popup__info-term").textContent = label;
  rowElement.querySelector(".popup__info-description").textContent = value;
  return rowElement;
};

const createUserBadge = (userName) => {
  const badgeElement = infoUserPreviewTemplate.querySelector(".popup__list-item").cloneNode(true);
  badgeElement.textContent = userName;
  return badgeElement;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;

      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении данных профиля:", err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Сохранить");
    });
}; 

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton);

  updateUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err); 
    })
    .finally(() => {
      renderLoading(false, submitButton, "Сохранить");
    });
};

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
            onDeleteCard: deleteCard,
            onInfoCard: handleInfoClick,
          },
          currentUserId 
        )
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при создании карточки:", err); 
    })
    .finally(() => {
      renderLoading(false, submitButton, "Создать");
    });
};

const handleLikeClick = (likeButton, isLiked, cardId, likeCountElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      likeCountElement.textContent = updatedCardData.likes.length;
      
      const isNowLiked = updatedCardData.likes.some((like) => like._id === currentUserId);
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

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      infoDlContainer.innerHTML = "";
      infoUlContainer.innerHTML = "";

      infoDlContainer.append(createInfoRow("Описание:", cardData.name));
      infoDlContainer.append(createInfoRow("Дата создания:", formatDate(new Date(cardData.createdAt))));
      infoDlContainer.append(createInfoRow("Владелец:", cardData.owner.name));
      infoDlContainer.append(createInfoRow("Количество лайков:", cardData.likes.length));

      if (cardData.likes.length > 0) {
        cardData.likes.forEach((user) => {
          infoUlContainer.append(createUserBadge(user.name));
        });
      } else {
        infoUlContainer.append(createUserBadge("Пока никто не лайкнул"));
      }

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при получении данных карточки:", err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

removeCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  if (!cardToDeleteId || !cardToDeleteElement) return;

  const submitButton = evt.target.querySelector(".popup__button");
  renderLoading(true, submitButton, "Да");

  deleteCardFromServer(cardToDeleteId)
    .then(() => {
      cardToDeleteElement.remove();
      closeModalWindow(removeCardModalWindow);
      
      cardToDeleteElement = null;
      cardToDeleteId = null;
    })
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Да");
    });
});

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

// отображение карточек
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
            onDeleteCard: deleteCard,
            onInfoCard: handleInfoClick,
          },
          currentUserId 
        )
      );
    });
  })
  .catch((err) => {
    console.error("Ошибка при первичной загрузке данных:", err);
  }); 

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);


