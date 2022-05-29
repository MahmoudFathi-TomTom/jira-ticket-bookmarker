"use strict";

// Name of the projects in Jira
const projects = ["NDSENG", "HCP3MAP", "NDSIMP"];

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

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    console.log('Jira ticket ID Copy clipboard successfully updated with: ' + newClip);
  }, function() {
    console.log('Jira ticket ID Copy failed to write to clipboard');
  });
}

browser.runtime.onMessage.addListener(request => {
  try {
    var url = window.location.href;
    var ticketId = getTicketId(url);
    if (ticketId != null) {
      updateClipboard(ticketId);
      browser.bookmarks.create({title: ticketId, url: currentTab.url});
    } else {
      console.log('Jira ticket ID Copy URL containing ticket format not found');
    }
  } catch (error) {
    console.log(error);
  }
});