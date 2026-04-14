import { GUI } from 'jsm/libs/lil-gui.module.min.js';
import { STLExporter } from 'jsm/exporters/STLExporter.js';

const exporter = new STLExporter();
let mesh = {};

export function setExport(inMesh){
    mesh = inMesh;
}
export function addGUI(){
    const params = {
				exportASCII: exportASCII,
				exportBinary: exportBinary
			};
    const gui = new GUI();
    gui.add( params, 'exportASCII' ).name( 'Export STL (ASCII)' );
    gui.add( params, 'exportBinary' ).name( 'Export STL (Binary)' );
    gui.open();
}

export function exportASCII() {

    const result = exporter.parse( mesh );
    saveString( result, 'box.stl' );

}

export function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}
export function exportBinary() {

    const result = exporter.parse( mesh, { binary: true } );
    saveArrayBuffer( result, 'box.stl' );

}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );
export function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

}

export function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}