import { css } from 'lit';

export const styles = css`
  :host {
    --border-color: lightgrey;
    display: block;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin: 0 0 1rem;
    padding: 1rem;
  }

  fieldset:last-child {
    margin-bottom: 0;
  }

  legend {
    padding-inline: 0.25rem;
    font-weight: 600;
  }

  .hint {
    margin: 0;
    color: gray;
    font-size: 0.85rem;
  }

  .field {
    display: grid;
    grid-template-columns: 5rem 1fr 6rem;
    align-items: center;
    gap: 0.5rem;
  }

  label {
    white-space: nowrap;
  }

  output,
  .value {
    display: flex;
    justify-content: end;
    gap: 0.25rem;
    font-variant-numeric: tabular-nums slashed-zero;
  }

  input[type='number'] {
    width: 3rem;
    margin-inline-start: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font: inherit;
    text-align: right;
  }
`;
