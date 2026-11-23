import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { ParamsChangedEvent } from '../../events/params-changed-event.js';
import { minBorderWidth } from '../../geometry/button-shape.js';
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

  private setInnerWidth = this.updateNumberParam('innerWidth');
  private updateInnerWidth = (e: Event) => {
    this.setInnerWidth(e);
    this.clampDependentHoleSize('innerWidth', 'holeWidth');
  };

  private setInnerHeight = this.updateNumberParam('innerHeight');
  private updateInnerHeight = (e: Event) => {
    this.setInnerHeight(e);
    this.clampDependentHoleSize('innerHeight', 'holeHeight');
  };

  private updateHoleWidth = this.updateNumberParam('holeWidth');
  private updateHoleHeight = this.updateNumberParam('holeHeight');
  private updateColor = this.updateParam('color', (target) => target.value);
  private updateCaptionPosition = this.updateParam(
    'captionPosition',
    (target) => target.value as CaptionPosition,
  );

  private updateNumberParam<K extends keyof ButtonParams>(key: K) {
    return this.updateParam(
      key,
      (target) => this.clamp(target.valueAsNumber, target) as ButtonParams[K],
    );
  }

  private clamp(value: number, target: HTMLInputElement) {
    const min = target.min ? Number(target.min) : -Infinity;
    const max = target.max ? Number(target.max) : Infinity;

    return Math.min(Math.max(value, min), max);
  }

  private clampDependentHoleSize(
    innerKey: 'innerWidth' | 'innerHeight',
    holeKey: 'holeWidth' | 'holeHeight',
  ) {
    const max = this.params[innerKey] - minBorderWidth * 2;

    if (this.params[holeKey] > max) {
      this.params = { ...this.params, [holeKey]: max };
      this.dispatchEvent(new ParamsChangedEvent(this.params));
    }
  }

  private updateParam<K extends keyof ButtonParams>(
    key: K,
    extract: (target: HTMLInputElement & HTMLSelectElement) => ButtonParams[K],
  ) {
    return (e: Event) => {
      const value = extract(e.target as HTMLInputElement & HTMLSelectElement);

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
      captionPosition,
    } = this.params;

    const maxHoleWidth = innerWidth - minBorderWidth * 2;
    const maxHoleHeight = innerHeight - minBorderWidth * 2;

    return html`
      <fieldset>
        <legend>Außenmaße</legend>

        <div class="field">
          <label for="innerWidth">Breite</label>
          <input
            id="innerWidth"
            .value=${String(innerWidth)}
            @input=${this.updateInnerWidth}
            min="5"
            max="60"
            type="range"
          />

          <span class="value">
            <input
              type="number"
              aria-label="Breite genau eingeben"
              .value=${String(innerWidth)}
              @input=${this.updateInnerWidth}
              min="5"
              max="60"
            />
            <span>mm</span>
          </span>
        </div>

        <div class="field">
          <label for="innerHeight">Höhe</label>
          <input
            id="innerHeight"
            .value=${String(innerHeight)}
            @input=${this.updateInnerHeight}
            min="5"
            max="60"
            type="range"
          />

          <span class="value">
            <input
              type="number"
              aria-label="Höhe genau eingeben"
              .value=${String(innerHeight)}
              @input=${this.updateInnerHeight}
              min="5"
              max="60"
            />
            <span>mm</span>
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Innenmaße</legend>

        <div class="field">
          <label for="holeWidth">Breite</label>
          <input
            id="holeWidth"
            .value=${String(holeWidth)}
            @input=${this.updateHoleWidth}
            min="10"
            max=${maxHoleWidth}
            type="range"
          />

          <span class="value">
            <input
              type="number"
              aria-label="Breite genau eingeben"
              .value=${String(holeWidth)}
              @input=${this.updateHoleWidth}
              min="10"
              max=${maxHoleWidth}
            />
            <span>mm</span>
          </span>
        </div>

        <div class="field">
          <label for="holeHeight">Höhe</label>
          <input
            id="holeHeight"
            .value=${String(holeHeight)}
            @input=${this.updateHoleHeight}
            min="10"
            max=${maxHoleHeight}
            type="range"
          />

          <span class="value">
            <input
              type="number"
              aria-label="Höhe genau eingeben"
              .value=${String(holeHeight)}
              @input=${this.updateHoleHeight}
              min="10"
              max=${maxHoleHeight}
            />
            <span>mm</span>
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Beschriftung</legend>

        <p class="hint" id="captionPosition-hint">
          Fläche neben dem Button, auf der später Text oder Braille Platz
          findet.
        </p>

        <div class="field">
          <label for="captionPosition">Position</label>
          <select
            id="captionPosition"
            aria-describedby="captionPosition-hint"
            .value=${captionPosition}
            @change=${this.updateCaptionPosition}
          >
            <option value="none">keine</option>
            <option value="left">links</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Aussehen</legend>

        <p class="hint" id="color-hint">
          Nur für die Ansicht hier, hat keinen Einfluss auf den Ausdruck.
        </p>

        <div class="field">
          <label for="color">Farbe</label>
          <input
            .value=${color}
            @input=${this.updateColor}
            id="color"
            aria-describedby="color-hint"
            type="color"
          />

          <output for="color">${color}</output>
        </div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edit-panel': EditPanel;
  }
}
