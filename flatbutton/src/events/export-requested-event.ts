/**
 * Fired by `export-panel` when its button is clicked.
 * `flatbutton-viewer` listens on `document` and exports its current
 * mesh as an STL file.
 */
export class ExportRequestedEvent extends Event {
  static readonly eventName = 'export-requested';

  constructor() {
    super(ExportRequestedEvent.eventName, { bubbles: true, composed: true });
  }
}

/**
 * Needed so listeners get `ExportRequestedEvent` typed, not the generic
 * `Event`. TypeScript wouldn't otherwise know `'export-requested'` maps to it.
 */
declare global {
  interface HTMLElementEventMap {
    // For listening directly on the dispatching element.
    'export-requested': ExportRequestedEvent;
  }

  interface DocumentEventMap {
    // For `flatbutton-viewer`'s `document.addEventListener`.
    'export-requested': ExportRequestedEvent;
  }
}
