import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

import { ParamsChangedEvent } from '../../events/params-changed-event.js';
import {
  createButtonGeometry,
  getCenteredPosition,
} from '../../geometry/button-shape.js';
import {
  type ButtonParams,
  defaultButtonParams,
} from '../../interfaces/button-params.js';
import { styles } from './flatbutton-viewer.styles.js';

const sceneBackgroundColor = 0xf0f0ee;
const stlExporter = new STLExporter();

@customElement('flatbutton-viewer')
export class FlatbuttonViewer extends LitElement {
  static styles = styles;

  private containerRef = createRef<HTMLDivElement>();
  private renderer?: WebGLRenderer;
  private camera?: PerspectiveCamera;
  private scene?: Scene;
  private square?: Mesh;
  private material?: MeshBasicMaterial;
  private controls?: OrbitControls;
  private resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('params-changed', this.onParamsChanged);
    document.addEventListener('export-requested', this.onExportRequested);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener('params-changed', this.onParamsChanged);
    document.removeEventListener('export-requested', this.onExportRequested);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
  }

  firstUpdated() {
    const container = this.containerRef.value;
    if (!container) return;

    this.setupScene(container);
  }

  private onParamsChanged = (e: ParamsChangedEvent) => {
    this.updateSquare(e.params);
  };

  private onResize = (entries: ResizeObserverEntry[]) => {
    const { width, height } = entries[0].contentRect;
    this.resizeRenderer(width, height);
  };

  private onExportRequested = () => {
    if (!this.square) return;

    const result = stlExporter.parse(this.square, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    this.downloadBlob(blob, 'flatbutton.stl');
  };

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private setupScene(container: HTMLDivElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer = this.createRenderer(width, height);
    container.appendChild(this.renderer.domElement);
    this.camera = this.createCamera(width, height);
    this.scene = this.createScene();
    this.controls = this.createControls(this.camera, this.renderer);

    this.square = this.createSquare();
    this.scene.add(this.square);

    this.renderer.render(this.scene, this.camera);

    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(container);
  }

  private resizeRenderer(width: number, height: number) {
    if (!this.renderer || !this.scene || !this.camera) return;
    if (width === 0 || height === 0) return;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  }

  private createControls(camera: PerspectiveCamera, renderer: WebGLRenderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', () => {
      if (!this.renderer || !this.scene || !this.camera) return;

      this.renderer.render(this.scene, this.camera);
    });

    return controls;
  }

  private createRenderer(width: number, height: number) {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);

    return renderer;
  }

  private createCamera(width: number, height: number) {
    const camera = new PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.z = 60;

    return camera;
  }

  private createScene() {
    const scene = new Scene();
    scene.background = new Color(sceneBackgroundColor);

    return scene;
  }

  private createSquare() {
    const geometry = createButtonGeometry(defaultButtonParams);
    this.material = new MeshBasicMaterial({ color: defaultButtonParams.color });

    const square = new Mesh(geometry, this.material);
    const { x, y, z } = getCenteredPosition(defaultButtonParams);
    square.position.set(x, y, z);

    return square;
  }

  private updateSquare(params: ButtonParams) {
    if (
      !this.square ||
      !this.material ||
      !this.renderer ||
      !this.scene ||
      !this.camera
    )
      return;

    this.square.geometry.dispose();
    this.square.geometry = createButtonGeometry(params);
    this.material.color.set(params.color);

    const { x, y, z } = getCenteredPosition(params);
    this.square.position.set(x, y, z);

    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return html`<div class="viewer" ${ref(this.containerRef)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'flatbutton-viewer': FlatbuttonViewer;
  }
}
