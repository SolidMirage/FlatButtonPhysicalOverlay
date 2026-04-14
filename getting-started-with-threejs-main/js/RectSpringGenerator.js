import * as THREE from "three";

export function createRectangleSpringButton(params){
    const {fullBotLeftX, fullBotLeftY,fullWidth, fullHeight, padWidth, padHeight, beamWidth, thickness, borderWidth, borderThickness} = params;
    const overlap = params.overlap || 0;

    const rectButtonGroup = new THREE.Group();

    // create center touch pad
    const padShape = new THREE.Shape();
    const padBotLeftX = fullWidth / 2 - padWidth / 2;
    const padBotLeftY = fullHeight / 2 - padHeight / 2;
    padShape.moveTo(padBotLeftX, padBotLeftY);
    padShape.lineTo(padBotLeftX + padWidth, padBotLeftY);
    padShape.lineTo(padBotLeftX + padWidth, padBotLeftY + padHeight);
    padShape.lineTo(padBotLeftX, padBotLeftY + padHeight);
    padShape.lineTo(padBotLeftX, padBotLeftY);

    const padGeo = new THREE.ExtrudeGeometry(padShape, { 
        depth: thickness, 
        bevelEnabled: false 
    });
    const padMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    rectButtonGroup.add(padMesh);


    // create topLeft spring
    let startX = padBotLeftX;
    let startY = padBotLeftY + padHeight;
    const topLeftSpringShape = createRectSpring(startX, startY, 1, -1, overlap, beamWidth);
    const topLeftSpringGeo = new THREE.ExtrudeGeometry(topLeftSpringShape, { 
        depth: thickness, 
        bevelEnabled: false 
    });
    const topLeftSpringMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const topLeftSpringMesh = new THREE.Mesh(topLeftSpringGeo, topLeftSpringMat);
    rectButtonGroup.add(topLeftSpringMesh);

    // create topRight spring
    startX = padBotLeftX + padWidth;
    startY = padBotLeftY + padHeight;
    const topRightSpringShape = createRectSpring(startX, startY, -1, -1, overlap, beamWidth);
    const topRightSpringGeo = new THREE.ExtrudeGeometry(topRightSpringShape, { 
        depth: thickness, 
        bevelEnabled: false 
    });
    const topRightSpringMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const topRightSpringMesh = new THREE.Mesh(topRightSpringGeo, topRightSpringMat);
    rectButtonGroup.add(topRightSpringMesh);

    // create bottomLeft spring
    startX = padBotLeftX;
    startY = padBotLeftY;
    const bottomLeftSpringShape = createRectSpring(startX, startY, 1, 1, overlap, beamWidth);
    const bottomLeftSpringGeo = new THREE.ExtrudeGeometry(bottomLeftSpringShape, { 
        depth: thickness, 
        bevelEnabled: false 
    });
    const bottomLeftSpringMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const bottomLeftSpringMesh = new THREE.Mesh(bottomLeftSpringGeo, bottomLeftSpringMat);
    rectButtonGroup.add(bottomLeftSpringMesh);

    // create bottomRight spring
    startX = padBotLeftX + padWidth;
    startY = padBotLeftY;
    const bottomRightSpringShape = createRectSpring(startX, startY, -1, 1, overlap, beamWidth);
    const bottomRightSpringGeo = new THREE.ExtrudeGeometry(bottomRightSpringShape, { 
        depth: thickness, 
        bevelEnabled: false 
    });
    const bottomRightSpringMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const bottomRightSpringMesh = new THREE.Mesh(bottomRightSpringGeo, bottomRightSpringMat);
    rectButtonGroup.add(bottomRightSpringMesh);

    const borderMesh = createButtonBorder(params);
    rectButtonGroup.add(borderMesh);

    return rectButtonGroup;

}

function createButtonBorder(params){
    const {fullBotLeftX, fullBotLeftY, fullWidth, fullHeight, borderWidth,borderThickness} = params;
    console.log(params);
    // create border that goes full width + borderWidth and fullHeight+borderWidth.
    const buttonOuterBorder = new THREE.Shape();
    buttonOuterBorder.moveTo(fullBotLeftX - borderWidth, fullBotLeftY - borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX + fullWidth + borderWidth, fullBotLeftY - borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX + fullWidth + borderWidth, fullBotLeftY + fullHeight + borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX - borderWidth, fullBotLeftY + fullHeight + borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX - borderWidth, fullBotLeftY - borderWidth);

    const holePath = new THREE.Path();
    holePath.moveTo(fullBotLeftX, fullBotLeftY);
    holePath.lineTo(fullBotLeftX + fullWidth, fullBotLeftY);
    holePath.lineTo(fullBotLeftX + fullWidth, fullBotLeftY + fullHeight);
    holePath.lineTo(fullBotLeftX, fullBotLeftY + fullHeight);
    holePath.lineTo(fullBotLeftX, fullBotLeftY);
    buttonOuterBorder.holes.push(holePath);

    const borderGeo = new THREE.ExtrudeGeometry(buttonOuterBorder, { depth: borderThickness, bevelEnabled: false });
    return new THREE.Mesh(borderGeo, new THREE.MeshStandardMaterial({ color: 0xcccccc }));
}

function createRectSpring(startX,startY,hIn, vIn, overlap, beamWidth){
    const rectSpringShape = new THREE.Shape();
    const hOut = -1 * hIn;
    const vOut = -1 * vIn;
    let newX = startX+ (hIn*overlap);
    let newY = startY;

    // 0. start at pad corner, horiz in overlap
    rectSpringShape.moveTo(newX, newY);
    
    // 1. move horizontally out 2 + offset
    newX = newX + hOut * ((2*beamWidth)+overlap);
    rectSpringShape.lineTo(newX, newY);

    // 2. move vertically in 2
    newY = newY + vIn * (2*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 3. move horizontally out 1
    newX = newX + hOut * (1*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 4. move vertically out 2
    newY = newY + vOut * (2*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 5. move horizontally out 2+ overlap
    newX = newX + hOut * ((2*beamWidth)+overlap);
    rectSpringShape.lineTo(newX, newY);

    // 6. move vertically in 1
    newY = newY + vIn * (1*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 7. move horizontally in 1+overlap
    newX = newX + hIn * ((1*beamWidth) + overlap);
    rectSpringShape.lineTo(newX, newY);

    // 8. move vertically in 2
    newY = newY + vIn * (2*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 9. move horizontally in 3
    newX = newX + hIn * (3*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 10. move vertically out 2
    newY = newY + vOut * (2*beamWidth);
    rectSpringShape.lineTo(newX, newY);

    // 11. move horizontally in 1+overlap
    newX = newX + hIn * ((1*beamWidth) + overlap);
    rectSpringShape.lineTo(newX, newY);

    rectSpringShape.closePath();

    return rectSpringShape;
}