export const likeCard = (likeButton) => {
  likeButton.classList.add("card__like-button_is-active");
};

export const unlikeCard = (likeButton) => {
  likeButton.classList.remove("card__like-button_is-active");
};

const getTemplate = () => {
  return document
    .querySelector("#card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  userId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCountElement.textContent = data.likes.length;

  const isLikedByMe = data.likes.some((like) => like._id === userId);

  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () =>
        onDeleteCard(cardElement, data._id)
      );
    }
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const currentLikeStatus = likeButton.classList.contains(
        "card__like-button_is-active"
      );
      onLikeIcon(likeButton, currentLikeStatus, data._id, likeCountElement);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};