import * as THREE from "three";

export function createMountingHubs(params) {
    const {id, od, thickness, widthSpacer, heightSpacer, beamWidth,serpentineNum} = params;
    const innerPad = new THREE.Shape();
    // Outer circle of the hub assembly
    innerPad.absarc(0, 0, id / 2, 0, Math.PI * 2, false); 

    const outerPad = new THREE.Shape();
    outerPad.absarc(0, 0, od / 2+ widthSpacer, 0, Math.PI * 2, false); 
    // Inner mounting hole
    const holePath = new THREE.Path();
    // const isEven = serpentineNum % 2 === 0;
    const holeRadius = od/2;
    holePath.moveTo(0,0);
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    outerPad.holes.push(holePath);

    const outerSpacer = new THREE.Shape();
    outerSpacer.absarc(0,0,od/2+widthSpacer,0,Math.PI*2,false);
    const outerSpacerHole = new THREE.Shape();
    outerSpacerHole.absarc(0,0,od/2,0,Math.PI*2,true);
    outerSpacer.holes.push(outerSpacerHole);

    const innerGeo = new THREE.ExtrudeGeometry(innerPad, { depth: thickness, bevelEnabled: false });
    const outerGeo = new THREE.ExtrudeGeometry(outerPad, { depth: thickness, bevelEnabled: false });
    const outerSpacerGeo = new THREE.ExtrudeGeometry(outerSpacer, { depth: heightSpacer, bevelEnabled: false });


    const mountingGroup = new THREE.Group();
    // const mountingGeometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    const mountingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true});
    const innerMesh = new THREE.Mesh(innerGeo, mountingMaterial);
    const outerMesh = new THREE.Mesh(outerGeo, mountingMaterial); 
    const outerSpacerMesh = new THREE.Mesh(outerSpacerGeo, mountingMaterial); 
    mountingGroup.add(innerMesh);
    mountingGroup.add(outerMesh);
    mountingGroup.add(outerSpacerMesh);

    return mountingGroup;
}
// Verification: You should see a solid ring with a hole in the center.

export function calculateSpringParams(id, od, length, numSprings) {
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

export function createSpringLegWithRadialThickness(params, baseAngle) {
    const { id, od, beamWidth, thickness, serpentineNum, distEach, apertureLimit } = params;
    const shape = new THREE.Shape();

    // The center lines for the Left and Right boundaries of the wedge
    const leftWallA = baseAngle + (apertureLimit / 2);
    const rightWallA = baseAngle - (apertureLimit / 2);

    // Helper: Convert linear width to angular offset at radius r
    const getAWidthOff = (r) => (beamWidth / r);

    // --- STEP 0: START TAB (Inner) ---
    const startR = id / 2;
    const startTabR = startR - beamWidth;
    shape.moveTo(Math.cos(leftWallA) * startTabR, Math.sin(leftWallA) * startTabR);
    shape.lineTo(Math.cos(leftWallA - getAWidthOff(startTabR)) * startTabR, Math.sin(leftWallA - getAWidthOff(startTabR)) * startTabR);
    shape.lineTo(Math.cos(leftWallA - getAWidthOff(startR)) * startR, Math.sin(leftWallA - getAWidthOff(startR)) * startR);

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
    // const sEven = (serpentineNum % 2 === 0);
    // const topR = (id / 2) + (serpentineNum * distEach) + (sEven ? beamWidth : 0);
    // const topStartAngle = !sEven ? (leftWallA) : (rightWallA);
    
    // // End Tab (Outer)
    // const endTabR = topR + (sEven?0:beamWidth);
    // const tabAngle = sEven ? rightWallA : leftWallA;
    // shape.lineTo(Math.cos(topStartAngle) * topR, Math.sin(topStartAngle) * topR);
    // shape.lineTo(Math.cos(tabAngle) * topR, Math.sin(tabAngle) * topR);
    // shape.lineTo(Math.cos(tabAngle) * endTabR, Math.sin(tabAngle) * endTabR);
    // shape.lineTo(Math.cos(tabAngle + (sEven ? getAWidthOff(endTabR) : -getAWidthOff(endTabR))) * endTabR, Math.sin(tabAngle + (sEven ? getAWidthOff(endTabR) : -getAWidthOff(endTabR))) * endTabR);
    // shape.lineTo(Math.cos(topStartAngle + (sEven ? getAWidthOff(topR) : -getAWidthOff(topR))) * topR, Math.sin(topStartAngle + (sEven ? getAWidthOff(topR) : -getAWidthOff(topR))) * topR);

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

    const springMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

    const springMesh = new THREE.Mesh(geometry, springMaterial);

    const outerTabShape = new THREE.Shape();
    // create tabs to go from end of spring to an outer item
    // tab will start at outermost radius and outermost arc
    const tabRadiusStart = (id / 2) + (serpentineNum * distEach);
    const isEven = serpentineNum % 2 === 0;
    const tabRadiusEnd = tabRadiusStart + (beamWidth * (isEven ? 2.1 : 3.1));
    
    const outerMostArc = isEven ? rightWallA : leftWallA;
    const innerTabArcEnd = isEven ? (rightWallA + getAWidthOff(tabRadiusStart)) : (leftWallA - getAWidthOff(tabRadiusStart));
    outerTabShape.moveTo(Math.cos(outerMostArc) * tabRadiusStart, Math.sin(outerMostArc) * tabRadiusStart);
    outerTabShape.lineTo(Math.cos(outerMostArc) * (tabRadiusEnd), Math.sin(outerMostArc) * (tabRadiusEnd));
    outerTabShape.absarc(0, 0, tabRadiusEnd, outerMostArc, innerTabArcEnd, !isEven);
    outerTabShape.lineTo(Math.cos(innerTabArcEnd) * (tabRadiusStart), Math.sin(innerTabArcEnd) * (tabRadiusStart));
    outerTabShape.closePath();
    // extend up on same arc twice the beamwidth to get one beamwidth past the end of the spring
    // create arc from that spot to one arc-length beam width to the inside of the spring
    // extend on that angle down to the first radius
    const outerTabGeometry = new THREE.ExtrudeGeometry(outerTabShape, { 
        depth: thickness, 
        bevelEnabled: false, 
        curveSegments: 32 
    });

    const outerTabMesh = new THREE.Mesh(outerTabGeometry, springMaterial);
    springMesh.add(outerTabMesh);
    // springMesh.add(new THREE.Mesh(new THREE.ExtrudeGeometry(outerTabShape, { depth: thickness, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x00ffcc })));

    // return new THREE.Line(geometry, material);
    return [springMesh, new THREE.Line(geoLine, matLine)];
}

export function createSpringSkeletonAbsArc(id, od, params, baseAngle) {
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

export function createSpringSkeleton(id, od, params, baseAngle) {
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

/**
 * Creates the full assembly of multiple spring legs.
 */
export function createFullSpringAssembly(params) {
    const { numSprings } = params;
    const assemblyGroup = new THREE.Group();

    // Calculate the parameters once for all legs
    
    const springParamsA = calculateSpringParams(params.id, params.od, params.length, numSprings);
    let springParamsB = {id: params.id, od: params.od, beamWidth:params.beamWidth, thickness:params.thickness, ...springParamsA, numSprings: numSprings};

    for (let i = 0; i < numSprings; i++) {
        // Option A: Pass the baseAngle directly to your function
        const baseAngle = i * (Math.PI * 2 / numSprings);
        const [legMesh,]= createSpringLegWithRadialThickness(springParamsB, baseAngle);
        
        /* OR Option B: Generate one leg at angle 0 and rotate the mesh:
        const legMesh = createSpringLegWithRadialThickness(springParams, 0);
        legMesh.rotation.z = i * (Math.PI * 2 / numSprings);
        */

        assemblyGroup.add(legMesh);
    }
    // console.log(assemblyGroup);

    return assemblyGroup;
}