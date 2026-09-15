const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "ab82f449-11e5-45c5-80a3-7c46d60f7740",
    "Content-Type": "application/json",
  },
};

// Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

// Получение данных пользователя с сервера
export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, { 
    headers: config.headers, 
  }).then(getResponseData);  
}; 

// Получение списка карточек с сервера
export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, { 
    headers: config.headers, 
  }).then(getResponseData);  
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
}; 

// Обновление аватара пользователя
export const updateUserAvatar = ({ avatar }) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar,
    }),
  }).then(getResponseData);
};

// Добавление новой карточки
export const addCard = ({ name, link }) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name,
      link,
    }),
  }).then(getResponseData);
};

// Удаление карточки с сервера
export const deleteCardFromServer = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};

// Постановка и снятие лайка карточки
export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: config.headers,
  }).then(getResponseData);
};

