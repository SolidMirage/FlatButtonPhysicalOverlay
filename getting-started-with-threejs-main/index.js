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
camera.position.z = 40;

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
let length = 68;
let numSprings = 3;
let beamWidth = 1
// scene.add(createMountingHubs(innerDiameter, outerDiameter, thickness));
let springParamsA = calculateSpringParams(innerDiameter, outerDiameter, length, numSprings);
console.log(springParamsA);
let springSkeleton = createSpringSkeleton(innerDiameter, outerDiameter, springParamsA, Math.PI/2);
// scene.add(springSkeleton);
let springSkeletonAbsArc = createSpringSkeletonAbsArc(innerDiameter, outerDiameter, springParamsA, Math.PI/2);
// scene.add(springSkeletonAbsArc);
let springParamsB = {id: innerDiameter, od: outerDiameter, beamWidth, thickness, ...springParamsA}
let [springLegBasedOffSkeleton, lineSkele] = createSpringLegBasedOffSkeleton(springParamsB, Math.PI/2);
// scene.add(springLegBasedOffSkeleton);
// scene.add(lineSkele);
let [springLegWithRadialThickness,lineRadial] = createSpringLegWithRadialThickness(springParamsB, Math.PI/2);
scene.add(springLegWithRadialThickness);
scene.add(lineRadial);

let springLeg = createSpringLeg(innerDiameter, outerDiameter, beamWidth, thickness, springParamsB, Math.PI/2);
// scene.add(springLeg);
const rainbow = createThickArc({
    innerRadius: 5,
    outerRadius: 20,
    startAngle: 0,
    endAngle: Math.PI, // 180 degrees
    thickness: 5
});
// scene.add(rainbow);


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

function calculateSpringParams(id, od, length, numSprings) {
    // The radial length of the circle that will be filled with 'stuff'
    const radialSpan = (od - id) / 2;

    // Take the number of springs, get the amount of radians that are available for each spring
    // There should be space between each spring, 10% of the space on each side in radians
    const apertureLimit = ((Math.PI * 2) / numSprings ) * 0.8; // 80% of available wedge
    
    // Auto-calculate windings (serpentineNum)
    // Mirroring OpenSCAD: length ≈ windings * radius * aperture
    // divide diameters by 2 to get radius, then take average by adding radius together and dividing by two again
    const avgRadius = (id + od) / 4;

    // This is an initial guess at how many back and forths will be needed to create the full spring.
    // A radius * angle is the arc length, or distance along a circular path.
    // To get the number of average arc lengths that will add up to the total length of the requested spring,
    // divide total length by the arc length
    // round up to a full number to get the number of arc lengths
    // There will always be at least one, so use the max function
    const serpentineNum = Math.max(1, Math.ceil(length / (avgRadius * apertureLimit)));

    // Equally space each serpentine arm along the radialSpan so the arms do not fully overlap each other
    const distEach = radialSpan / (serpentineNum + 1);

    return { serpentineNum, distEach, apertureLimit };
}
// Verification: console.log these values to ensure serpentineNum isn't 0 or excessively high.

function createThickArc(params) {
    const {
        innerRadius,
        outerRadius,
        startAngle, // in radians (e.g., 0)
        endAngle,   // in radians (e.g., Math.PI)
        thickness   // extrusion height
    } = params;

    const shape = new THREE.Shape();

    // 1. Start at the beginning of the outer arc
    const outX = Math.cos(startAngle) * outerRadius;
    const outY = Math.sin(startAngle) * outerRadius;
    shape.moveTo(outX, outY);

    // 2. Draw outer arc (Counter-Clockwise)
    shape.absarc(0, 0, outerRadius, startAngle, endAngle, false);

    // 3. Line down to the inner radius at the end angle
    // (Three.js does this automatically if we call absarc for the next part, 
    // but being explicit helps avoid "funky" jumps)
    const inX_end = Math.cos(endAngle) * innerRadius;
    const inY_end = Math.sin(endAngle) * innerRadius;
    shape.lineTo(inX_end, inY_end);

    // 4. Draw inner arc back to the start angle (Clockwise)
    shape.absarc(0, 0, innerRadius, endAngle, startAngle, true);

    // 5. Close the shape back to the start
    shape.lineTo(outX, outY);

    // Extrude
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 32
    });

    const material = new THREE.MeshStandardMaterial({ color: 0xff8800, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
}

function createSpringSkeletonAbsArc(id, od, params, baseAngle) {
    const { serpentineNum, distEach, apertureLimit } = params;
    
    // We use a Path to store the continuous line
    const path = new THREE.Path();
    
    const startA = baseAngle - (apertureLimit / 2);
    const endA = baseAngle + (apertureLimit / 2);

    // Initial position: start at the inner diameter
    const startX = Math.cos(startA) * (id / 2);
    const startY = Math.sin(startA) * (id / 2);
    path.moveTo(startX, startY);

    for (let j = 0; j <= serpentineNum; j++) {
        const r = (id / 2) + (j * distEach);
        const isEven = j % 2 === 0;

        // Draw the radial arc
        // absarc(x, y, radius, startAngle, endAngle, clockwise)
        path.absarc(0, 0, r, isEven ? startA : endA, isEven ? endA : startA, !isEven);

        // Draw the radial connector to the next level (unless it's the last loop)
        if (j < serpentineNum) {
            const nextR = (id / 2) + ((j + 1) * distEach);
            const targetAngle = isEven ? endA : startA;
            path.lineTo(Math.cos(targetAngle) * nextR, Math.sin(targetAngle) * nextR);
        }
    }

    // Convert the path to a geometry
    // getPoints(divisions) determines the smoothness of the rendered lines
    const points = path.getPoints(32); 
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
}

/**
 * Creates a solid 3D serpentine spring leg by tracing the skeleton path 
 * with a thickness (beamWidth) and extruding it.
 */
function createSpringLegBasedOffSkeleton(params, baseAngle) {
    const { id, od, beamWidth, thickness, serpentineNum, distEach, apertureLimit } = params;
    const shape = new THREE.Shape();

    const halfBeam = beamWidth / 2;
    const startA = baseAngle - (apertureLimit / 2);
    const endA = baseAngle + (apertureLimit / 2);

    // --- STEP 1: TRACE OUTER BOUNDARY (Inner to Outer) ---
    // Start at the beginning of the outer-offset path
    const startX = Math.cos(startA) * (id / 2 + halfBeam);
    const startY = Math.sin(startA) * (id / 2 + halfBeam);
    shape.moveTo(startX, startY);

    for (let j = 0; j <= serpentineNum; j++) {
        const r = (id / 2) + (j * distEach) + halfBeam;
        const isEven = j % 2 === 0;

        // Trace arc at this radius
        shape.absarc(0, 0, r, isEven ? startA : endA, isEven ? endA : startA, !isEven);

        // Radial link to the next level up
        if (j < serpentineNum) {
            const nextR = (id / 2) + ((j + 1) * distEach) + halfBeam;
            const targetA = isEven ? endA : startA;
            shape.lineTo(Math.cos(targetA) * nextR, Math.sin(targetA) * nextR);
        }
    }

    // --- STEP 2: END CAP ---
    // Connect the outer edge to the inner edge at the top
    const topAngle = (serpentineNum % 2 === 0) ? endA : startA;
    const innerTopR = (id / 2) + (serpentineNum * distEach) - halfBeam;
    shape.lineTo(Math.cos(topAngle) * innerTopR, Math.sin(topAngle) * innerTopR);

    // --- STEP 3: TRACE INNER BOUNDARY (Outer back to Inner) ---
    for (let j = serpentineNum; j >= 0; j--) {
        const r = (id / 2) + (j * distEach) - halfBeam;
        const isEven = j % 2 === 0;

        // Trace arc at this radius (Opposite direction to outer boundary)
        shape.absarc(0, 0, r, isEven ? endA : startA, isEven ? startA : endA, isEven);

        // Radial link to the next level down
        if (j > 0) {
            const nextDownR = (id / 2) + ((j - 1) * distEach) - halfBeam;
            const targetA = isEven ? startA : endA;
            shape.lineTo(Math.cos(targetA) * nextDownR, Math.sin(targetA) * nextDownR);
        }
    }

    // --- STEP 4: START CAP ---
    // Close the loop back to the first point
    shape.lineTo(startX, startY);

    // --- STEP 5: EXTRUSION ---
    const extrudeSettings = {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 32 // Smoothness of the arcs
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ffcc, 
        side: THREE.DoubleSide 
    });

    // 2. Extract points from the shape
    const points = shape.getPoints(50); // High resolution for smooth trace
    const geoLine = new THREE.BufferGeometry().setFromPoints(points);

    // 3. Create a Color Attribute (Gradient)
    const colors = [];
    for (let i = 0; i < points.length; i++) {
        const ratio = i / points.length;
        // Transition from Green (start) to Red (end)
        colors.push(ratio, 1 - ratio, 0); 
    }
    geoLine.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // 4. Create a Line with Vertex Colors
    const matLine = new THREE.LineBasicMaterial({ 
        vertexColors: true, 
        linewidth: 2 
    });

    // return new THREE.Line(geometry, material);

    return [new THREE.Mesh(geometry, material), new THREE.Line(geoLine, matLine)];
}

function createSpringLegWithRadialThickness(params, baseAngle) {
    const { id, od, beamWidth, thickness, serpentineNum, distEach, apertureLimit } = params;
    const shape = new THREE.Shape();

    // The center lines for the Left and Right boundaries of the wedge
    const leftWallA = baseAngle + (apertureLimit / 2);
    const rightWallA = baseAngle - (apertureLimit / 2);

    // Helper: Convert linear width to angular offset at radius r
    const getAWidthOff = (r) => (beamWidth / r);

    // --- STEP 1: TRACE THE Right-most PERIMETER (Inner radius to Outer radius) ---
    // This traces the "outermost" boundary relative to the center of the beam path
    for (let j = 0; j <= serpentineNum; j++) {
        const isEven = j % 2 === 0;
        const r = (id / 2) + (j * distEach) + (isEven ? 0 : beamWidth);
        const aWidthOff = getAWidthOff(r);

        // Even: Left -> Right | Odd: Right -> Left
        // To prevent overlap, we ensure the arc starts/ends exactly where the radial link meets it
        const arcStart = isEven ? (leftWallA - aWidthOff) : (rightWallA);
        const arcEnd   = isEven ? (rightWallA) : (leftWallA - aWidthOff);

        if (j === 0) shape.moveTo(Math.cos(leftWallA) * r, Math.sin(leftWallA) * r);

        shape.absarc(0, 0, r, arcStart, arcEnd, isEven);

        // RADIAL LINK UP (Stay on the same wall we just finished)
        if (j < serpentineNum) {
            const nextR = (id / 2) + (j * distEach) + (isEven ? 0 : beamWidth);
            // const nextR = (id / 2) + ((j + 1) * distEach) + (isEven ? halfWidth : -halfWidth);
            // const nextAOff = getAOff(nextR);
            // const targetA = isEven ? (rightWallA - aOff) : (leftWallA + aOff);
            shape.lineTo(Math.cos(arcEnd) * nextR, Math.sin(arcEnd) * nextR);
        }
    }

    // --- STEP 2: TOP END-CAP (Bridge Outer to Inner) ---
    const sEven = (serpentineNum % 2 === 0);
    const topR = (id / 2) + (serpentineNum * distEach) + (sEven ? beamWidth:0);
    // const topR_B = (id / 2) + (serpentineNum * distEach) + (sEven ? beamWidth : 0);
    const topStartAngle = !sEven ? (leftWallA - getAWidthOff(topR)) : (rightWallA);
    // const capAngleInner = sEven ? (rightWallA + getAWidthOff(topR_B)) : (leftWallA - getAWidthOff(topR_B));
    shape.lineTo(Math.cos(topStartAngle) * topR, Math.sin(topStartAngle) * topR);

    // --- STEP 3: TRACE THE INNER PERIMETER (Outer to Inner) ---
    for (let j = serpentineNum; j >= 0; j--) {
        const isEven = j % 2 === 0;
        const r = (id / 2) + (j * distEach) + (isEven ? beamWidth: 0);
        const aWidthOff = getAWidthOff(r);

        // Trace back in opposite direction
        const arcStart = isEven ? (rightWallA + aWidthOff) : (leftWallA);
        const arcEnd   = isEven ? (leftWallA) : (rightWallA + aWidthOff);

        shape.absarc(0, 0, r, arcStart, arcEnd, !isEven);

        // RADIAL LINK DOWN (Stay on the same wall we just finished)
        if (j > 0) {
            // const nextDownR = (id / 2) + ((j - 1) * distEach) + (isEven ? -halfWidth : halfWidth);
            // const nextAOffDown = getAOff(nextDownR);
            // const targetA = isEven ? (leftWallA - nextAOffDown) : (rightWallA + nextAOffDown);
            const nextR = (id / 2) + (j * distEach) + (isEven ? beamWidth : 0);
            shape.lineTo(Math.cos(arcEnd) * nextR, Math.sin(arcEnd) * nextR);
        }
    }

    // --- STEP 4: BOTTOM CAP & EXTRUDE ---
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, { 
        depth: thickness, 
        bevelEnabled: false, 
        curveSegments: 32 
    });

    // 2. Extract points from the shape
    const points = shape.getPoints(50); // High resolution for smooth trace
    const geoLine = new THREE.BufferGeometry().setFromPoints(points);

    // 3. Create a Color Attribute (Gradient)
    const colors = [];
    for (let i = 0; i < points.length; i++) {
        const ratio = i / points.length;
        // Transition from Green (start) to Red (end)
        colors.push(ratio, 1 - ratio, 0); 
    }
    geoLine.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // 4. Create a Line with Vertex Colors
    const matLine = new THREE.LineBasicMaterial({ 
        vertexColors: true, 
        linewidth: 2 
    });

    // return new THREE.Line(geometry, material);
    return [new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ffcc })), new THREE.Line(geoLine, matLine)];
}


function createSpringSkeleton(id, od, params, baseAngle) {
    const points = [];
    // number of arms
    // space between arms and the center
    // the maximum number of radians the spring will take
    const { serpentineNum, distEach, apertureLimit } = params;

    // draw the arms one at a time
    for (let j = 0; j <= serpentineNum; j++) {
        // get current radius for the arm
        const r = (id / 2) + (j * distEach);

        // base angle is the angle that will bisect the spring
        const startA = baseAngle - (apertureLimit / 2);
        const endA = baseAngle + (apertureLimit / 2);
        
        // Add points for an arc at radius 'r'
        // In Step 4, this becomes shape.absarc()
        const segments = 10;
        for(let s = 0; s <= segments; s++) {
            // Depending on which arm, will draw points CW or CCW to do the zig-zag of
            // the serpentine spring
            const t = j % 2 === 0 ? s / segments : 1 - (s / segments);

            // determine how far along the arm to create the next point in radians
            const angle = startA + t * (endA - startA);
            // create the point by translating from conic coordinates to x/y coordinates
            points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
        }
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
}
// Verification: You should see a single "S-curve" line spanning from id to od.
function createSpringLeg(params, baseAngle) {
    const { id, od, beamWidth, thickness, serpentineNum, distEach, apertureLimit } = params;
    const shape = new THREE.Shape();

    const halfBeam = beamWidth / 2;
    const startA = baseAngle - (apertureLimit / 2);
    const endA = baseAngle + (apertureLimit / 2);

    // --- 1. OUTER EDGE (Tracing from ID to OD) ---
    // Start at the innermost point of the outer edge
    const startX = Math.cos(startA) * (id / 2 + halfBeam);
    const startY = Math.sin(startA) * (id / 2 + halfBeam);
    shape.moveTo(startX, startY);

    for (let j = 0; j <= serpentineNum; j++) {
        const r = (id / 2) + (j * distEach) + halfBeam;
        const isEven = j % 2 === 0;
        
        // Draw the arc segment for this level
        shape.absarc(0, 0, r, isEven ? startA : endA, isEven ? endA : startA, !isEven);

        // If not the last segment, draw the radial connector to the next level
        if (j < serpentineNum) {
            const nextR = (id / 2) + ((j + 1) * distEach) + halfBeam;
            const targetAngle = isEven ? endA : startA;
            shape.lineTo(Math.cos(targetAngle) * nextR, Math.sin(targetAngle) * nextR);
        }
    }

    // --- 2. THE OUTER CAP ---
    // Transition from the outer edge to the inner edge at the very top (OD)
    const finalAngle = (serpentineNum % 2 === 0) ? endA : startA;
    const innerOD = (id / 2) + (serpentineNum * distEach) - halfBeam;
    shape.lineTo(Math.cos(finalAngle) * innerOD, Math.sin(finalAngle) * innerOD);

    // --- 3. INNER EDGE (Tracing back from OD to ID) ---
    for (let j = serpentineNum; j >= 0; j--) {
        const r = (id / 2) + (j * distEach) - halfBeam;
        const isEven = j % 2 === 0;
        
        // Draw the arc segment in the OPPOSITE direction of the outer edge
        shape.absarc(0, 0, r, isEven ? endA : startA, isEven ? startA : endA, isEven);

        // If not the first segment, draw the radial connector back down
        if (j > 0) {
            const nextDownR = (id / 2) + ((j - 1) * distEach) - halfBeam;
            const targetAngle = isEven ? startA : endA;
            shape.lineTo(Math.cos(targetAngle) * nextDownR, Math.sin(targetAngle) * nextDownR);
        }
    }

    // --- 4. THE INNER CAP ---
    // Close the shape back to the very first point
    shape.lineTo(startX, startY);

    // Final Geometry Generation
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 32
    });

    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ffcc }));
}
// function createSpringLeg(id, od, beamWidth, thickness, params, baseAngle) {
//     const { serpentineNum, distEach, apertureLimit } = params;
//     const shape = new THREE.Shape();

//     // 1. Trace the Outer edge of the beam
//     for (let j = 0; j <= serpentineNum; j++) {
//         const r = (id / 2) + (j * distEach) + (beamWidth / 2);
//         const startA = baseAngle - (apertureLimit / 2);
//         const endA = baseAngle + (apertureLimit / 2);
//         shape.absarc(0, 0, r, j % 2 === 0 ? startA : endA, j % 2 === 0 ? endA : startA, j % 2 !== 0);
//     }

//     // 2. Trace back along the Inner edge of the beam
//     for (let j = serpentineNum; j >= 0; j--) {
//         const r = (id / 2) + (j * distEach) - (beamWidth / 2);
//         const startA = baseAngle - (apertureLimit / 2);
//         const endA = baseAngle + (apertureLimit / 2);
//         shape.absarc(0, 0, r, j % 2 === 0 ? endA : startA, j % 2 === 0 ? startA : endA, j % 2 === 0);
//     }

//     const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 32 });
//     return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ffcc }));
// }
// // Verification: The skeleton line is replaced by a solid 3D serpentine beam.

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
