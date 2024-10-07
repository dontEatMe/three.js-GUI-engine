import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TextMesh }  from './Common.js';

const RADIOBUTTON_BASE = 0;
const RADIOBUTTON_TEXT = 1;

class RadioButton extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;

	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#text = txt;
		this.#generateTextMesh();
	}
	get textColor () {
		return this.#textColor;
	}
	set textColor (color) {
		this.#textColor = color;
		this.children[RADIOBUTTON_TEXT].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'radiobutton';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0x000000;
		this.threeFont = parameters.threeFont!==undefined ? parameters.threeFont : undefined;
		// create TextGeometry with default 100 size for get bounding box
		// use 'x' as symbol for x-height distance calculation
		const textGeometry = new TextGeometry('x', {
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
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.CircleGeometry(25,32);
		geometry.computeBoundingBox();
		const material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		const base = new THREE.Mesh( geometry, material );
		this.add(base);
		const textMesh = new TextMesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		this.add(textMesh);
		this.#generateTextMesh();
	}
	changeColor( color ) {
		this.children[RADIOBUTTON_BASE].material.color.setHex(color);
	}
	#generateTextMesh() {
		if ( this.threeFont!==undefined ) {
			this.children[RADIOBUTTON_TEXT].geometry.dispose();
			// regenerate TextGeometry with right scale
			const textGeometry = new TextGeometry(this.#text, {
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
			this.children[RADIOBUTTON_TEXT].geometry = textGeometry;
			let textGeometryWidth = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
			let textGeometryHeight = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
			let checkerWidth = Math.abs(this.children[RADIOBUTTON_BASE].geometry.boundingBox.max.x - this.children[RADIOBUTTON_BASE].geometry.boundingBox.min.x);
			this.children[RADIOBUTTON_TEXT].position.x = checkerWidth/2 + checkerWidth/5;
			this.children[RADIOBUTTON_TEXT].position.y = -this.#xHeight/2;
		}
	}
	onmouseup ( intersect ) {
		this.parent.selectedRadioButton = this;
	}
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) {
		this.changeColor( 0x888888 );
	}
	onmouseout ( object ) {
		this.changeColor( 0x666666 );
	}
}

export { RadioButton, RADIOBUTTON_BASE, RADIOBUTTON_TEXT };