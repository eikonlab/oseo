// =========================================================
// ==========================V1 cube vert===================
// =========================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

 const geometry = new THREE.BoxGeometry(1, 1, 1);
 const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
 const cube = new THREE.Mesh(geometry, material);
 scene.add(cube);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// Fonction pour vérifier si la caméra est dans la zone spécifiée
function isCameraInZone(cameraPosition, targetPosition, radius) {
    const distance = cameraPosition.distanceTo(targetPosition);
    return distance <= radius;
}

// Position de la zone et rayon
const targetPosition = new THREE.Vector3(3.44257254670091, 2.2261532894484044, 2.86233048276735);
const radius = 5;

// Fonction pour mettre à jour la couleur du cube en fonction de la rotation de la caméra et de sa position par rapport à la zone
function updateCubeColor() {
    // Obtenir la matrice de rotation de la caméra
    const cameraRotationMatrix = new THREE.Matrix4();
    cameraRotationMatrix.extractRotation(camera.matrix);

    // Obtenir l'angle de rotation sur l'axe y de la caméra
    const euler = new THREE.Euler();
    euler.setFromRotationMatrix(cameraRotationMatrix);
    const cameraRotationY = euler.y;

    // Convertir en degrés
    const cameraRotationYDeg = THREE.MathUtils.radToDeg(cameraRotationY);

    // Mettre à jour la couleur du cube en fonction de la rotation de la caméra
    if (cameraRotationYDeg >= 45) {
        // cube.material.color.set(0xff0000); // Rouge
    } else {
        // Vérifier si la caméra est dans la zone spécifiée
        const isInZone = isCameraInZone(camera.position, targetPosition, radius);
        if (isInZone) {
            cube.material.color.set(0x0000ff); // Bleu
        } else {
            cube.material.color.set(0x00ff00); // Vert
        }
    }
}

// Écouter l'événement de changement de la caméra dans les contrôles OrbitControls
controls.addEventListener('change', updateCubeColor);

function animate() {
    requestAnimationFrame(animate);

   // console.log("Position de la caméra :", camera.position);
   // console.log("Rotation de la caméra :", camera.rotation);

    renderer.render(scene, camera);
    controls.update();
}
animate();
