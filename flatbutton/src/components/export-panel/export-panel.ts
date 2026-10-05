import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { ExportRequestedEvent } from '../../events/export-requested-event.js';

/**
 * Renders a single button that dispatches `ExportRequestedEvent` on click.
 */
@customElement('export-panel')
export class ExportPanel extends LitElement {
  protected render() {
    return html`
      <button @click=${() => this.dispatchEvent(new ExportRequestedEvent())}>
        STL exportieren
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'export-panel': ExportPanel;
  }
}
