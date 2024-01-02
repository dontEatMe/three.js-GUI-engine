import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

class EditBox extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;
	#placeholder;
	#placeholderColor;
	#active;
	#localPlane;

	get active () {
		return this.#active;
	}
	set active (act) {
		if (act === false) {
			this.changeColor(this.bgColor);
		} else {
			this.changeColor( 0xaaaaaa );
		}
		this.#active = act;
		this.#reDraw();
	}
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
		this.children[1].material.color.setHex(this.#textColor);
	}
	get isPlaceholder () {
		return ((this.#active === false) && (this.#text === ''));
	}
	get placeholder () {
		return this.#placeholder;
	}
	set placeholder (txt) {
		this.#placeholder = txt;
		this.#reDraw();
	}
	get placeholderColor () {
		return this.#placeholderColor;
	}
	set placeholderColor (color) {
		this.#placeholderColor = color;
		this.#reDraw();
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'pointer';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : '';
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0x000000;
		this.threeFont = parameters.threeFont!==undefined ? parameters.threeFont : undefined;
		this.#active = false;
		this.limit = parameters.limit !== undefined ? parameters.limit : 50;
		this.#placeholder = parameters.placeholder !== undefined ? parameters.placeholder : ''; // TODO getter/setter
		this.#placeholderColor = parameters.textColor !== undefined ? parameters.placeholderColor : 0x444444;
		this.password = parameters.password !== undefined ? parameters.password : false;
		// create TextGeometry with default 100 size for get bounding box
		// use 'x' as symbol for x-height distance calculation
		let textGeometry = new TextGeometry('x', {
			font: this.threeFont,
			size: 100,
			height: 0,
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
		geometry.computeBoundingBox();
		let boundingBoxWidth = Math.abs(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xcccccc });
		this.bgColor = material.color.getHex(); // TODO getter/setter
		let base = new THREE.Mesh(geometry, material);
		this.add(base);
		this.#localPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0);
		if ( this.threeFont!==undefined ) {
			this.#generateTextMesh();
		}
	}
	changeColor( color ) {
		this.children[0].material.color.setHex(color);
	}
	#generateTextMesh() {
		let itemText = ''; // TODO getter/setter
		if (this.password === true) {
			for (let i=0; i<this.text.length; i++) {
				itemText+='*';
			}
		} else {
			itemText = this.#text;
		}
		// regenerate TextGeometry with right scale
		let textGeometry = new TextGeometry(this.isPlaceholder ? this.#placeholder : itemText, {
			font: this.threeFont,
			size: this.textSize,
			height: 0,
			curveSegments: 4,
			bevelEnabled: false,
			bevelThickness: 0,
			bevelSize: 0,
			bevelOffset: 0,
			bevelSegments: 0
		});
		textGeometry.computeBoundingBox();
		let textGeometryWidth = Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
		let boundingBoxWidth = Math.abs(this.children[0].geometry.boundingBox.max.x - this.children[0].geometry.boundingBox.min.x);
		let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.isPlaceholder ? this.#placeholderColor : this.#textColor, clippingPlanes: [ this.#localPlane ] }) ); // TODO tipColor
		// clipping plane constant not updated on position set, update it before Mesh render
		textMesh.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
			material.clippingPlanes[0].constant = -this.parent.position.x + Math.abs(this.parent.children[0].geometry.boundingBox.max.x - this.parent.children[0].geometry.boundingBox.min.x)*.4;
		};
		if (textGeometryWidth<=boundingBoxWidth*.8) {
			textMesh.position.x = this.children[0].geometry.boundingBox.min.x + boundingBoxWidth*.1;
		} else {
			textMesh.position.x = -textGeometryWidth/2 + this.children[0].geometry.boundingBox.max.x - textGeometryWidth/2 - boundingBoxWidth*.1;
		}
		textMesh.position.y = -this.#xHeight/2;
		this.add(textMesh);
	}
	#reDraw() {
		if ( this.threeFont!==undefined ) {
			this.children[1].geometry.dispose();
			this.remove(this.children[1]);
			this.#generateTextMesh();
		}
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {
		this.active = true;
	}
	onmouseover ( object ) {
		this.changeColor( 0xaaaaaa );
	}
	onmouseout ( object ) {
		if (!this.active) {
			this.changeColor( 0xcccccc );
		}
	}
}

export default EditBox;