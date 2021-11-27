import "./styles.css";
const API_BREEDS_URL = `https://dog.ceo/api/breeds/list/all`;
const API_BY_BREED_URL = (breedname) =>
  `https://dog.ceo/api/breed/${breedname}/images`;
const template = document.querySelector("template");
const appContainer = document.querySelector("#app");
const sentinel = document.getElementById("sentinel");
const observerAlertSection = document.querySelector(".observer");
let breedsList = [];

const apiFetch = async (url) => {
  const res = await fetch(url);
  if (res.ok) {
    const json = await res.json();
    return json;
  } else {
    return [];
  }
};

const fetchBreedImg = async (breed) => {
  const breedParam = API_BY_BREED_URL(breed);
  const { message = [] } = await apiFetch(breedParam);
  const [firstImg = ""] = message;
  return firstImg;
};

async function createBreedElement(breed) {
  const image = await fetchBreedImg(breed);
  const clone = template.content.firstElementChild.cloneNode(true);
  console.log(clone.childNodes);
  const [img, figcaption] = clone.querySelectorAll("img, figcaption");
  img.src = image;
  img.alt = breed;
  figcaption.textContent = `The name of this breed is: ${breed}`;
  appContainer.appendChild(clone);
}

const loadBreedsList = (async () => {
  const breedsList = await apiFetch(API_BREEDS_URL);
  return Object.keys(breedsList.message);
})();

const createFirstFiveSections = async (breedsList) => {
  let i = 0;
  while (i < 5 && breedsList.length > 0) {
    i++;
    const breed = breedsList.pop();
    await createBreedElement(breed);
  }
  return;
};

(async () => {
  breedsList = await loadBreedsList;
  breedsList.reverse();
  await createFirstFiveSections(breedsList);
  const obsEntries = (entries) => {
    if (entries.length > 0) {
      const [target] = entries;
      if (target.isIntersecting && breedsList.length > 0) {
        observerAlertSection.classList.add("on");
        observerAlertSection.firstElementChild.textContent = "Observing";
        // const breed = breedsList.pop();
        // createBreedElement(breed);
        createFirstFiveSections(breedsList);
      } else {
        observerAlertSection.classList.remove("on");
        observerAlertSection.firstElementChild.textContent = "Observer Off";
      }
    }
  };

  let observer = new IntersectionObserver(obsEntries);
  observer.observe(sentinel);
})();
