import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TextMesh }  from './Common.js';

const LABEL_TEXT = 0;

class Label extends THREE.Object3D {
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
		this.children[LABEL_TEXT].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'label';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0xffffff;
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
		const textMesh = new TextMesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		this.add(textMesh);
		this.#generateTextMesh();
	}
	#generateTextMesh() {
		if ( this.threeFont!==undefined ) {
			this.children[LABEL_TEXT].geometry.dispose();
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
			this.children[LABEL_TEXT].geometry = textGeometry;
			let textGeometryWidth = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
			let textGeometryHeight = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
			this.children[LABEL_TEXT].position.x = -textGeometryWidth/2;
			this.children[LABEL_TEXT].position.y = -this.#xHeight/2;
		}
	}
	onmouseup ( intersect ) { }
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) { }
	onmouseout ( object ) { }
}

export default Label;