import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const EDITBOX_BASE   = 0;
const EDITBOX_TEXT   = 1;
const EDITBOX_CURSOR = 2;

class EditBox extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;
	#placeholder;
	#placeholderColor;
	#active;
	#activeTime;
	#localPlane;
	#textPointer;

	get active () {
		return this.#active;
	}
	set active (act) {
		if (act === false) {
			this.changeColor(this.bgColor);
		} else {
			this.#activeTime = Date.now();
			this.changeColor( 0xaaaaaa );
		}
		this.#active = act;
		this.#reDraw();
	}
	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#activeTime = Date.now();
		this.#text = txt;
		this.#reDraw();
	}
	get textColor () {
		return this.#textColor;
	}
	set textColor (color) {
		this.#textColor = color;
		this.children[EDITBOX_TEXT].material.color.setHex(this.isPlaceholder ? this.#placeholderColor : this.#textColor);
		this.children[EDITBOX_CURSOR].material.color.setHex(this.isPlaceholder ? this.#placeholderColor : this.#textColor);
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
		this.children[EDITBOX_TEXT].material.color.setHex(this.isPlaceholder ? this.#placeholderColor : this.#textColor);
		this.children[EDITBOX_CURSOR].material.color.setHex(this.isPlaceholder ? this.#placeholderColor : this.#textColor);
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
		this.#activeTime = 0;
		this.#textPointer = 0;
		this.limit = parameters.limit !== undefined ? parameters.limit : 50;
		this.#placeholder = parameters.placeholder !== undefined ? parameters.placeholder : ''; // TODO getter/setter
		this.#placeholderColor = parameters.placeholderColor !== undefined ? parameters.placeholderColor : 0x444444;
		this.password = parameters.password !== undefined ? parameters.password : false;
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
		geometry.computeBoundingBox();
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xcccccc });
		this.bgColor = material.color.getHex(); // TODO getter/setter
		let base = new THREE.Mesh(geometry, material);
		this.add(base);
		const cursorMaterial = new THREE.LineBasicMaterial({
			color: this.#textColor
		});
		const points = [];
		points.push( new THREE.Vector3( 0, -(this.#xHeight/2)*2 , 0 ) );
		points.push( new THREE.Vector3( 0, (this.#xHeight/2)*2, 0 ) );
		const cursorGeometry = new THREE.BufferGeometry().setFromPoints( points );
		const cursorLine = new THREE.Line( cursorGeometry, cursorMaterial );
		cursorLine.visible = false;
		this.add(cursorLine);
		this.#localPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0);
		if ( this.threeFont!==undefined ) {
			this.#generateTextMesh();
		}
	}
	changeColor( color ) {
		this.children[EDITBOX_BASE].material.color.setHex(color);
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
		let boundingBoxWidth = Math.abs(this.children[EDITBOX_BASE].geometry.boundingBox.max.x - this.children[EDITBOX_BASE].geometry.boundingBox.min.x);
		let textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({ color: this.isPlaceholder ? this.#placeholderColor : this.#textColor, clippingPlanes: [ this.#localPlane ] }) ); // TODO tipColor
		// clipping plane constant not updated on position set, update it before Mesh render
		textMesh.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
			if (this.parent.#active) {
				if (Date.now() - this.parent.#activeTime < 750) {
					this.parent.children[EDITBOX_TEXT].visible = true;
				} else {
					this.parent.children[EDITBOX_TEXT].visible = ((Date.now() - this.parent.#activeTime) % 1500) < 750;
				}
			} else {
				this.parent.children[EDITBOX_TEXT].visible = false;
			}
			if (this.parent.children[EDITBOX_CURSOR].geometry.boundingBox.max.x === -Infinity) {
				this.parent.children[EDITBOX_TEXT].position.x = this.parent.children[EDITBOX_CURSOR].position.x;
			} else {
				this.parent.children[EDITBOX_TEXT].position.x = this.parent.children[EDITBOX_CURSOR].position.x + this.parent.children[EDITBOX_CURSOR].geometry.boundingBox.max.x + this.parent.#xHeight/2;
			}
			material.clippingPlanes[0].constant = -this.parent.position.x + Math.abs(this.parent.children[EDITBOX_BASE].geometry.boundingBox.max.x - this.parent.children[EDITBOX_BASE].geometry.boundingBox.min.x)/2 - this.parent.#xHeight;
		};
		if (textGeometryWidth<=boundingBoxWidth - this.#xHeight*2) {
			textMesh.position.x = this.children[EDITBOX_BASE].geometry.boundingBox.min.x + this.#xHeight;
		} else {
			textMesh.position.x = this.children[EDITBOX_BASE].geometry.boundingBox.max.x - textGeometryWidth - this.#xHeight;
		}
		textMesh.position.y = -this.#xHeight/2;
		this.add(textMesh);
	}
	#reDraw() {
		if ( this.threeFont!==undefined ) {
			this.children[EDITBOX_CURSOR].geometry.dispose();
			this.remove(this.children[EDITBOX_CURSOR]);
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