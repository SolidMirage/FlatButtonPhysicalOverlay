import * as THREE from "three";

export function createRectangleSpringButton(params){
    const {fullBotLeftX, fullBotLeftY,innerWidth, innerHeight, padWidth, padHeight, beamWidth, thickness, borderWidth, borderThickness,overlap} = params;
    // const overlap = params.overlap || 0;

    const rectButtonGroup = new THREE.Group();

    // create center touch pad
    const padShape = new THREE.Shape();
    const padBotLeftX = innerWidth / 2 - padWidth / 2;
    const padBotLeftY = innerHeight / 2 - padHeight / 2;
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
    params.hIn = 1;
    params.vIn = -1;
    params.startX = startX;
    params.startY = startY;
    const topLeftSpringShape = createRectSpring(params);
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
    params.hIn = -1;
    params.vIn = -1;
    params.startX = startX;
    params.startY = startY;
    const topRightSpringShape = createRectSpring(params);
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
    params.hIn = 1;
    params.vIn = 1;
    params.startX = startX;
    params.startY = startY;
    const bottomLeftSpringShape = createRectSpring(params);
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
    params.hIn = -1;
    params.vIn = 1;
    params.startX = startX;
    params.startY = startY;
    const bottomRightSpringShape = createRectSpring(params);
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
    const {fullBotLeftX, fullBotLeftY, innerWidth, innerHeight, borderWidth,borderThickness} = params;
    console.log(params);
    // create border that goes full width + borderWidth and fullHeight+borderWidth.
    const buttonOuterBorder = new THREE.Shape();
    buttonOuterBorder.moveTo(fullBotLeftX - borderWidth, fullBotLeftY - borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX + innerWidth + borderWidth, fullBotLeftY - borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX + innerWidth + borderWidth, fullBotLeftY + innerHeight + borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX - borderWidth, fullBotLeftY + innerHeight + borderWidth);
    buttonOuterBorder.lineTo(fullBotLeftX - borderWidth, fullBotLeftY - borderWidth);

    const holePath = new THREE.Path();
    holePath.moveTo(fullBotLeftX, fullBotLeftY);
    holePath.lineTo(fullBotLeftX + innerWidth, fullBotLeftY);
    holePath.lineTo(fullBotLeftX + innerWidth, fullBotLeftY + innerHeight);
    holePath.lineTo(fullBotLeftX, fullBotLeftY + innerHeight);
    holePath.lineTo(fullBotLeftX, fullBotLeftY);
    buttonOuterBorder.holes.push(holePath);

    const borderGeo = new THREE.ExtrudeGeometry(buttonOuterBorder, { depth: borderThickness, bevelEnabled: false });
    return new THREE.Mesh(borderGeo, new THREE.MeshStandardMaterial({ color: 0xcccccc }));
}

function createRectSpring(params){
    const{startX, startY, hIn, vIn, overlap, beamWidth,beamGap} = params;
    const rectSpringShape = new THREE.Shape();
    const hOut = -1 * hIn;
    const vOut = -1 * vIn;
    let newX = startX+ (hIn*overlap);
    // console.log('startX:' + startX)
    let newY = startY;
    let xSpaceForSpring = (params.innerWidth - params.padWidth)/2;
    let xUnitForSpring = xSpaceForSpring/10;
    let ySpaceForSpring = (params.padHeight/2)*0.8;
    let yUnitForSpring = ySpaceForSpring/3;
    console.log(yUnitForSpring);


    // 0. start at pad corner, horiz in overlap
    rectSpringShape.moveTo(newX, newY);
    
    // 1. move horizontally out 2 + offset
    // newX = newX + hOut * ((beamWidth+beamGap)+overlap);
    newX = newX + hOut * (3*xUnitForSpring + overlap);
    rectSpringShape.lineTo(newX, newY);

    // 2. move vertically in 2
    // newY = newY + vIn * (beamWidth+beamGap);
    newY = newY + vIn * (2*yUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 3. move horizontally out 1
    // newX = newX + hOut * (1*beamGap);
    newX = newX + hOut * (4*xUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 4. move vertically out 2
    // newY = newY + vOut * (beamWidth+beamGap);
    newY = newY + vOut * (2*yUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 5. move horizontally out 2+ overlap
    // let xtraX = 0;
    // if(hIn > 0){
    //     newX = newX + hOut * ((beamWidth+beamGap)+overlap);
    //     xtraX = -overlap;
    //     if(newX <= 0-params.borderWidth){
    //         newX = overlap-params.borderWidth;
    //         xtraX = newX;
    //     }
    // }else{
    //     newX = newX + hOut * ((beamWidth+beamGap)-overlap);
    //     xtraX = params.fullWidth + overlap;
    //     if(newX >= params.fullWidth+params.borderWidth){
    //         newX = params.fullWidth-overlap+params.borderWidth;
    //         xtraX = newX;
    //     }
        
    // }
    // newX = newX + hOut * ((beamWidth + beamGap)+overlap);
    newX = newX + hOut * (3*xUnitForSpring + overlap);
    rectSpringShape.lineTo(newX, newY);
    
    // 5.1 move to edge of space
    // let xtraX = hIn < 0?params.fullWidth+overlap :-overlap;
    // rectSpringShape.lineTo(xtraX, newY);

    // 6. move vertically in 1
        // newY = newY + vIn * (1*beamWidth);
    newY = newY + vIn * (yUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 6.1 move back to edge of spring
    // rectSpringShape.lineTo(newX, newY);

    // 7. move horizontally in 1+overlap
    // newX = newX + hIn * ((1*beamGap) + overlap);
    newX = newX + hIn * (2*xUnitForSpring + overlap);
    rectSpringShape.lineTo(newX, newY);

    // 8. move vertically in 2
    // newY = newY + vIn * (beamWidth+beamGap);
    newY = newY + vIn * (2*yUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 9. move horizontally in 3
    // newX = newX + hIn * (2*beamWidth+beamGap);
    newX = newX + hIn * (6*xUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 10. move vertically out 2
    // newY = newY + vOut * (beamWidth+beamGap);
    newY = newY + vOut * (2*yUnitForSpring);
    rectSpringShape.lineTo(newX, newY);

    // 11. move horizontally in 1+overlap
    // newX = newX + hIn * ((1*beamGap) + overlap);
    newX = newX + hIn * (2*xUnitForSpring + overlap);
    rectSpringShape.lineTo(newX, newY);

    rectSpringShape.closePath();

    return rectSpringShape;
}