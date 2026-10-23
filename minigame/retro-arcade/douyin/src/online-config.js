(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetroOnlineConfig = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return { apiBase: '' };
});
