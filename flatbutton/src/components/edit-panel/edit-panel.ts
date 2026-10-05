import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { ParamsChangedEvent } from '../../events/params-changed-event.js';
import {
  type ButtonParams,
  type CaptionPosition,
  defaultButtonParams,
} from '../../interfaces/button-params.js';
import { styles } from './edit-panel.styles.js';

/**
 * `edit-panel`'s whole deal is to dispatch changed values so our model
 * can update accordingly.
 */
@customElement('edit-panel')
export class EditPanel extends LitElement {
  static styles = styles;

  @state()
  private params: ButtonParams = { ...defaultButtonParams };

  private onWidthInput = this.createParamInputHandler('innerWidth', Number);
  private onHeightInput = this.createParamInputHandler('innerHeight', Number);
  private onHoleWidthInput = this.createParamInputHandler('holeWidth', Number);
  private onHoleHeightInput = this.createParamInputHandler(
    'holeHeight',
    Number,
  );
  private onThicknessInput = this.createParamInputHandler('thickness', Number);
  private onColorInput = this.createParamInputHandler(
    'color',
    (value: string) => value,
  );
  private onCaptionPositionChange = this.createParamInputHandler(
    'captionPosition',
    (value: string) => value as CaptionPosition,
  );

  private createParamInputHandler<K extends keyof ButtonParams>(
    key: K,
    parse: (value: string) => ButtonParams[K],
  ) {
    return (e: Event) => {
      const value = parse(
        (e.target as HTMLInputElement | HTMLSelectElement).value,
      );

      this.params = { ...this.params, [key]: value };
      this.dispatchEvent(new ParamsChangedEvent(this.params));
    };
  }

  protected render() {
    const {
      innerWidth,
      innerHeight,
      holeWidth,
      holeHeight,
      color,
      thickness,
      captionPosition,
    } = this.params;

    return html`
      <div class="field">
        <label for="innerWidth">Breite</label>
        <input
          id="innerWidth"
          .value=${String(innerWidth)}
          @input=${this.onWidthInput}
          min="5"
          max="60"
          type="range"
        />

        <output for="innerWidth">${innerWidth}</output>
      </div>

      <div class="field">
        <label for="innerHeight">Höhe</label>
        <input
          id="innerHeight"
          .value=${String(innerHeight)}
          @input=${this.onHeightInput}
          min="5"
          max="60"
          type="range"
        />

        <output for="innerHeight">${innerHeight}</output>
      </div>

      <div class="field">
        <label for="holeWidth">Loch-Breite</label>
        <input
          id="holeWidth"
          .value=${String(holeWidth)}
          @input=${this.onHoleWidthInput}
          min="2"
          max="60"
          type="range"
        />

        <output for="holeWidth">${holeWidth}</output>
      </div>

      <div class="field">
        <label for="holeHeight">Loch-Höhe</label>
        <input
          id="holeHeight"
          .value=${String(holeHeight)}
          @input=${this.onHoleHeightInput}
          min="2"
          max="60"
          type="range"
        />

        <output for="holeHeight">${holeHeight}</output>
      </div>

      <div class="field">
        <label for="color">Farbe</label>
        <input
          id="color"
          .value=${color}
          @input=${this.onColorInput}
          type="color"
        />

        <output for="color">${color}</output>
      </div>

      <div class="field">
        <label for="thickness">Dicke</label>
        <input
          id="thickness"
          .value=${String(thickness)}
          @input=${this.onThicknessInput}
          min="0.2"
          max="3"
          step="0.1"
          type="range"
        />

        <output for="thickness">${thickness}</output>
      </div>

      <div class="field">
        <label for="captionPosition">Caption</label>
        <select
          id="captionPosition"
          .value=${captionPosition}
          @change=${this.onCaptionPositionChange}
        >
          <option value="none">keine</option>
          <option value="left">links</option>
        </select>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edit-panel': EditPanel;
  }
}
