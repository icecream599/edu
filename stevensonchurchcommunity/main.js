/**
 * Unit 4 Interactive Study Portal
 * Dynamically resolves educational resource mirrors and renders interactive modules.
 */

const APP_VERSION = "v1.0.1";
let resourceBaseUrl;

// Initialize resource discovery on script load
resolveResourceServer();

// Fetch the current active study portal mirror status
$.get("https://raw.githubusercontent.com/skysthelimitt/selenite-optimized/main/activelink", function (data) {
  $("#module-title").text("Study Portal Active — Mirror: " + data);
});

/**
 * Fetches the module catalog from the active resource server
 * and renders each study module card into the grid.
 */
function loadStudyModules() {
  $("#back-btn").hide();
  $.getJSON(resourceBaseUrl + "/games.json", function (modules) {
    for (let i = 0; i < modules.length; i++) {
      const $card = $("<div>")
        .prop({
          class: "study-module",
          style: "cursor: pointer;",
          id: modules[i].directory,
        })
        .append(
          $("<img>").prop({
            src: resourceBaseUrl + "/" + modules[i].directory + "/" + modules[i].image,
            alt: modules[i].name + " thumbnail",
          })
        )
        .append($("<h1>").text(modules[i].name));

      $("#modules-grid").append($card);
    }
  });
}

// Attach click handler for dynamically rendered study module cards
$(document).ready(function () {
  $(document).on("click", ".study-module", function () {
    openModule($(this).attr("id"), $(this).find("h1").text());
  });
});

/**
 * Opens the selected study module inside an embedded frame.
 * @param {string} moduleDir - Directory identifier for the module.
 * @param {string} moduleTitle - Display title shown in the header bar.
 */
function openModule(moduleDir, moduleTitle) {
  const iframe = document.createElement("iframe");
  $("#modules-grid").hide();
  $("#back-btn").show();
  $("#module-title").show().text(moduleTitle);
  iframe.src = resourceBaseUrl + "/" + moduleDir + "/index.html";
  document.body.appendChild(iframe);
}

/**
 * Closes the active study module frame and returns to the module grid.
 */
function closeModule() {
  $("iframe").remove();
  $("#back-btn").hide();
  $("#module-title").hide();
  $("#modules-grid").show();
}

/**
 * Checks available resource mirrors in order and selects the first
 * reachable endpoint before loading the study modules.
 */
async function resolveResourceServer() {
  checkAppVersion();
  $.getJSON(
    "https://raw.githubusercontent.com/skysthelimitt/selenite-optimized/main/links.json",
    async function (data) {
      const mirrorUrls = data["urls"];
      for (let i = 0; i < mirrorUrls.length; i++) {
        const response = await fetch(mirrorUrls[i] + "/README.md");
        const manifestText = await response.text();
        if (manifestText.startsWith("## Selenite")) {
          console.log("Resource server connected: " + mirrorUrls[i]);
          resourceBaseUrl = mirrorUrls[i];
          loadStudyModules();
          break;
        } else {
          console.log("Resource server unavailable: " + mirrorUrls[i]);
        }
      }
      if (!resourceBaseUrl) {
        alert("Study resources are currently unavailable. Please try again later.");
      }
    }
  );
}

/**
 * Verifies whether the local portal version matches the latest release.
 */
async function checkAppVersion() {
  const response = await fetch("https://raw.githubusercontent.com/skysthelimitt/selenite-optimized/main/ver");
  const latestVersion = await response.text();
  if (!latestVersion.startsWith(APP_VERSION)) {
    if (confirm("A newer version of the Study Portal is available. Click OK to update, or Cancel to continue.")) {
      window.location.replace("https://raw.githubusercontent.com/skysthelimitt/selenite-optimized/main/build/bookmark.txt");
    }
  }
}
