//=======================================================================
// Importations
//=======================================================================
import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Importer OrbitControls depuis three-stdlib pour pouvoir utiliser SetAzimuthalAngle et SetPolarAngle
import { OrbitControls } from 'three-stdlib';
// Importer Tween depuis tween.js
// import { Tween } from '@tweenjs/tween.js'; //potentielle transition de camera possible avec tween




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
camera.position.x = -20;

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
controls.dampingFactor = 0.05;
controls.enableZoom = false;
// ADD --> disable rotation.y until first 'isCibleInView = true' detected?


//cube vert
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

//ADD floating inercie




//=======================================================================
// Tableau coordonnée
//=======================================================================
const Targets = [
    { azimutal: 2.06, polar: 1.86, label: 'Target 1' },
    { azimutal: -2.22, polar: 1.29, label: 'Target 2' },
    { azimutal: 0, polar: 1.57, label: 'Target 3' },
   ];




//=======================================================================
// Target Functions
//=======================================================================
let activeTargetAzimutal;
let activeTargetPolar;
let activeTargetIndex;

//verifier si on est au bon endroit avec la cam
function checkTargetPosition(azimutTargetInput, polarTargetInput, labelTargetInput) {
    const azimutCamera = controls.getAzimuthalAngle();
    const polarCamera = controls.getPolarAngle();
    const marge = 0.05; // marge de la cible

    const azimutMin = azimutTargetInput - marge;
    const azimutMax = azimutTargetInput + marge;
    const polarMin = polarTargetInput - marge;
    const polarMax = polarTargetInput + marge;

    if (azimutCamera >= azimutMin && azimutCamera <= azimutMax &&
        polarCamera >= polarMin && polarCamera <= polarMax) {
        isCibleInView = true;
        activeTargetIndex = Targets.findIndex(target => target.label === labelTargetInput); // Trouver l'index de la cible active
        activeTargetAzimutal = azimutTargetInput; // Mettez à jour les coordonnées de la cible active
        activeTargetPolar = polarTargetInput;
        console.log(labelTargetInput);
        console.log("actif");
    }
}

// Définir les angles azimutal et polaire des contrôles d'orbite
function setCameraAngles(azimuthalAngle, polarAngle,) {
    controls.setAzimuthalAngle(azimuthalAngle);
    controls.setPolarAngle(polarAngle);
}

// Ajustez les angles de la caméra aux coordonnées de la cible
function adjustCamToTarget() {
    setCameraAngles(activeTargetAzimutal, activeTargetPolar);
}




//=======================================================================
// Score
//=======================================================================




//=======================================================================//
// Rendu=================================================================//
//=======================================================================//
function animate() {
    requestAnimationFrame( animate );

    //printer en html les coordonnée Azimuthal, Polaire et la distance camera
    const positionElement = document.getElementById('position');
    const rotationElement = document.getElementById('rotation');
    positionElement.textContent = `Camera Position : Distance: ${controls.getDistance().toFixed(2)}`;
    rotationElement.textContent = `Camera Rotation : Azimuthal: ${controls.getAzimuthalAngle().toFixed(2)}, Polar: ${controls.getPolarAngle().toFixed(2)}`;

    //definir par défaut que nous ne somme pas dans une target area
    isCibleInView = false;

    //sorti les const et les chnger en let pour les utiliser dans plusieur function
    let azimutTargetData, polarTargetData, labelTargetData; 

    // aller chercher les coordonnées dans le tableau
    Targets.forEach((target) => {
        azimutTargetData = target.azimutal;
        polarTargetData = target.polar;
        labelTargetData = target.label;

        checkTargetPosition(azimutTargetData, polarTargetData, labelTargetData);
    });

    // Mettre à jour les descriptions des cibles
    Targets.forEach((target, index) => {
        const descriptionElement = document.querySelector(`.description${index + 1}`); // Sélectionnez l'élément HTML correspondant
        if (index === activeTargetIndex) {
            descriptionElement.classList.add('is-active'); // Ajoutez la classe is-active
        } else {
            descriptionElement.classList.remove('is-active'); // Retirez la classe is-active des autres éléments
        }
    });

    //evenement quand on rentre et sort de la zone cible
    if(isCibleInView) {
        scene.add(cube);
        adjustCamToTarget(azimutTargetData, polarTargetData, labelTargetData);
    } else {
        scene.remove(cube);
    }

    controls.update();

    renderer.render( scene, camera );
}



//web gl compatibility check
if ( WebGL.isWebGLAvailable() ) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}




