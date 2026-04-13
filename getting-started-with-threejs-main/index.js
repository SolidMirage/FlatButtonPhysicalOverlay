import * as THREE from "three";
// need renderer, camera, scene
import {OrbitControls} from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 10;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor= .9;

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

createCenterMesh();
// createRandomCircle();
let innerDiameter = 10;
let outerDiameter = 40;
let thickness = 0.5;
scene.add(createMountingHubs(innerDiameter, outerDiameter, thickness));


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
}

function createMountingHubs(id, od, thickness) {
    const shape = new THREE.Shape();
    // Outer circle of the hub assembly
    shape.absarc(0, 0, od / 2 + 5, 0, Math.PI * 2, false); 

    // Inner mounting hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, id / 2, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const mountingGeometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    const mountingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true});
    const mountingMesh = new THREE.Mesh(mountingGeometry, mountingMaterial);
    return mountingMesh;
}
// Verification: You should see a solid ring with a hole in the center.



function createRandomCircle(){
    const circleShape = new THREE.Shape();
    circleShape.absarc(0,0,3,0,Math.PI*2,true);

    const holePath = new THREE.Path();
    holePath.absarc(0,0, 2, 0, Math.PI*2, true);
    circleShape.holes.push(holePath);

    const extrudeSettings={
        depth:3, bevelEnabled: false,curveSegments:64
    }

    const circleGeo = new THREE.ExtrudeGeometry(circleShape, extrudeSettings);
    const circleMat = new THREE.MeshStandardMaterial({color: 0xff4444});
    const circleMesh = new THREE.Mesh(circleGeo, circleMat);
    scene.add(circleMesh);
}



function animate(t=0) {
    requestAnimationFrame(animate);
    // mesh.scale.setScalar(Math.cos(t*0.001)+1.0);
    // mesh.rotation.y = t*0.0001;
    renderer.render(scene, camera);
    controls.update();
}

animate();
