import * as THREE from "three";
// need renderer, camera, scene
import {OrbitControls} from "jsm/controls/OrbitControls.js";

import { createSpringLegWithRadialThickness, calculateSpringParams, createFullSpringAssembly,createMountingHubs } from './SpringGenerator.js';
import { addGUI, setExport } from './GUI.js';
import { createRectangleSpringButton } from "./RectSpringGenerator.js";

// const blargh = new THREE.Vector3(1,2,3);
// console.log(blargh.x);

// let myParams = {a:1, b:2, c:3};
// console.log(myParams);
// let {x} = myParams;
// console.log(x);
// let{a} = myParams;
// console.log(a);


const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const fov = 30;
const aspect = w / h;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 40;
// camera.rotation.z = Math.PI * 0.5;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor= .9;

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

// addRadialSpring();
addRectSpring();

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Add Outer Rim (Optional, like in the SCAD file)
// const rim = createMountingHubs(outerDiameter - 10, outerDiameter, thickness);
    // scene.add(rim);

addGUI();
setExport(scene);

function addRectSpring(){
    const rectParams = {
        fullBotLeftX: 0,
        fullBotLeftY: 0,
        fullWidth : 20,
        fullHeight: 9,
        padWidth: 10,
        padHeight: 8,
        beamWidth: 1,
        thickness: 0.5,
        overlap: 0.1,
        borderWidth: .6,
        borderThickness: 3
    };
    let rectSpringButton = createRectangleSpringButton(rectParams);
    scene.add(rectSpringButton);
}

function addRadialSpring(){
    // let mesh = createCenterMesh();
    // createRandomCircle();
    // let innerDiameter = 5;
    // let outerDiameter = 10;
    let innerDiameter = 10;
    let outerDiameter = 20;
    let thickness = 0.5;
    const length = 5;
    // let length = 68;
    let numSprings = 4;
    let beamWidth = 1;
    const heightSpacer = 2;
    const widthSpacer = 1;
    // let beamWidth = 1;
    // scene.add(createMountingHubs(innerDiameter, outerDiameter, thickness));
    let springParamsA = calculateSpringParams(innerDiameter, outerDiameter, length, numSprings);
    // console.log(springParamsA);

    const assemblyGroup = new THREE.Group();
    let springParamsB = {id: innerDiameter, od: outerDiameter, length, beamWidth, thickness, ...springParamsA, numSprings: numSprings};
    // let [springLegWithRadialThickness,lineRadial] = createSpringLegWithRadialThickness(springParamsB, (0*(Math.PI*2/3)));
    // scene.add(springLegWithRadialThickness);
    // scene.add(lineRadial);
    // assemblyGroup.add(springLegWithRadialThickness);

    // let [springLegWithRadialThickness2,lineRadial2] = createSpringLegWithRadialThickness(springParamsB, (1*(Math.PI*2/3)));
    // // scene.add(springLegWithRadialThickness2);
    // assemblyGroup.add(springLegWithRadialThickness2);

    // let [springLegWithRadialThickness3,lineRadial23] = createSpringLegWithRadialThickness(springParamsB, (2*(Math.PI*2/3)));
    // // scene.add(springLegWithRadialThickness3);
    // assemblyGroup.add(springLegWithRadialThickness3);

    // scene.add(assemblyGroup);

    let fullSpringAssembly = createFullSpringAssembly(springParamsB);
    scene.add(fullSpringAssembly);
    // scene.add(lineRadial);

    // Add Central Hub (Mounting point)
    const mountingHubParams = {id:innerDiameter-beamWidth,
        od: outerDiameter,
        thickness: thickness,
        widthSpacer: widthSpacer,
        heightSpacer: heightSpacer,
        beamWidth: beamWidth,
        ...springParamsA
    }
    const hub = createMountingHubs(mountingHubParams);
    scene.add(hub);
}

function animate(t=0) {
    requestAnimationFrame(animate);
    // mesh.scale.setScalar(Math.cos(t*0.001)+1.0);
    // mesh.rotation.y = t*0.0001;
    renderer.render(scene, camera);
    controls.update();
}

animate();



function createCenterMesh() {
    const geo = new THREE.IcosahedronGeometry(.5,2);
    const mat = new THREE.MeshStandardMaterial({
        color:0xffffff,
        flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe:true
    });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(wireMesh);
    wireMesh.scale.setScalar(1.0001);
    mesh.add(wireMesh);
    return mesh;
}