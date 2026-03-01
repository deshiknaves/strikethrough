import '@testing-library/jest-dom/vitest'

// jsdom doesn't support Element.getAnimations() used by svelte/animate flip
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function () {
    return []
  }
}
