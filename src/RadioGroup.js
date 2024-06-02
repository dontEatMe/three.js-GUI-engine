import * as THREE from 'three';

const RADIOGROUP_SELECT = 0;

const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };

class RadioGroup extends THREE.Group {
	#selectedRadioButton = null;

	get selectedRadioButton() {
		return this.#selectedRadioButton;
	}
	set selectedRadioButton( object ) {
		this.#selectedRadioButton = object;
		this.children[RADIOGROUP_SELECT].position.x = object.position.x;
		this.children[RADIOGROUP_SELECT].position.y = object.position.y;
	}
	constructor( parameters ) {
		super();
		parameters = parameters || {};
		let geometry = parameters.geometry !== undefined ? parameters.geometry : new THREE.CircleGeometry(12.5,16);
		let material = parameters.material !== undefined ? parameters.material : new THREE.MeshBasicMaterial({ color: 0xffffff });
		let base =  new THREE.Mesh(geometry, material);
		base.position.z = 1;
		this.add(base);
	}
	add( object ) {
		if (this.children.length === 1) { // add first RadioButton
			this.selectedRadioButton = object;
		}
		if ( arguments.length > 1 ) {
			for ( let i = 0; i < arguments.length; i ++ ) {
				this.add( arguments[ i ] );
			}
			return this;
		}
		if ( object === this ) {
			console.error( 'RadioGroup.add: object can\'t be added as a child of itself.', object );
			return this;
		}
		if ( object && object.isObject3D ) {
			if ( object.parent !== null ) {
				object.parent.remove( object );
			}
			object.parent = this;
			this.children.push( object );
			object.dispatchEvent( _addedEvent );
		} else {
			console.error( 'RadioGroup.add: object not an instance of THREE.Object3D.', object );
		}
		return this;
	}
	changeColor( color ) {
		this.children[RADIOGROUP_SELECT].material.color.setHex(color);
	}
	onmouseup ( object ) {  }
	onmousedown ( object ) {  }
	onmouseover ( object ) {  }
	onmouseout ( object ) {  }
}

export default RadioGroup;