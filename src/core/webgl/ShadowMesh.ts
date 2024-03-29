import * as THREE from 'three'

// from https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/objects/ShadowMesh.js
export default function ShadowMesh(mesh: THREE.Mesh, opacity: number = 0.6, color: number|string = 0x000000) {
  var shadowMaterial = new THREE.MeshBasicMaterial( {
		color,
		transparent: true,
		opacity,
		depthWrite: false,
		skinning: true,
		side: THREE.DoubleSide
	});

	THREE.SkinnedMesh.call(this, mesh.geometry, shadowMaterial, false);

	this.meshMatrix = mesh.matrixWorld;

	this.frustumCulled = false;
	this.matrixAutoUpdate = false;
}

ShadowMesh.prototype = Object.create(THREE.SkinnedMesh.prototype);
ShadowMesh.prototype.constructor = ShadowMesh;

ShadowMesh.prototype.update = function () {
	var shadowMatrix = new THREE.Matrix4();

	return function (plane, lightPosition4D) {
		var dot = plane.normal.x * lightPosition4D.x +
			  plane.normal.y * lightPosition4D.y +
			  plane.normal.z * lightPosition4D.z +
			  - plane.constant * lightPosition4D.w;

		var sme = shadowMatrix.elements;

		sme[0] = dot - lightPosition4D.x * plane.normal.x;
		sme[4] = - lightPosition4D.x * plane.normal.y;
		sme[8] = - lightPosition4D.x * plane.normal.z;
		sme[12] = - lightPosition4D.x * - plane.constant;

		sme[1] = - lightPosition4D.y * plane.normal.x;
		sme[5] = dot - lightPosition4D.y * plane.normal.y;
		sme[9] = - lightPosition4D.y * plane.normal.z;
		sme[13] = - lightPosition4D.y * - plane.constant;

		sme[2] = - lightPosition4D.z * plane.normal.x;
		sme[6] = - lightPosition4D.z * plane.normal.y;
		sme[10] = dot - lightPosition4D.z * plane.normal.z;
		sme[14] = - lightPosition4D.z * - plane.constant;

		sme[3] = - lightPosition4D.w * plane.normal.x;
		sme[7] = - lightPosition4D.w * plane.normal.y;
		sme[11] = - lightPosition4D.w * plane.normal.z;
		sme[15] = dot - lightPosition4D.w * - plane.constant;

		this.matrix.multiplyMatrices( shadowMatrix, this.meshMatrix );
	};
}();
