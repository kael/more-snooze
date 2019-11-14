/* global document, window, Components, MozXULElement */

'use strict';

Components.utils.import('resource://gre/modules/Preferences.jsm');

const prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
const prefsList = [
  { name: 'cb_05m', label: '&moreSnooze.cb_05m;', value: 5 },
  { name: 'cb_10m', label: '&moreSnooze.cb_10m;', value: 10 },
  { name: 'cb_15m', label: '&moreSnooze.cb_15m;', value: 15 },
  { name: 'cb_20m', label: '&moreSnooze.cb_20m;', value: 20 },
  { name: 'cb_30m', label: '&moreSnooze.cb_30m;', value: 30 },
  { name: 'cb_40m', label: '&moreSnooze.cb_40m;', value: 40 },
  { name: 'cb_50m', label: '&moreSnooze.cb_50m;', value: 50 },
  { name: 'cb_01h', label: '&moreSnooze.cb_01h;', value: 60 },
  { name: 'cb_02h', label: '&moreSnooze.cb_02h;', value: 120 },
  { name: 'cb_03h', label: '&moreSnooze.cb_03h;', value: 180 },
  { name: 'cb_06h', label: '&moreSnooze.cb_06h;', value: 360 },
  { name: 'cb_09h', label: '&moreSnooze.cb_09h;', value: 540 },
  { name: 'cb_12h', label: '&moreSnooze.cb_12h;', value: 720 },
  { name: 'cb_15h', label: '&moreSnooze.cb_15h;', value: 900 },
  { name: 'cb_01d', label: '&moreSnooze.cb_01d;', value: 1440 },
  { name: 'cb_02d', label: '&moreSnooze.cb_02d;', value: 2880 },
  { name: 'cb_03d', label: '&moreSnooze.cb_03d;', value: 4320 },
  { name: 'cb_04d', label: '&moreSnooze.cb_04d;', value: 5760 },
  { name: 'cb_05d', label: '&moreSnooze.cb_05d;', value: 7200 },
  { name: 'cb_01w', label: '&moreSnooze.cb_01w;', value: 10080 },
  { name: 'cb_02w', label: '&moreSnooze.cb_02w;', value: 20160 },
];

function newMenuItem(item) {
  return (
    MozXULElement.parseXULToFragment(
      `<menuitem label="${item.label}" value="${item.value}" oncommand="snoozeItem(event)" />`,
      [ 'chrome://moresnooze/locale/moresnooze.dtd' ]
    )
  );
}

function buildCustomSnoozeMenu(menus) {
  const selectedPrefs = prefsList.filter(pref => prefs.getBoolPref(`extensions.moresnooze.${pref.name}`));

  menus.forEach((menu) => {
    const items = menu.querySelectorAll('menuitem:not(.unit-menuitem)');
    items.forEach((item) => { item.parentNode.removeChild(item); });

    selectedPrefs.slice().reverse().forEach((pref) => {
      menu.prepend(newMenuItem({ label: pref.label, value: pref.value }));
    });
  });
}

function pollSnoozeMenus() {
  const menus = document.querySelectorAll('[is="calendar-snooze-popup"]');

  if(menus.length < 2) {
    window.requestAnimationFrame(pollSnoozeMenus);
  } else {
    buildCustomSnoozeMenu(menus);
  }
}

const myPrefObserver = {
  register() {
    const prefService = Components.classes['@mozilla.org/preferences-service;1']
                                  .getService(Components.interfaces.nsIPrefService);

    this.branch = prefService.getBranch('extensions.moresnooze.');

    if (!('addObserver' in this.branch)){
      this.branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
    }

    this.branch.addObserver('', this, false);
  },

  unregister() {
    this.branch.removeObserver('', this);
  },

  observe() {
    pollSnoozeMenus();
  }
};

myPrefObserver.register();
pollSnoozeMenus();
