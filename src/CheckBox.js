import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { TextMesh }  from './Common.js';

const CHECKBOX_BASE   = 0;
const CHECKBOX_SELECT = 1;
const CHECKBOX_TEXT   = 2;

class CheckBox extends THREE.Object3D {
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
		this.children[CHECKBOX_TEXT].material.color.setHex(this.#textColor);
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'checkbox';
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
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(50,50);
		geometry.computeBoundingBox();
		const material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0x666666 });
		const base = new THREE.Mesh(geometry, material);
		this.add(base);
		const selectGeometry = parameters.selectGeometry !== undefined ? parameters.selectGeometry : new THREE.PlaneGeometry(25,25);
		const selectMaterial =  parameters.selectMaterial !== undefined ? parameters.selectMaterial : new THREE.MeshBasicMaterial({ color: 0xffffff });
		const select =  new THREE.Mesh(selectGeometry, selectMaterial);
		select.visible = parameters.checked !== undefined ? parameters.checked : false;
		select.position.z = 1;
		this.add(select);
		const textMesh = new TextMesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
		this.add(textMesh);
		this.#generateTextMesh();
	}
	set() {
		this.children[CHECKBOX_SELECT].visible = true;
	}
	unset() {
		this.children[CHECKBOX_SELECT].visible = false;
	}
	changeColor( color ) {
		this.children[CHECKBOX_BASE].material.color.setHex(color);
	}
	#generateTextMesh() {
		if ( this.threeFont!==undefined ) {
			this.children[CHECKBOX_TEXT].geometry.dispose();
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
			this.children[CHECKBOX_TEXT].geometry = textGeometry;
			let textGeometryWidth = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
			let textGeometryHeight = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
			let checkerWidth = Math.abs(this.children[CHECKBOX_BASE].geometry.boundingBox.max.x - this.children[CHECKBOX_BASE].geometry.boundingBox.min.x);
			this.children[CHECKBOX_TEXT].position.x = checkerWidth/2 + checkerWidth/5;
			this.children[CHECKBOX_TEXT].position.y = -this.#xHeight/2;
		}
	}
	onmouseup ( intersect ) {
		if (this.children[CHECKBOX_SELECT].visible) this.unset();
		else this.set();
	}
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) {
		this.changeColor( 0x888888 );
	}
	onmouseout ( object ) {
		this.changeColor( 0x666666 );
	}
}

export { CheckBox, CHECKBOX_BASE, CHECKBOX_SELECT, CHECKBOX_TEXT };