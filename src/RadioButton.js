import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const RADIOBUTTON_BASE          = 0;
const RADIOBUTTON_TEXT_UNDERLAY = 1;
const RADIOBUTTON_TEXT          = 2;

class RadioButton extends THREE.Object3D {
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
		const base = new THREE.Mesh(geometry, material);
		this.add(base);
		this.#generateTextMesh();
	}
	changeColor( color ) {
		this.children[RADIOBUTTON_BASE].material.color.setHex(color);
	}
	#generateTextMesh() {
		if ( this.threeFont!==undefined ) {
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
			let textGeometryWidth = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
			let textGeometryHeight = (this.#text === '') ? 0 : Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
			let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.#textColor }) );
			let checkerWidth = Math.abs(this.children[RADIOBUTTON_BASE].geometry.boundingBox.max.x - this.children[RADIOBUTTON_BASE].geometry.boundingBox.min.x);
			textMesh.position.x = checkerWidth/2 + checkerWidth/5;
			textMesh.position.y = -this.#xHeight/2;
			this.add(textMesh);
			// for select from mouse move
			let boundingPlaneGeometry = new THREE.PlaneGeometry(textGeometryWidth, textGeometryHeight);
			let boundingPlaneMesh = new THREE.Mesh(boundingPlaneGeometry, new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } ));
			boundingPlaneMesh.position.set(textMesh.position.x+textGeometryWidth/2,textMesh.position.y+textGeometryHeight/2,textMesh.position.z);
			this.add(boundingPlaneMesh);
		}
	}
	#reDraw() {
		this.children[RADIOBUTTON_TEXT_UNDERLAY].geometry.dispose();
		this.remove(this.children[RADIOBUTTON_TEXT_UNDERLAY]);
		this.children[RADIOBUTTON_TEXT].geometry.dispose();
		this.remove(this.children[RADIOBUTTON_TEXT]);
		this.#generateTextMesh();
	}
	onmouseup ( intersect ) {
		this.parent.selectedRadioButton = this;
	}
	onmousedown ( intersect ) { }
	onmouseover ( intersect ) {
		this.changeColor( 0x888888 );
	}
	onmouseout ( object ) {
		this.changeColor(0x666666);
	}
}

export default RadioButton;