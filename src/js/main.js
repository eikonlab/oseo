//=======================================================================//
// Importations==========================================================//
//=======================================================================//

import * as THREE from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Importer OrbitControls depuis three-stdlib pour pouvoir utiliser SetAzimuthalAngle et SetPolarAngle
import { OrbitControls } from 'three-stdlib';





//=======================================================================//
// Scene=================================================================//
//=======================================================================//

const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 36, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 68;
camera.filmGauge = 35;
camera.position.x = -20

//render
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0); // Fond transparent
document.body.appendChild( renderer.domElement );

//loader pour importer notre modele 
const loader = new GLTFLoader();

loader.load('../../3d/Soupe_au_chou_gabber.glb', function (gltf) {
    model1 = gltf.scene;
    scene.add(model1);
}, undefined, function (error) {
    console.error(error);
});


//controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;

controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: null
};


//cube vert
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
const cube = new THREE.Mesh(geometry, material);

//AFFICHER FRAME RATE / ADD ANTI-ALIASING
//bloquer le zoom dans la page




//=======================================================================//
// GRADIENT==============================================================//
//=======================================================================//

// Créer un canvas pour le dégradé sphérique
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 512;

// Créer un gradient radial
const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
);

// Ajouter les couleurs au gradient
gradient.addColorStop(0, '#204A7B'); // Couleur du centre
gradient.addColorStop(1, '#4F9CF7'); // Couleur du bord

// Remplir le canvas avec le gradient
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Créer une texture à partir du canvas
const texture = new THREE.CanvasTexture(canvas);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 2); // Répéter le motif de dégradé

// Utiliser la texture comme matériau de fond
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });

// Créer une sphère pour le fond
const backgroundGeometry = new THREE.SphereGeometry(800, 32, 16);
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
backgroundSphere.position.set(0, 0, 0); // Positionner la sphère derrière la caméra


// Ajouter la sphère de fond à la scène
scene.add(backgroundSphere);




//=======================================================================//
// PARTICULES============================================================//
//=======================================================================//

// Nombre de particules à générer
const particleCount = 600;

// Géométrie des particules
const particleGeometry = new THREE.BufferGeometry();

// Tableaux pour stocker les positions des particules
const positions = new Float32Array(particleCount * 3); // 3 coordonnées (x, y, z) par particule

// Remplissage des tableaux de positions avec des valeurs aléatoires
for (let i = 0; i < particleCount; i++) {
    // Calcul de positions aléatoires pour chaque particule
    const x = Math.random() * 200 - 100; // Valeurs entre -100 et 100
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 200 - 100;

    // Attribution des positions aux tableaux
    positions[i * 3] = x;
    positions[i * 3 + 10] = y;
    positions[i * 3 + 20] = z;
}

// Ajout des positions à la géométrie
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Matériau des particules
const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // Couleur des particules
    size: 1.5, // Taille des particules
    sizeAttenuation: true // Atténuation de la taille en fonction de la distance
});

// Création de l'objet de particules
const particles = new THREE.Points(particleGeometry, particleMaterial);

// Ajout des particules à la scène
scene.add(particles);




//=======================================================================//
// Tableau coordonnée====================================================//
//=======================================================================//

const Targets = [
    { azimutal: -0.0081, polar: 1.5688, label: 'Target 1' },
    { azimutal: 2.1175, polar: 1.8736, label: 'Target 2' },
    { azimutal: -2.2252, polar: 1.2854, label: 'Target 3' },
    { azimutal: -3.1397, polar: 1.5803, label: 'Target 4' },
    { azimutal: 1.9773, polar: 1.5296, label: 'Target 5' },
    { azimutal: -2.2380, polar: 1.7683, label: 'Target 6' }

   ];
//ADD all targets




//=======================================================================//
// Target Functions======================================================//
//=======================================================================//
let activeTargetAzimutal;
let activeTargetPolar;
let activeTargetIndex;

let target1Displayed = false;
let target2Displayed = false;
let target3Displayed = false;
let target4Displayed = false;
let target5Displayed = false;
let target6Displayed = false;

//verifier si on est au bon endroit avec la cam
function checkTargetPosition(azimutTargetInput, polarTargetInput, labelTargetInput) {
    const azimutCamera = controls.getAzimuthalAngle();
    const polarCamera = controls.getPolarAngle();
    const marge = 0.02; // marge de la cible

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

                // Augmenter le score si la cible n'a pas encore été affichée
                switch (labelTargetInput) {
                    case 'Target 1':
                        if (!target1Displayed) {
                            target1Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    case 'Target 2':
                        if (!target2Displayed) {
                            target2Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    case 'Target 3':
                        if (!target3Displayed) {
                            target3Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    case 'Target 4':
                        if (!target4Displayed) {
                            target4Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    case 'Target 5':
                        if (!target5Displayed) {
                            target5Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    case 'Target 6':
                        if (!target6Displayed) {
                            target6Displayed = true;
                            increaseScore();
                            unblurDescription(activeTargetIndex);
                        }
                        break;
                    default:
                        break;
                }

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

//unblur les mots trouvé
function unblurDescription(targetIndex) {
    const descriptionClass = '.description' + (targetIndex + 1);
    const foundDescription = document.querySelector(descriptionClass);
    if (foundDescription) {
        foundDescription.classList.add('is-found');
    }
}




//=======================================================================//
// Score=================================================================//
//=======================================================================//

let activeTargetsCount = 0;

function increaseScore() {
    // Incrémenter le score et mettre à jour l'affichage
    activeTargetsCount++;
    document.querySelector('.dynamic-score').textContent = activeTargetsCount;
}

//reste du code pour le score en fonction des targets dans function checkTargetPosition (ligne 209)



//=======================================================================//
// Rendu=================================================================//
//=======================================================================//

function animate() {
    requestAnimationFrame( animate );

    //printer en html les coordonnée Azimuthal, Polaire et la distance camera
    const positionElement = document.getElementById('position');
    const rotationElement = document.getElementById('rotation');
    positionElement.textContent = `Camera Position : Distance: ${controls.getDistance().toFixed(4)}`;
    rotationElement.textContent = `Camera Rotation : Azimuthal: ${controls.getAzimuthalAngle().toFixed(4)}, Polar: ${controls.getPolarAngle().toFixed(4)}`;

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
        // scene.add(cube);
        adjustCamToTarget(azimutTargetData, polarTargetData, labelTargetData);
    } else {
        // scene.remove(cube);
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




