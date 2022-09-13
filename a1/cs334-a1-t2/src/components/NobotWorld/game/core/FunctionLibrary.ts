/*
 * FunctionLibrary.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { WorldSpace } from "../enums/WorldSpace";

/* -------------------------------------------------------------------------- */
/*                                   MESHES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Converts mesh materials in a GLTF scene to Phong materials.
 * @param child The mesh object in the GLTF scene
 */
export function setUpMeshProperties(child: THREE.Mesh): void {
  child.castShadow = true;
  child.receiveShadow = true;

  // function for setting up phong materials
  function phongifyMaterial(
    material: THREE.MeshPhongMaterial
  ): THREE.MeshPhongMaterial {
    if (material.map !== null) {
      const mat = new THREE.MeshPhongMaterial();
      mat.shininess = 0;
      mat.name = material.name;
      mat.map = material.map;
      mat.map!.anisotropy = 4;
      mat.aoMap = material.aoMap;
      mat.transparent = material.transparent;
      return mat;
    }
    return material;
  }

  // apply function to all children of array
  if (Array.isArray(child.material)) {
    for (let i = 0; i < child.material.length; i += 1) {
      child.material[i] = phongifyMaterial(
        child.material[i] as THREE.MeshPhongMaterial
      );
    }
    // otherwise just apply to single material
  } else {
    child.material = phongifyMaterial(
      child.material as THREE.MeshPhongMaterial
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    MATH                                    */
/* -------------------------------------------------------------------------- */

/**
 * Checks if two numbers have the same signs
 * @param n1 The first number
 * @param n2 The second number
 */
export function haveSameSigns(n1: number, n2: number): boolean {
  return n1 < 0 === n2 < 0;
}

/**
 * Checks if two numbers have different signs
 * @param n1 The first number
 * @param n2 The second number
 */
export function haveDifferentSigns(n1: number, n2: number): boolean {
  return n1 < 0 !== n2 < 0;
}

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param  a Vector to construct 2D matrix from
 * @param b Vector to apply basis to
 */
export function applyVectorMatrixXZ(
  a: THREE.Vector3,
  b: THREE.Vector3
): THREE.Vector3 {
  return new THREE.Vector3(a.x * b.z + a.z * b.x, b.y, a.z * b.z + -a.x * b.x);
}

/* -------------------------------------------------------------------------- */
/*                                 DIRECTIONS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns the local or global world matrix
 * @param obj
 * @param space
 * @returns
 */
export function getMatrix(
  obj: THREE.Object3D,
  space: WorldSpace
): THREE.Matrix4 {
  if (space === WorldSpace.Local) return obj.matrix;
  return obj.matrixWorld;
}

export function getRight(
  obj: THREE.Object3D,
  space: WorldSpace = WorldSpace.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[2]
  );
}

export function getUp(
  obj: THREE.Object3D,
  space: WorldSpace = WorldSpace.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[4],
    matrix.elements[5],
    matrix.elements[6]
  );
}

export function getForward(
  obj: THREE.Object3D,
  space: WorldSpace = WorldSpace.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[8],
    matrix.elements[9],
    matrix.elements[10]
  );
}

export function getBack(
  obj: THREE.Object3D,
  space: WorldSpace = WorldSpace.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    -matrix.elements[8],
    -matrix.elements[9],
    -matrix.elements[10]
  );
}

/* -------------------------------------------------------------------------- */
/*                           ANGLES BETWEEN VECTORS                           */
/* -------------------------------------------------------------------------- */

/**
 * Gets the angle between two vectors, unsigned
 * @param v1
 * @param v2
 * @param dotTreshold
 * @returns
 */
export function getAngleBetweenVectors(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  dotTreshold: number = 0.0005
): number {
  let angle: number;
  const dot = v1.dot(v2);
  // If dot is close to 1, we'll round angle to zero
  if (dot > 1 - dotTreshold) {
    angle = 0;
  } else if (dot < -1 + dotTreshold) {
    angle = Math.PI;
  } else {
    // Get angle difference in radians
    angle = Math.acos(dot);
  }

  return angle;
}

/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */
export function getSignedAngleBetweenVectors(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  dotTreshold: number = 0.0005
): number {
  let angle = getAngleBetweenVectors(v1, v2, dotTreshold);
  // Get vector pointing up or down
  const cross = new THREE.Vector3().crossVectors(v1, v2);
  // Compare cross with normal to find out direction
  if (normal.dot(cross) < 0) {
    angle = -angle;
  }
  return angle;
}
