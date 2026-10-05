import type { ButtonParams } from '../interfaces/button-params.js';

/**
 * Fired by `edit-panel` whenever any `ButtonParams` field changes, carrying
 * the full, updated object. `flatbutton-viewer` listens on `document` and
 * rebuilds its geometry in response.
 */
export class ParamsChangedEvent extends Event {
  static readonly eventName = 'params-changed';

  readonly params: ButtonParams;

  constructor(params: ButtonParams) {
    super(ParamsChangedEvent.eventName, { bubbles: true, composed: true });
    this.params = params;
  }
}

/**
 * Needed so `e.params` type-checks in listeners. Without these, TypeScript
 * wouldn't know `'params-changed'` maps to `ParamsChangedEvent`.
 */
declare global {
  interface HTMLElementEventMap {
    // For listening directly on the dispatching element.
    'params-changed': ParamsChangedEvent;
  }

  interface DocumentEventMap {
    // For `flatbutton-viewer`'s `document.addEventListener`.
    'params-changed': ParamsChangedEvent;
  }
}
