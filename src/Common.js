import * as THREE from 'three';

class TextMesh extends THREE.Mesh { // TODO for another objects with clicks on text
	raycast ( raycaster, intersects ) {
		const _inverseMatrix =  new THREE.Matrix4();
		const _ray = new THREE.Ray();
		const _point = new THREE.Vector3();
		const _intersectionPointWorld = new THREE.Vector3();
		// convert ray to local space of mesh
		_inverseMatrix.copy( this.matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );
		// test with bounding box in local space
		if ( this.geometry.boundingBox !== null ) {
			if ( _ray.intersectsBox( this.geometry.boundingBox ) === true ) {
				_ray.intersectBox(this.geometry.boundingBox, _point);
				_intersectionPointWorld.copy( _point );
				_intersectionPointWorld.applyMatrix4( this.matrixWorld );
				const distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );
				if ( distance >= raycaster.near || distance <= raycaster.far ) {
					intersects.push({
						distance: distance,
						point: _point,
						object: this
					});
				}
			}
		}
	}
}

export { TextMesh }