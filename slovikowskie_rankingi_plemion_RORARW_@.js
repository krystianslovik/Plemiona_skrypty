// ==UserScript==
// @name         Pobierz ranking plemienia RORARW
// @version      0.1
// @description  Pobierz ranking plemion RORARW, zapisuje w pliku csv. Ustaw offset i STRONY w zależności od potrzeb (linia 97 i 98)
// @author       slovik-
// @match        https://*.plemiona.pl/game.php?village=*&screen=ranking&mode=kill_ally*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=plemiona.pl
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Function to parse ally.txt data
  function parseAllyTextData(text) {
    let rows = text.split("\n");
    let allyData = {};

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i].trim();

      if (row !== "") {
        let columns = row.split(",");
        let id = columns[0];
        let allyName = decodeURIComponent(columns[1].replace(/\+/g, "%20"));
        let points = columns[6].replace(",", ".");

        allyData[allyName] = { id: id, points: points };
      }
    }

    return allyData;
  }

  // Function to convert HTML table to CSV format
  function convertTableToCSV(table, allyData) {
    let rows = Array.from(table.querySelectorAll("tr:not(:first-child)"));
    let csvContent = "Ally Name,Ally ID,Points\n";

    rows.forEach((row) => {
      let allyName = row.querySelector("td:nth-child(2) a").textContent.trim();
      let points = row
        .querySelector("td:nth-child(3)")
        .textContent.trim()
        .replace(",", ".");

      let decodedAllyName = decodeURIComponent(allyName).replace(/\+/g, " ");
      let allyId = allyData[decodedAllyName]?.id || "";

      let csvRow = `"${decodedAllyName}","${allyId}","${points}"\n`;
      csvContent += csvRow;
    });

    return csvContent;
  }

  // Function to download CSV file
  function downloadCSV(csvContent, fileName) {
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  // Function to fetch and process data for a specific type and offset
  function processTypeAndOffset(type, offset, allyData) {
    let url = `https://${game_data.world}.plemiona.pl/game.php?village=6986&screen=ranking&mode=kill_ally&offset=${offset}&type=${type}`;

    return fetch(url)
      .then((response) => response.text())
      .then((html) => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        let table = doc.querySelector(
          "#content_value > table > tbody > tr > td:nth-child(2) > table:nth-child(3)"
        );

        if (table) {
          let csvContent = convertTableToCSV(table, allyData);
          let fileName = `ally_data_${type}_${offset}.csv`;
          downloadCSV(csvContent, fileName);
        }
      })
      .catch((error) => console.error("An error occurred:", error));
  }

  // Create and append the download button
  function createDownloadButton() {
    let button = document.createElement("button");
    button.className = "btn";
    button.innerText = "Pobierz";

    button.addEventListener("click", function () {
      // Make an HTTP request to ally.txt
      fetch(`https://${game_data.world}.plemiona.pl/map/ally.txt`)
        .then((response) => response.text())
        .then((text) => {
          let allyData = parseAllyTextData(text);

          // Fetch data for each type and offset
          let types = ["att", "def", "support", "all"];
          let offsets = [0, 25]; // edit this to change the offsets (pages, each page has 25 rows)

          types.forEach((type) => {
            offsets.forEach((offset) => {
              setTimeout(() => {
                processTypeAndOffset(type, offset, allyData);
              }, offset * 200); // Delay each request by 200ms
            });
          });
        })
        .catch((error) => console.error("An error occurred:", error));
    });

    // Append the button to the page
    let container = document.querySelector("#content_value > table");
    container.insertBefore(button, container.firstChild);
  }
  // Wait for the page to load and create the download button
  window.addEventListener("load", createDownloadButton);
})();
