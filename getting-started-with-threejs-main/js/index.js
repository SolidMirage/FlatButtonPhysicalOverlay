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
const far = 1000;
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
// addSingleRectSpring();
addColumnRectSpring();

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Add Outer Rim (Optional, like in the SCAD file)
// const rim = createMountingHubs(outerDiameter - 10, outerDiameter, thickness);
    // scene.add(rim);

addGUI();
setExport(scene);

function addColumnRectSpring(){

    const rectParams = {
        fullBotLeftX: 0,
        fullBotLeftY: 0,
        innerWidth : 20,
        innerHeight: 14,
        padWidth: 10,
        padHeight: 10,
        beamWidth: .6,
        beamGap:1.5,
        thickness: 0.5,
        overlap: 0.1,
        borderWidth: .6,
        borderThickness: 3
    };
    // make list of (x,y) points to go to
    // (10.7, 8.5), (10.7, 24.9), (10.7, 41.8), (10.7, 58.6)
    let points = [];
    points.push(new THREE.Vector3(10.7, 8.5, 0));
    points.push(new THREE.Vector3(10.7, 24.9, 0));
    points.push(new THREE.Vector3(10.7, 41.8, 0));
    points.push(new THREE.Vector3(10.7, 58.6, 0));

    // create a large rectangle that will go 3 borderWidths past
    // the minX and maxX and minY and maxY of the points where the 
    // rectangle springs will go. The outerWidth of the rectangle springs
    // is the innerWidth+2*borderWidth. The outerHeight of the rectangle
    // springs is the innerHeigh+2*borderWidth. The points in the list
    // represent where the center of the button should go. So to determine
    // the span of the rectangle, the left most part of the panelwill be minX
    // of the points minus half the outerWidth of a button, minus 3*borderWidth.
    // The rightmost part of the panel will be maxX of the points plus half the
    // outerWidth of a button, plus 3*borderWidth. The difference between the right
    // most and left most will be the width of the rectangle. The height of
    // the rectangle follows a similar relationship to the min/max Y values
    // from the list of points. For bottom most point, collect the minY value
    // from the list of points, subtract half the outerHeight of a button,
    // and then subtract 3*borderWidth. For the top most point, collect the
    // maxY values from the list of points, add, half the outerHeight of a button,
    // then add 3*borderWidth. The difference between the topmost and bottom most
    // points will be the height of the rectangle. With the widths and heights
    // of the rectangle, create a shape with panelThickness = 1. 
    let minX = points[0].x;
    let maxX = points[0].x; 
    let minY = points[0].y;
    let maxY = points[0].y;
    for (let i = 0; i < points.length; i++) {
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
    }
    let leftPanelX = minX - (rectParams.innerWidth/2+3*rectParams.borderWidth);
    let rightPanelX = maxX + (rectParams.innerWidth/2+3*rectParams.borderWidth);
    let bottomPanelY = minY - (rectParams.innerHeight/2+3*rectParams.borderWidth);
    let topPanelY = maxY + (rectParams.innerHeight/2+5*rectParams.borderWidth);
    let panelWidth = rightPanelX - leftPanelX;
    let panelHeight = topPanelY - bottomPanelY;
    let panelShape = new THREE.Shape();
    panelShape.moveTo(leftPanelX, bottomPanelY);
    panelShape.lineTo(leftPanelX, topPanelY);
    panelShape.lineTo(rightPanelX, topPanelY);
    panelShape.lineTo(rightPanelX, bottomPanelY);
    panelShape.lineTo(leftPanelX, bottomPanelY);
    
 
    // for each point in list of points, create a Rect Spring and move
    // the center of the spring to the point
    for (let i = 0; i < points.length; i++) {
        let rectSpringButton = createRectangleSpringButton(rectParams);
        
        // Calculate the offset to center the button. 
        // The button is drawn from (fullBotLeftX - borderWidth) to (innerWidth + borderWidth)
        const offsetX = rectParams.innerWidth / 2;
        const offsetY = rectParams.innerHeight / 2;
        
        rectSpringButton.position.set(points[i].x - offsetX, points[i].y - offsetY, points[i].z);
        scene.add(rectSpringButton);

        // create a hole for the rectSpringButton in panelMesh. the hole will also be a rectangle
        // the size of the bounding box of the rectSpringButton, minus rectParams.overlap
        let boundingBox = new THREE.Box3().setFromObject(rectSpringButton);
        // create a path that has x-width and y-height of the bounding box, minus overlap
        let holePath = new THREE.Path();
        holePath.moveTo(boundingBox.min.x+rectParams.overlap, boundingBox.min.y+rectParams.overlap);
        holePath.lineTo(boundingBox.max.x-rectParams.overlap, boundingBox.min.y+rectParams.overlap);
        holePath.lineTo(boundingBox.max.x-rectParams.overlap, boundingBox.max.y-rectParams.overlap);
        holePath.lineTo(boundingBox.min.x+rectParams.overlap, boundingBox.max.y-rectParams.overlap);
        holePath.lineTo(boundingBox.min.x+rectParams.overlap, boundingBox.min.y+rectParams.overlap)
        panelShape.holes.push(holePath);
        
    }

    // move panelShape 0.5 up in z
    
    

    let panelThickness = 1;
    let panelGeo = new THREE.ExtrudeGeometry(panelShape, { 
        depth: panelThickness, 
        bevelEnabled: false 
    });
    let panelMat = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    let panelMesh = new THREE.Mesh(panelGeo, panelMat);
    // panelMesh.position.z = 0.5;
    // panelMesh.translate(0,0,0.5);

    scene.add(panelMesh);


}

function addSingleRectSpring(){
    const rectParams = {
        fullBotLeftX: 0,
        fullBotLeftY: 0,
        innerWidth : 20,
        innerHeight: 14,
        padWidth: 10,
        padHeight: 10,
        beamWidth: .6,
        beamGap:1.5,
        thickness: 0.5,
        overlap: 0.1,
        borderWidth: .6,
        borderThickness: 3
    };
    let rectSpringButton = createRectangleSpringButton(rectParams);
    let boundingBox = new THREE.Box3().setFromObject(rectSpringButton);
    let boxSize = new THREE.Vector3(0,0,0);
    boundingBox.getSize(boxSize);
    console.log(boxSize);
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