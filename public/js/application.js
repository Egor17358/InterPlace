const $searchEmailuser = document.forms.searchEmailuser;
const $infoUsers = document.querySelector('[data-info]');
const $titleUsers = document.querySelector('[data-title]');
const $tableRes = document.querySelector('[data-table]');
const $roleUser = document.querySelector('[data-role]');
const $butName = document.querySelector('[data-butName]');
const $check = document.querySelector('.form-check-input');
const $urlForm = document.forms.urlForm;
const $but = document.getElementById('searchPlus');

$searchEmailuser?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const emailInputs = Object.fromEntries(new FormData($searchEmailuser));
  const response = await fetch('/lk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailInputs),
  });
  const data = await response.json();
  const { findUser } = data;
  const { listSearch } = data;
  $titleUsers.innerText = 'Данные пользователя';
  $infoUsers.innerText = `
  Имя: ${findUser.first_name}    
  Фамилия: ${findUser.last_name}
  `;
  $butName.innerText = 'Роль администратора?';
  $roleUser.style.display = 'inherit';
  if (findUser.isadmin) {
    $check.checked = true;
  } else {
    $check.checked = false;
  }
  $check.id = findUser.id;

  while ($tableRes.firstChild) {
    $tableRes.removeChild($tableRes.firstChild);
  }
  listSearch.map((el) => $tableRes.insertAdjacentHTML('beforeend', insertInfo(el.url, el.result, el.createdAt)));
});

$check?.addEventListener('click', async (event) => {
  event.preventDefault();
  const checkActive = $check.checked;
  const response = await fetch('/lk', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: $check.id,
      isadmin: checkActive,
    }),
  });
  const data = await response.json();
  const { isadmin } = data;
  $check.checked = isadmin;
  console.log(data);
});

// HOMEPAGE

const a = '5ae2e3f221c38a28845f05b6e94dd44c91ceac03cdfc62d2a58e3808';

ymaps = window.ymaps;
let myMap;
ymaps.ready(init);

function init() {
  const { geolocation } = ymaps;
  // console.log(geolocation);
  const myMap = new ymaps.Map('map', {
    center: [55.753994, 37.622093],
    zoom: 10,
    controls: ['geolocationControl'],
  }, {
    searchControlProvider: 'yandex#search',
  });

  geolocation.get({
    provider: 'yandex',
    mapStateAutoApply: true,
  }).then((result) => {
    // Красным цветом пометим положение, вычисленное через ip.
    result.geoObjects.options.set('preset', 'islands#redCircleIcon');
    result.geoObjects.get(0).properties.set({
      balloonContentBody: 'Мое местоположение',
    });
    myMap.geoObjects.add(result.geoObjects);
    // console.log(result.geoObjects.position);
  });

  geolocation.get({
    provider: 'browser',
    mapStateAutoApply: true,
  }).then((result) => {
    // Синим цветом пометим положение, полученное через браузер.
    // Если браузер не поддерживает эту функциональность, метка не будет добавлена на карту.
    result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
    // console.log(result.geoObjects);
    myMap.geoObjects.add(result.geoObjects);
  });

  // console.log(myMap);
  $urlForm?.addEventListener('submit', async (e) => {
    try {
      $but.style.display = 'block';
      const $allPostsContainer = document.querySelector('[data-allSearch]');
      e.preventDefault();
      myMap.geoObjects.removeAll();
      let currentLimit = 0;
      $allPostsContainer.innerHTML = '';

      const city = document.getElementById('url').value;
      const response = await fetch(`
      https://api.opentripmap.com/0.1/ru/places/geoname?name=${city}&apikey=${a}
      `);
      const geo = await response.json();
      const { lat, lon } = geo;

      const radius = document.getElementById('radius').value;

      const response2 = await fetch(`
      https://api.opentripmap.com/0.1/ru/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=cultural&apikey=${a}
      `);
      const cultural = await response2.json();
      const newlist = cultural.features;
      const allCult = newlist.filter((elem) => elem.properties.name !== '');

      console.log(allCult);

      // const namePlaces = [];

      // переход по городу из инпута
      const citySearch = document.getElementById('url').value;
      ymaps.geocode(citySearch, {
        /**
         * Опции запроса
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
         */
        // Сортировка результатов от центра окна карты.
        // boundedBy: myMap.getBounds(),
        // strictBounds: true,
        // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
        // Если нужен только один результат, экономим трафик пользователей.
        results: 1,
      }).then((res) => {
        // Выбираем первый результат геокодирования.
        const firstGeoObject = res.geoObjects.get(0);
        // Координаты геообъекта.
        const coords = firstGeoObject.geometry.getCoordinates();
        // Область видимости геообъекта.
        const bounds = firstGeoObject.properties.get('boundedBy');

        firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
        // Получаем строку с адресом и выводим в иконке геообъекта.
        firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

        // Добавляем первый найденный геообъект на карту.
        // myMap.geoObjects.add(firstGeoObject);
        // Масштабируем карту на область видимости геообъекта.
        myMap.setBounds(bounds, {
          // Проверяем наличие тайлов на данном масштабе.
          checkZoomRange: true,
          // zoomMargin: 15,
          // zoom: 15,
        });
      });

      async function showArray() {
        currentLimit += 5;
        for (let i = currentLimit - 5; i < currentLimit && i < allCult.length; i++) {
          console.log(currentLimit);
          const { xid } = allCult[i].properties;
          // console.log(xid);
          const response3 = await fetch(`
        https://api.opentripmap.com/0.1/ru/places/xid/${xid}?apikey=${a}
        `);
          const info = await response3.json();

          let style = '';
          if (!info.preview) {
            style = '';
          } else {
            style = info.preview.source;
          }
          const { wikipedia } = info;
          // console.log(info);
          let text = '';
          if (info.wikipedia_extracts === undefined) {
            text = '';
          } else {
            text = info.wikipedia_extracts.html;
          }
          let addres = '';
          if (!info.address) {
            addres = '';
          } else {
            addres = info.address.suburb;
          }

          myPoint = new ymaps.Placemark([allCult[i].geometry.coordinates[1], allCult[i].geometry.coordinates[0]], {
            balloonContentHeader: allCult[i].properties.name,
            // balloonContentLayout: BalloonContentLayout,
            // balloonPanelMaxMapArea: 0,
            balloonContentBody:
              // `info: ${response3[image]}`,
              `${addres} <br/> <br/> `
              + `wikipedia: <br/> <a href=${wikipedia}>${allCult[i].properties.name}</a> <br/><br/>`
              + `${text} <br/>`
              + `Фото:<br> <img src="${style || ''}" style='height:${style.height && 0}px; weight:${style.weight && 0} '> <br/>`,
          }, {
            preset: 'islands#icon',
            iconColor: '#0095B6',
          });

          myMap.geoObjects
            .add(myPoint);
        }
      }
      showArray();
      console.log(allCult.length);
      // добавление меток на карту
      $but.addEventListener('click', (ev) => {
        console.log(ev);
        ev.stopPropagation();
        showArray();
      });
      $urlForm.reset();
    } catch (error) {
      console.log(error);
    }
  });
}
