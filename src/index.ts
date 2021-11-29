import './styles.css';

type Page = 'index' | 'breeds';

type PagesByHTML = Exclude<`${Page}.html` | `pages/${Page}.html`, 'pages/index.html' | 'breeds.html'>;

type Path = '/' | 'pages/';

const app = {
  API_BREEDS_URL: `https://dog.ceo/api/breeds/list/all`,
  API_BY_BREED_URL: (breedname) => `https://dog.ceo/api/breed/${breedname}/images`,
  template: document.querySelector('template'),
  appContainer: document.querySelector('#app'),
  sentinelElement: document.getElementById('sentinel'),
  observerAlertSection: document.querySelector('.observer'),
  breedsList: [],

  // fetch for reuse
  apiFetch: async (url: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // fetch and return the first breed image
  fetchBreedImg: async (breed: string) => {
    const breedParam = app.API_BY_BREED_URL(breed);
    const { message = [] } = await app.apiFetch(breedParam);
    const [firstImg = ''] = message;
    return firstImg;
  },

  // fetch & return array of breed images
  fetchAllBreedImages: async (breed: string) => {
    const breedParam = app.API_BY_BREED_URL(breed);
    const { message = [] } = await app.apiFetch(breedParam);
    return message;
  },

  createBreedElement: async (breed: string) => {
    const image = await app.fetchBreedImg(breed);
    const clone = app.template.content.firstElementChild.cloneNode(true) as any;
    const [img, h2, p, button] = <[HTMLImageElement, HTMLHeadingElement, HTMLParagraphElement, HTMLButtonElement]>(
      clone.querySelectorAll('img, h2, p, button')
    );
    button.dataset.breedName = breed;
    h2.textContent = breed.toUpperCase();
    p.textContent = `What a lovely ${breed}!`;
    img.src = image;
    img.alt = breed;

    app.appContainer.appendChild(clone);
  },

  loadBreedsList: async () => {
    const breedsList = await app.apiFetch(app.API_BREEDS_URL);
    return Object.keys(breedsList.message);
  },

  createFirstFiveSections: async (breedsList) => {
    let i = 0;
    while (i < 5 && breedsList.length > 0) {
      i++;
      const breed = breedsList.pop();
      await app.createBreedElement(breed);
    }
    return;
  },

  goToPage: (page: PagesByHTML, queryParams?: string) => {
    console.log(window.location.href + page);
    const url = new URL(window.location.href + page);
    console.log(url.href);
    window.location.href = url.href;
    // console.log(window.location.href, page);
  },

  getBreedNameFromClick: (target: EventTarget) => {
    let breedNameData = '';
    if (target instanceof HTMLButtonElement) {
      breedNameData = target.dataset.breedName;
    } else if (target instanceof SVGElement) {
      const parentButton = target.closest('button');
      breedNameData = parentButton.dataset.breedName;
    }
    return breedNameData;
  },

  // event delegate button clicks for each card;
  buttonEventGoToBreed: () =>
    app.appContainer.addEventListener('click', (event) => {
      const { target } = event;
      const breedName = app.getBreedNameFromClick(target);
      if (breedName !== '') {
        localStorage.setItem('breed-name', breedName);
        app.goToPage('pages/breeds.html', breedName);
      }
    }),

  getPage: () => {
    // from #app data-page in html

    const mainContainer = app.appContainer as HTMLElement;
    const data = mainContainer.dataset.page as Page;
    const page: Page = data;
    switch (page) {
      case 'index': {
        console.log(page);
        app.loadIndexPage();
        return;
      }
      case 'breeds': {
        console.log(page);
        return;
      }
    }
  },

  // init, load breeds and add obeserver for infinite scrolling with doggos!
  loadIndexPage: async () => {
    app.breedsList = await app.loadBreedsList();
    app.breedsList.reverse();
    await app.createFirstFiveSections(app.breedsList);
    app.buttonEventGoToBreed();
    const obsEntries = (entries) => {
      if (entries.length > 0) {
        const [target] = entries;
        if (target.isIntersecting && app.breedsList.length > 0) {
          app.observerAlertSection.classList.add('on');
          app.observerAlertSection.firstElementChild.textContent = 'Observing';
          app.createFirstFiveSections(app.breedsList);
        } else {
          app.observerAlertSection.classList.remove('on');
          app.observerAlertSection.firstElementChild.textContent = 'Observer Off';
        }
      }
    };

    let observer = new IntersectionObserver(obsEntries);
    observer.observe(app.sentinelElement);
  },
};
window.addEventListener('DOMContentLoaded', app.getPage, { once: true });

// console.log(localStorage.getItem('breed-name'));
