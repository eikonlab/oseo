//=======================================================================
// Importations
//=======================================================================

import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Importer OrbitControls depuis three-stdlib pour pouvoir utiliser SetAzimuthalAngle et SetPolarAngle
import { OrbitControls } from 'three-stdlib';
// Importer Tween depuis tween.js
import { Tween } from '@tweenjs/tween.js'; //potentielle transition de camera possible avec tween




//=======================================================================
// Scene
//=======================================================================

const scene = new THREE.Scene();

//light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // couleur, intensité
scene.add(ambientLight);

//camera
const camera = new THREE.PerspectiveCamera( 750, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 70;
camera.filmGauge = 36;
camera.position.x = -10;

//render
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff );
document.body.appendChild( renderer.domElement );

//loader pour importer notre modele 
const loader = new GLTFLoader();
loader.load( '../../3d/OSEO_Anamorphose_V4_OOOOOOOSEO.glb', function ( gltf ) {
    scene.add( gltf.scene );
}, undefined, function ( error ) {
    console.error( error );
} );

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;
// ADD --> disable rotation.y until first 'isCibleInView = true' detected


//cube vert
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

//ADD floating inercie


//=======================================================================
// Tableau coordonnée
//=======================================================================

//coordonnées dans l'ordre: azimutal, polaire
const Targets = [
    [2.06, 1.86],
    [3.06, 2.86],    
    [0, 1.57],
]
// ADD -->  etiquette sur chaque sous tableau pour pouvoir ensuite dire: si "sous-tableau 1" est ciblé, ajouter une classe is-active à un élément html
//          cela servira à afficher les définition de chaque mot trouvé




//=======================================================================
// Target Functions
//=======================================================================

//verifier si on est au bon endroit avec la cam
function checkTargetPosition(azimutTarget, polarTarget) {
    const azimutCamera = controls.getAzimuthalAngle();
    const polarCamera = controls.getPolarAngle();
    const marge = 0.03; // marge de la cible

    const azimutMin = azimutTarget - marge;
    const azimutMax = azimutTarget + marge;
    const polarMin = polarTarget - marge;
    const polarMax = polarTarget + marge;

    if (azimutCamera >= azimutMin && azimutCamera <= azimutMax &&
        polarCamera >= polarMin && polarCamera <= polarMax) {
        isCibleInView = true;
        console.log("actif");
        incrementScore()
    }
}

//trouver la cible la plus proche de la camera actuelle
function findClosestTarget() {
    const azimutCamera = controls.getAzimuthalAngle();
    const polarCamera = controls.getPolarAngle();
    
    let distanceMin = Number.POSITIVE_INFINITY;
    let closestTarget = null;
    
    Targets.forEach((target) => {
        const azimutTarget = target[0];
        const polarTarget = target[1];
        
        const distance = Math.sqrt(
            Math.pow(azimutCamera - azimutTarget, 2) +
            Math.pow(polarCamera - polarTarget, 2)
            );
            
            if (distance < distanceMin) {
                distanceMin = distance;
                closestTarget = target;
            }
        });
        
        return closestTarget;
    }
    



//=======================================================================
// Camera Functions
//=======================================================================

// Définir les angles azimutal et polaire des contrôles d'orbite
    function setCameraAngles(azimuthalAngle, polarAngle) {
        controls.setAzimuthalAngle(azimuthalAngle);
        controls.setPolarAngle(polarAngle);
    }




//=======================================================================
// Score
//=======================================================================

let isCibleInView = false; // Variable pour suivre l'état de la cible
let hasCibleEntered = false; // Variable pour suivre si la cible a déjà été détectée
let score = 0; // Score initial
const scoreElement = document.getElementById('actualScore');


// Fonction pour augmenter le score
function incrementScore() {
    if (!hasCibleEntered) { // Si la cible n'a pas déjà été détectée
        score++; // Incrémenter le score
        hasCibleEntered = true; 
        scoreElement.textContent = score; // Mettre à jour le score dans le HTML
        console.log("Score:", score);
    }
}




//=======================================================================
// Rendu
//=======================================================================

function animate() {
    requestAnimationFrame( animate );

    //printer en html les coordonnée Azimuthal, Polaire et la distance camera
    const positionElement = document.getElementById('position');
    const rotationElement = document.getElementById('rotation');
    positionElement.textContent = `Camera Position : Distance: ${controls.getDistance().toFixed(2)}`;
    rotationElement.textContent = `Camera Rotation : Azimuthal: ${controls.getAzimuthalAngle().toFixed(2)}, Polar: ${controls.getPolarAngle().toFixed(2)}`;

    //definir par défaut que nous ne somme pas dans une target area
    isCibleInView = false;
    
    // aller chercher les coordonnées dans le tableau
    Targets.forEach((target) => {
        checkTargetPosition(target[0], target[1]);
    });
    
    // Trouver la cible la plus proche
    const closestTarget = findClosestTarget();

    //evenement quand on rentre et sort de la zone cible
    if(isCibleInView) {
        scene.add(cube);
        // Utilisation de la fonction pour définir les angles de la caméra
        setCameraAngles(closestTarget[0], closestTarget[1]);
        //incrementation du score
        incrementScore();
    } else {
        scene.remove(cube);
    }

    renderer.render( scene, camera );
}

//web gl compatibility check
if ( WebGL.isWebGLAvailable() ) {
	// Initiate function or other initializations here
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}




