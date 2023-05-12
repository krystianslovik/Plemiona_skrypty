//let tribeNames = ['Krasnale', 'NAZWA PLEMIONA 2']; // Lista plemion
async function findVillages(tribeNames, filters) {
  let parseData = (data) =>
    data
      .split("\n")
      .filter((line) => line.trim() !== "") // usunięcie pustych linii
      .map((line) => line.split(","));

  let [allyData, playerData, villageData] = await Promise.all([
    fetch(`https://${game_data.world}.plemiona.pl/map/ally.txt`)
      .then((res) => res.text())
      .then(parseData),
    fetch(`https://${game_data.world}.plemiona.pl/map/player.txt`)
      .then((res) => res.text())
      .then(parseData),
    fetch(`https://${game_data.world}.plemiona.pl/map/village.txt`)
      .then((res) => res.text())
      .then(parseData),
  ]);

  let tribeData = allyData.filter((tribe) =>
    tribeNames.includes(decodeURIComponent(tribe[1].replace(/\+/g, " ")))
  );

  tribeNames.forEach((name) => {
    if (
      !tribeData.find(
        (tribe) => decodeURIComponent(tribe[1].replace(/\+/g, " ")) === name
      )
    ) {
      alert(`Nie znaleziono plemienia ${name}`);
    }
  });

  let tribeIds = tribeData.map((tribe) => tribe[0]);
  let playerIds = playerData
    .filter((player) => tribeIds.includes(player[2]))
    .map((player) => player[0]);

  // bez filtrowania
  // let villageList = villageData
  //     .filter(village => playerIds.includes(village[4]))
  //     .map(village => `${village[2]}|${village[3]}`)
  //     .join(' ');
  let villageList = villageData
    .filter((village) => playerIds.includes(village[4]))
    .filter((village) => {
      let x = parseInt(village[2]);
      let y = parseInt(village[3]);
      let points = parseInt(village[5]);

      return (
        (filters.xMin === 0 || x >= filters.xMin) &&
        (filters.xMax === 0 || x <= filters.xMax) &&
        (filters.yMin === 0 || y >= filters.yMin) &&
        (filters.yMax === 0 || y <= filters.yMax) &&
        (filters.pointsMin === 0 || points >= filters.pointsMin) &&
        (filters.pointsMax === 0 || points <= filters.pointsMax)
      );
    })
    .map((village) => `${village[2]}|${village[3]}`)
    .join(" ");

  return villageList;
}

// Użycie
//findVillages(tribeNames).then(console.log);

// Wstawiamy GUI do Dialog.show
Dialog.show(
  "tribeFinder",
  `
      <style>
      .inputSmall {
          width: 55px;
      }
      .divContent {
        display: flex; 
        justify-content: space-around; 
        align-items: center; 
        text-align:center; 
        flex-direction: column;
      }
      </style>
      <div class="divContent">
        <div> 
          <h3>SlovikowskieWioski XD</h3>
          <fieldset>
          <legend>Dodaj plemiona</legend>
          <div id="inputFields">
              <input type="text" placeholder="Nazwa plemienia" style="margin: 5px 5px 0 5px;"/>
          </div>
          <button id="addFieldButton" class ="btn" style="margin 5px !important;">Dodaj</button>
          </div>
          <div id="filterFields">
          <fieldset>
          <legend>X</legend>
              <input type="number" id="xMin" placeholder="X min" class="inputSmall" />
              <input type="number" id="xMax" placeholder="X max" class="inputSmall" />
          </fieldset>        <fieldset>
          <legend>Y</legend>
              <input type="number" id="yMin" placeholder="Y min" class="inputSmall" />
              <input type="number" id="yMax" placeholder="Y max" class="inputSmall" />
              </fieldset>        <fieldset>
          <legend>Punkty</legend>
              <input type="number" id="pointsMin" placeholder="Pkt min" class="inputSmall" />
              <input type="number" id="pointsMax" placeholder="Pkt max" class="inputSmall" />
              </fieldset>
          </div>
      </div>
          </fieldset>
          <div class="divContent">
          <button id="generateButton" class="btn" style="margin: 5px !important;">WYGENERUJ LISTE WIOSEK</button>
          <textarea id="resultArea" rows="10" style="display:block;"></textarea>
          </div>
      </div>
  `
);

// Liczba pól do wprowadzania danych
let fieldCount = 1;

// Dodajemy event listener do przycisku dodawania pól
// document.getElementById('addFieldButton').addEventListener('click', () => {
//     if (fieldCount < 5) {
//         let newField = document.createElement('input');
//         newField.type = 'text';
//         newField.style.marginTop = '5px';
//         newField.placeholder = `Nazwa plemienia ${fieldCount + 1}`;
//         document.getElementById('inputFields').appendChild(newField);
//         fieldCount++;
//     } else {
//         alert('Maksymalna liczba plemion to 5. Nie mozna dodac wiecej (sory BIMy xD)');
//     }
// });

// Wczytanie listy plemion
let tribes = [];
fetch(`https://${game_data.world}.plemiona.pl/map/ally.txt`)
  .then((response) => response.text())
  .then((data) => {
    let lines = data.split("\n");
    for (let line of lines) {
      let parts = line.split(",");
      tribes.push(decodeURIComponent(parts[1].replace(/\+/g, " ")));
    }
  });

// ...

// Dodawanie autouzupełniania
function autocomplete(input, data) {
  let currentFocus;

  input.addEventListener("input", function (e) {
    let a,
      b,
      i,
      val = this.value;

    closeAllLists();
    if (!val) return false;

    currentFocus = -1;

    a = document.createElement("div");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");

    this.parentNode.appendChild(a);

    for (i = 0; i < data.length; i++) {
      if (data[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
        b = document.createElement("div");
        b.innerHTML = "<strong>" + data[i].substr(0, val.length) + "</strong>";
        b.innerHTML += data[i].substr(val.length);
        b.innerHTML += '<input type="hidden" value="' + data[i] + '">';

        b.addEventListener("click", function (e) {
          input.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });

        a.appendChild(b);
      }
    }
  });

  input.addEventListener("keydown", function (e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode === 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;

    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;

    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

document.getElementById("addFieldButton").addEventListener("click", () => {
  if (fieldCount < 5) {
    let newField = document.createElement("input");
    newField.type = "text";
    newField.style.marginTop = "5px";
    newField.placeholder = `Nazwa plemienia ${fieldCount + 1}`;
    document.getElementById("inputFields").appendChild(newField);
    autocomplete(newField, tribes);
    fieldCount++;
  } else {
    alert(
      "Maksymalna liczba plemion to 5. Nie mozna dodac wiecej (sory BIMy xD)"
    );
  }
});

// Dodajemy autouzupełnianie do pierwszego pola
autocomplete(document.getElementById("inputFields").children[0], tribes);

document.getElementById("generateButton").addEventListener("click", () => {
  let inputFields = Array.from(document.getElementById("inputFields").children);
  let tribeNames = inputFields
    .map((field) => field.value)
    .filter((name) => name !== "");

  let filters = {
    xMin: parseInt(document.getElementById("xMin").value) || 0,
    xMax: parseInt(document.getElementById("xMax").value) || 999,
    yMin: parseInt(document.getElementById("yMin").value) || 0,
    yMax: parseInt(document.getElementById("yMax").value) || 999,
    pointsMin: parseInt(document.getElementById("pointsMin").value) || 0,
    pointsMax: parseInt(document.getElementById("pointsMax").value) || 13000,
  };

  findVillages(tribeNames, filters).then((villageList) => {
    document.getElementById("resultArea").value = villageList;
  });
});
