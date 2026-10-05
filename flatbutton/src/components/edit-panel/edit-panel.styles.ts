import { css } from 'lit';

export const styles = css`
  :host {
    --border-color: lightgrey;
  }

  .field {
    display: grid;
    grid-template-columns: 4rem 1fr 3rem;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border-color);
    padding: 1rem;
  }
`;
