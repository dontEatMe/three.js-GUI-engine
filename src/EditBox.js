import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const EDITBOX_BASE       = 0;
const EDITBOX_CURSOR     = 1;
const EDITBOX_SELECTAREA = 2;
const EDITBOX_TEXT       = 3;

class XRayMesh extends THREE.Mesh {
	raycast ( raycaster, intersects ) { }
}

class EditBoxText extends THREE.Object3D { // TODO for another objects with clicks on text
	#text; // TODO remove this state
	#textColor;
	#xHeight;
	#size;
	#plane;
	#material;
	
	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#text = txt;
		this.#generateTextMesh();
	}

	constructor( parameters ) {
		super();
		parameters = parameters || {};
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'default';
		this.#xHeight = parameters.xHeight !== undefined ? parameters.xHeight : 8; // x-height for font
		this.#text = parameters.text !== undefined ? parameters.text : 'label';
		this.#size = parameters.size !== undefined ? parameters.size : undefined;
		this.#textColor = parameters.textColor !== undefined ? parameters.textColor : 0xffffff;
		this.threeFont = parameters.threeFont!==undefined ? parameters.threeFont : undefined;
		this.#plane = parameters.plane;
		this.#material = new THREE.MeshBasicMaterial( { color: this.#textColor, clippingPlanes: [ this.#plane ]});
		this.#generateTextMesh();
	}
	
	#generateTextMesh() {
		console.log('here');
		if (this.threeFont !== undefined) {
			this.children.forEach((child)=>child.geometry.dispose());
			this.remove(...this.children);
			const shapes = this.threeFont.generateShapes( this.#text, this.#size );
			shapes.forEach((shape) => {
				const geometry = new THREE.ShapeGeometry( shape );
				geometry.computeBoundingBox();
				this.add(new XRayMesh(geometry, this.#material))
			});
		}
	}
}

class EditBox extends THREE.Object3D {
	#text;
	#textColor;
	#xHeight;
	#placeholder;
	#placeholderColor;
	#active;
	#activeTime;
	#localPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0);
	#textPointer;
	#startSelectTextPointer;

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
		this.#generateTextMesh();
	}
	get text () {
		return this.#text;
	}
	set text (txt) {
		this.#activeTime = Date.now();
		this.#text = txt;
		this.#generateTextMesh();
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
		this.#generateTextMesh();
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
		this.cursor = parameters.cursor !== undefined ? parameters.cursor : 'text';
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
		const geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.PlaneGeometry(100,25);
		geometry.computeBoundingBox();
		const material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xcccccc });
		this.bgColor = material.color.getHex(); // TODO getter/setter
		const base = new THREE.Mesh(geometry, material);
		this.add(base);
		const cursorMaterial = new THREE.LineBasicMaterial({
			color: this.#textColor
		});
		const points = [];
		points.push( new THREE.Vector3( 0, -this.#xHeight , 0 ) );
		points.push( new THREE.Vector3( 0, this.#xHeight, 0 ) );
		const cursorGeometry = new THREE.BufferGeometry().setFromPoints( points );
		const cursorLine = new THREE.Line( cursorGeometry, cursorMaterial );
		cursorLine.visible = false;
		cursorLine.position.z = 3;
		this.add(cursorLine);
		const selectAreaGeometry = new THREE.PlaneGeometry(0, 0);
		const selectArea = new XRayMesh(selectAreaGeometry, new THREE.MeshBasicMaterial( { color: 0x808080, clippingPlanes: [ new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 0), this.#localPlane ] } ));
		selectArea.visible = false;
		selectArea.position.z = 1;
		this.add(selectArea);
		const textMesh = new EditBoxText( {threeFont: this.threeFont, text: this.#text, textColor: this.#textColor, size: this.textSize, plane: this.#localPlane } );
		//new XRayMesh(textGeometry, new THREE.MeshBasicMaterial({ color: this.isPlaceholder ? this.#placeholderColor : this.#textColor, clippingPlanes: [ this.#localPlane ] }));
		textMesh.position.z = 2;
		this.add(textMesh); // TODO tipColor
		this.#generateTextMesh();
	}
	changeColor( color ) {
		this.children[EDITBOX_BASE].material.color.setHex(color);
	}
	#generateTextMesh() {
		if ( this.threeFont!==undefined ) {
			let itemText = ''; // TODO getter/setter
			if (this.password === true) {
				for (let i=0; i<this.text.length; i++) {
					itemText+='*';
				}
			} else {
				itemText = this.#text;
			}
			this.children[EDITBOX_TEXT].text = this.isPlaceholder ? this.#placeholder : itemText;
			
			
			// regenerate TextGeometry with right scale
			const textGeometry = new TextGeometry(this.isPlaceholder ? this.#placeholder : itemText, {
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
			this.children[EDITBOX_SELECTAREA].geometry.dispose();
			this.children[EDITBOX_SELECTAREA].geometry = new THREE.PlaneGeometry(textGeometryWidth+this.#xHeight, this.#xHeight*2);
			let boundingBoxWidth = Math.abs(this.children[EDITBOX_BASE].geometry.boundingBox.max.x - this.children[EDITBOX_BASE].geometry.boundingBox.min.x);
			textGeometry.dispose();
			
			

			
			// clipping plane constant not updated on position set, update it before Mesh render
			this.children[EDITBOX_BASE].onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
				if (this.parent.#active) {
					if (Date.now() - this.parent.#activeTime < 750) {
						this.parent.children[EDITBOX_CURSOR].visible = true;
					} else {
						this.parent.children[EDITBOX_CURSOR].visible = ((Date.now() - this.parent.#activeTime) % 1500) < 750;
					}
					this.parent.children[EDITBOX_SELECTAREA].visible = true;
				} else {
					this.parent.children[EDITBOX_CURSOR].visible = false;
					this.parent.children[EDITBOX_SELECTAREA].visible = false;
				}
				this.parent.#localPlane.constant = -this.parent.position.x + Math.abs(this.parent.children[EDITBOX_BASE].geometry.boundingBox.max.x - this.parent.children[EDITBOX_BASE].geometry.boundingBox.min.x)/2 - this.parent.#xHeight;
				this.parent.children[EDITBOX_SELECTAREA].material.clippingPlanes[0].constant = this.parent.position.x + this.parent.children[EDITBOX_CURSOR].position.x;
			};
			if (textGeometryWidth <= boundingBoxWidth - this.#xHeight*2) {
				this.children[EDITBOX_TEXT].position.x = this.children[EDITBOX_BASE].geometry.boundingBox.min.x + this.#xHeight;
			} else {
				this.children[EDITBOX_TEXT].position.x = this.children[EDITBOX_BASE].geometry.boundingBox.max.x - textGeometryWidth - this.#xHeight;
			}
			this.children[EDITBOX_TEXT].position.y = -this.#xHeight/2;
			if (this.children[EDITBOX_TEXT].children.length === 0) {
				this.children[EDITBOX_CURSOR].position.x = this.children[EDITBOX_TEXT].position.x;
			} else {
				this.children[EDITBOX_CURSOR].position.x = this.children[EDITBOX_TEXT].position.x + this.children[EDITBOX_TEXT].children[this.children[EDITBOX_TEXT].children.length-1].geometry.boundingBox.max.x;
			}
			
			this.children[EDITBOX_SELECTAREA].position.set(this.children[EDITBOX_TEXT].position.x+textGeometryWidth/2,this.children[EDITBOX_TEXT].position.y+this.#xHeight/2,this.children[EDITBOX_SELECTAREA].position.z);
		}
	}
	onmouseup ( intersect ) { }
	onmousedown ( intersect ) {
		console.log(intersect);
		this.active = true;
		
		console.log(intersect.point);
		
		if (this.children[EDITBOX_TEXT].children.length !== 0) {
			let boundingBoxWidth = Math.abs(this.children[EDITBOX_BASE].geometry.boundingBox.max.x - this.children[EDITBOX_BASE].geometry.boundingBox.min.x);
			let textGeometryWidth = this.children[EDITBOX_TEXT].children[this.children[EDITBOX_TEXT].children.length-1].geometry.boundingBox.max.x;

			let editBoxPos = 0;
			if (textGeometryWidth <= boundingBoxWidth - this.#xHeight*2) {
				editBoxPos = this.children[EDITBOX_BASE].geometry.boundingBox.min.x + this.#xHeight;
			} else {
				editBoxPos = this.children[EDITBOX_BASE].geometry.boundingBox.max.x - textGeometryWidth - this.#xHeight;
			}
			let nearX = this.children[EDITBOX_TEXT].children.reduce((accum,letter) => {
				
				
				return Math.abs(intersect.point.x-(letter.geometry.boundingBox.max.x+editBoxPos))<Math.abs(intersect.point.x-accum) ? (letter.geometry.boundingBox.max.x+editBoxPos) : accum
			}, this.children[EDITBOX_TEXT].children[this.children[EDITBOX_TEXT].children.length-1].geometry.boundingBox.max.x+editBoxPos);
			console.log(nearX);
			this.children[EDITBOX_CURSOR].position.x =  nearX;
		} else {
			this.children[EDITBOX_CURSOR].position.x = this.children[EDITBOX_TEXT].position.x;
		}
		//this.children[EDITBOX_SELECTAREA].geometry.dispose();
		//this.children[EDITBOX_SELECTAREA].geometry = new THREE.PlaneGeometry(textGeometryWidth+this.#xHeight, this.#xHeight*2);

	
	}
	onmouseover ( intersect ) {
		this.changeColor( 0xaaaaaa );
	}
	onmouseout ( object ) {
		if (!this.active) {
			this.changeColor( 0xcccccc );
		}
	}
}

export { EditBox, EDITBOX_BASE, EDITBOX_CURSOR, EDITBOX_SELECTAREA, EDITBOX_TEXT };