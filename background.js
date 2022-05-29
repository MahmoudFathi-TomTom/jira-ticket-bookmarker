var currentTab;

// Name of the projects in Jira
const projects = ["NDSENG", "OM2NDS", "HCP3MAP", "NDSIMP"];

// Name of the supported websites to bookmark
const websites = new Map();
websites.set('https://jira.tomtomgroup.com', 'Jira');
websites.set('https://jenkins-eng.nds.tomtom.com', 'EngJenkins');
websites.set('http://nds-jenkins.ttg.global', 'OpsJenkins');

function getTicketId(url) {
  for (var i=0; i<projects.length; i++) {
    var re = new RegExp(projects[i] + '-[0-9]{1,6}');
    if (re.test(url)) {
      var match = re.exec(url);
      return match[0];
    }
  }
  return null;
}

function getBookmarkPrefix(url) {
  for (let [k, v] of websites) {
    console.log("Key: " + k);
    console.log("Value: " + v);
    if (url.startsWith(k)) {
      return v;
    }
  }
  return 'Unknown';
}

function findBookmarkByTitle(bookmarkTitle) {
  let searching = browser.bookmarks.search({title: bookmarkTitle});
  
  return searching.then((bookmarkItems) => {
    if (bookmarkItems[0]) {
      return bookmarkItems[0].id;
    } else {
      return null;
    }
  });
}

function createFolderIfNotExists(folderName) {
  return findBookmarkByTitle(folderName).then((folderId) => {
    if (folderId != null) {
      return folderId;
    } else {
      return browser.bookmarks.create({title: folderName}).then((folder) => {
        return folder.id;
      });
    }
  });
}

function bookmarkIfNotExists(bookmarkTitle, bookmarkUrl, bookmarkParentId) {
  return findBookmarkByTitle(bookmarkTitle).then((bookmarkId) => {
    if (bookmarkId != null) {
      return bookmarkId;
    } else {
      return browser.bookmarks.create({title: bookmarkTitle, url: bookmarkUrl, parentId: bookmarkParentId}).then((bm) => {
        return bm.id;
      });
    }
  });
}

function process() {
  console.log('process');
  let ticketId = getTicketId(currentTab.url);
  if (ticketId != null) {
    Promise.resolve(createFolderIfNotExists(ticketId)).then(function(folderId) {
      console.log(folderId);
      bookmarkPrefix = getBookmarkPrefix(currentTab.url);
      bookmarkTitle = bookmarkPrefix + ' ' + ticketId;
      bookmarkIfNotExists(bookmarkTitle, currentTab.url, folderId);
    });
  } else {
    console.log('Defined projects not found in the URL.');
  }
}

browser.browserAction.onClicked.addListener(process);

/*
 * Switches currentTab and currentBookmark to reflect the currently active tab
//  */
function updateActiveTab(tabs) {

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();