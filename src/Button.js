import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const BUTTON_BASE = 0;
const BUTTON_TEXT = 1;

class Button extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;

	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#text = txt;
		this.#reDraw();
	}
	get textColor () {
		return this.#textColor;
	}
	set textColor (color) {
		this.#textColor = color;
		this.children[BUTTON_TEXT].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'button';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0xffffff;
		this.threeFont = parameters.threeFont!==undefined ? parameters.threeFont : undefined;
		// create TextGeometry with default 100 size for get bounding box
		// use 'x' as symbol for x-height distance calculation
		let textGeometry = new TextGeometry('x', {
			font: this.threeFont,
			size: 100,
			depth: 0,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0,
			bevelSize: 0,
			bevelOffset: 0,
			bevelSegments: 0
		});
		textGeometry.computeBoundingBox();
		let xHeight = Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
		let textScale = this.#xHeight/xHeight;
		textGeometry.dispose();
		this.textSize = 100*textScale;
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(100,25);
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		let base = new THREE.Mesh(geometry, material);
		this.add(base);
		if ( this.threeFont!==undefined ) {
			this.#generateTextMesh();
		}
	}
	changeColor( color ) {
		this.children[BUTTON_BASE].material.color.setHex(color);
	}
	#generateTextMesh() {
		// regenerate TextGeometry with right scale
		let textGeometry = new TextGeometry(this.#text, {
			font: this.threeFont,
			size: this.textSize,
			depth: 0,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0,
			bevelSize: 0,
			bevelOffset: 0,
			bevelSegments: 0
		});
		textGeometry.computeBoundingBox();
		let textGeometryWidth = Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
		let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		textMesh.position.x = -textGeometryWidth/2;
		textMesh.position.y = -this.#xHeight/2;
		this.add(textMesh);
	}
	#reDraw() {
		if ( this.threeFont!==undefined ) {
			this.children[BUTTON_TEXT].geometry.dispose();
			this.remove(this.children[BUTTON_TEXT]);
			this.#generateTextMesh();
		}
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {  }
	onmouseover ( object ) {
		this.changeColor( 0x888888 );
	}
	onmouseout ( object ) {
		this.changeColor(0x666666);
	}
}

export default Button;