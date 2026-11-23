import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

import { createRectShape } from '../../geometry/button-shape.js';
import { createLetterGeometry } from '../../geometry/text-shape.js';
import { styles } from './shape-playground.styles.js';

const sceneBackgroundColor = 0xf0f0ee;
const squareWidth = 20;
const squareHeight = 14;
const squareThickness = 2;
const captionWidth = 8;
const stlExporter = new STLExporter();

@customElement('shape-playground')
export class ShapePlayground extends LitElement {
  static styles = styles;

  private containerRef = createRef<HTMLDivElement>();
  private scene?: Scene;

  firstUpdated() {
    const container = this.containerRef.value;

    if (!container) return;

    this.setupScene(container);
  }

  private async setupScene(container: HTMLDivElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new WebGLRenderer({ antialias: true });

    renderer.setSize(width, height, false);
    container.appendChild(renderer.domElement);

    const camera = new PerspectiveCamera(30, width / height, 0.1, 1000);

    camera.position.z = 60;

    this.scene = new Scene();
    this.scene.background = new Color(sceneBackgroundColor);
    this.scene.add(new AmbientLight(0xffffff, 1));

    const directionalLight = new DirectionalLight(0xffffff, 2);

    directionalLight.position.set(10, 20, 30);
    this.scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.addEventListener('change', () => {
      if (!this.scene) return;

      renderer.render(this.scene, camera);
    });

    renderer.domElement.addEventListener('dblclick', () => {
      controls.reset();
    });

    this.scene.add(this.createSquare());
    this.scene.add(this.createAdjacentSquare());

    const letter = await this.createLetter();

    this.scene.add(letter);

    renderer.render(this.scene, camera);
  }

  private onExportClick = () => {
    if (!this.scene) return;

    const result = stlExporter.parse(this.scene, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });

    this.downloadBlob(blob, 'shape-playground.stl');
  };

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private createSquare() {
    const shape = createRectShape(squareWidth, squareHeight);
    const geometry = new ExtrudeGeometry(shape, {
      depth: squareThickness,
      bevelEnabled: false,
    });
    const material = new MeshStandardMaterial({ color: '#00ffff' });
    const square = new Mesh(geometry, material);

    // Zentriert wie unser "echtes" square: Ursprung in die Mitte legen.
    square.position.set(
      -squareWidth / 2,
      -squareHeight / 2,
      -squareThickness / 2,
    );

    return square;
  }

  private createAdjacentSquare() {
    const shape = createRectShape(captionWidth, squareHeight);
    const geometry = new ExtrudeGeometry(shape, {
      depth: squareThickness,
      bevelEnabled: false,
    });
    const material = new MeshStandardMaterial({ color: '#ff8800' });
    const square = new Mesh(geometry, material);

    // Button + Caption nebeneinander: gleiche Z-Ebene wie der Hauptsquare,
    // bündig an dessen rechter Kante (x = squareWidth / 2) angesetzt.
    square.position.set(
      squareWidth / 2,
      -squareHeight / 2,
      -squareThickness / 2,
    );

    return square;
  }

  private async createLetter() {
    const loader = new FontLoader();
    const font = await loader.loadAsync('/fonts/OpenSans_Regular.json');
    const geometry = createLetterGeometry('Aa', font, { size: 4, depth: 1 });

    const material = new MeshStandardMaterial({
      color: '#ff00ff',
      side: DoubleSide,
    });
    const letter = new Mesh(geometry, material);

    letter.position.set(
      squareWidth / 2 + captionWidth / 2,
      0,
      squareThickness / 2,
    );

    return letter;
  }

  render() {
    return html`
      <div class="viewer" ${ref(this.containerRef)}></div>
      <button @click=${this.onExportClick}>STL exportieren</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'shape-playground': ShapePlayground;
  }
}
