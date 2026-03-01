import '@testing-library/jest-dom/vitest'
import '@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill'
import '@atlaskit/pragmatic-drag-and-drop-unit-testing/dom-rect-polyfill'

// happy-dom doesn't support Element.getAnimations() used by svelte/animate flip
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function () {
    return []
  }
}
