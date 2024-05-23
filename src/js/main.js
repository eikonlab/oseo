//=======================================================================//
// Importations==========================================================//
//=======================================================================//

import * as THREE from "three";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Importer OrbitControls depuis three-stdlib pour pouvoir utiliser SetAzimuthalAngle et SetPolarAngle
import { OrbitControls } from "three-stdlib";

//=======================================================================//
// Scene=================================================================//
//=======================================================================//

let initialFov = 36;
let camera;

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    initialFov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.filmGauge = 35;
  camera.position.x = 0;
}

initCamera();

//resize canvas
function debounce(func) {
  var timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    document.body.classList.add("resizing");
    timer = setTimeout(func, 100, event);
  };
}

window.addEventListener(
  "resize",
  debounce(function (e) {
    document.body.classList.remove("resizing");
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  })
);

//camera perspective for ipad
function adjustCameraPositionIpad() {
  if (window.innerWidth < 1000) {
    camera.position.z = 70;
    initialFov = 60;
  } else {
    camera.position.z = 68;
    initialFov = 36;
  }
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = initialFov;
  camera.updateProjectionMatrix();
}

adjustCameraPositionIpad();

//renderer

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

//loader pour importer notre modele
const loader = new GLTFLoader();

loader.load(
  "../../3d/OSEO_Jeux_terrainDejeu_VersionFinal.glb",
  function (gltf) {
    let model1;
    model1 = gltf.scene;
    scene.add(model1);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

//controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;

controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: null,
};

//=======================================================================//
// GRADIENT==============================================================//
//=======================================================================//

// Créer un canvas pour le dégradé sphérique
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 512;

// Créer un gradient radial
const gradient = context.createRadialGradient(
  canvas.width / 2,
  canvas.height / 2,
  0,
  canvas.width / 2,
  canvas.height / 2,
  canvas.width / 2
);

// Ajouter les couleurs au gradient
gradient.addColorStop(0, "#204A7B"); // Couleur du centre
gradient.addColorStop(1, "#4F9CF7"); // Couleur du bord

// Remplir le canvas avec le gradient
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Créer une texture à partir du canvas
const texture = new THREE.CanvasTexture(canvas);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 2); // Répéter le motif de dégradé

// Utiliser la texture comme matériau de fond
const backgroundMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.BackSide,
});

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
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Matériau des particules
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff, // Couleur des particules
  size: 0.8, // Taille des particules
  sizeAttenuation: true, // Atténuation de la taille en fonction de la distance
});

// Création de l'objet de particules
const particles = new THREE.Points(particleGeometry, particleMaterial);

// Ajout des particules à la scène
scene.add(particles);

//=======================================================================//
// AUDIO MANAGER==========================================================//
//=======================================================================//

class AudioManager {
  constructor() {
    this.sounds = {};
    this.currentSoundIndex = 1; // Indice du premier son à jouer
  }

  loadSound(key, url) {
    const audio = new Audio(url);
    this.sounds[key] = audio;
  }

  playSound(key) {
    const audio = this.sounds[key];
    if (audio) {
      audio.play();
    }
  }

  loadSounds(sounds) {
    sounds.forEach((sound, index) => {
      const audio = new Audio(sound);
      this.sounds[index + 1] = audio; // Utiliser l'indice comme clé
    });
  }

  stopSound(key) {
    const audio = this.sounds[key];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  playNextSound() {
    const audio = this.sounds[this.currentSoundIndex];
    if (audio) {
      audio.play();
      this.currentSoundIndex = (this.currentSoundIndex % 8) + 1; // Incrémenter et revenir à 1 si nécessaire
    }
  }
}

// Créer une instance du gestionnaire audio
const audioManager = new AudioManager();

// Charger les sons
audioManager.loadSound("click-button", "../../sounds/click-button.mp3");
audioManager.loadSound("win", "../../sounds/win.mp3");
// audioManager.loadSound('woosh', '../../sounds/woosh.mp3');
// audioManager.loadSound('doing', '../../sounds/doing.mp3');
// audioManager.loadSound('jingle', '../../sounds/jingle.wav');

audioManager.loadSounds([
  "../../sounds/son1.mp3",
  "../../sounds/son2.mp3",
  "../../sounds/son3.mp3",
  "../../sounds/son4.mp3",
  "../../sounds/son5.mp3",
  "../../sounds/son6.mp3",
  "../../sounds/son7.mp3",
  "../../sounds/son8.mp3",
]);

//=======================================================================//
// Tableau coordonnée====================================================//
//=======================================================================//

const Targets = [
  {
    azimutal: -2.7464,
    polar: 2.2217,
    label: "Target 1",
    marge: 0.02,
    descriptionClass: "description1",
  }, //insertion (au pôle > difficile, à changer dans le modèle 3D)
  {
    azimutal: -3.1413,
    polar: 1.5867,
    label: "Target 2",
    marge: 0.02,
    descriptionClass: "description2",
  }, //intégration
  {
    azimutal: -2.2302,
    polar: 1.2897,
    label: "Target 3",
    marge: 0.02,
    descriptionClass: "description3",
  }, //solidarité
  {
    azimutal: -0.8084,
    polar: 2.1514,
    label: "Target 4",
    marge: 0.02,
    descriptionClass: "description4",
  }, //dignité
  {
    azimutal: 1.6436,
    polar: 3.1112,
    label: "Target 5",
    marge: 0.03,
    descriptionClass: "description5",
  }, //formation
  {
    azimutal: -2.2412,
    polar: 1.7698,
    label: "Target 6",
    marge: 0.02,
    descriptionClass: "description6",
  }, //responsabilité
  {
    azimutal: 1.9773,
    polar: 1.5296,
    label: "Target 7",
    marge: 0.02,
    descriptionClass: "description7",
  }, //engagement
  {
    azimutal: 2.1175,
    polar: 1.8736,
    label: "Target 8",
    marge: 0.02,
    descriptionClass: "description8",
  }, //autonomie
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
let target7Displayed = false;
let target8Displayed = false;

//verifier si on est au bon endroit avec la cam
let isCibleInView = false;

function checkTargetPosition(
  azimutTargetInput,
  polarTargetInput,
  labelTargetInput,
  margeTargetInput
) {
  const azimutCamera = controls.getAzimuthalAngle();
  const polarCamera = controls.getPolarAngle();

  const azimutMin = azimutTargetInput - margeTargetInput;
  const azimutMax = azimutTargetInput + margeTargetInput;
  const polarMin = polarTargetInput - margeTargetInput;
  const polarMax = polarTargetInput + margeTargetInput;
  const wordFoundAnimationText = document.getElementById(
    "wordFoundAnimationText"
  );
  const animBox = document.querySelector(".animation-box");

  if (
    azimutCamera >= azimutMin &&
    azimutCamera <= azimutMax &&
    polarCamera >= polarMin &&
    polarCamera <= polarMax
  ) {
    isCibleInView = true;
    activeTargetIndex = Targets.findIndex(
      (target) => target.label === labelTargetInput
    );
    activeTargetAzimutal = azimutTargetInput;
    activeTargetPolar = polarTargetInput;

    switch (labelTargetInput) {
      case "Target 1":
        if (!target1Displayed) {
          target1Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Insertion";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Trouver sa place. Grâce au travail et aux liens sociaux";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 2":
        if (!target2Displayed) {
          target2Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Intégration";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Viser l’autonomie à travers la langue et le travail";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 3":
        if (!target3Displayed) {
          target3Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Solidarité";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Bâtir ensemble une société plus juste";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 4":
        if (!target4Displayed) {
          target4Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Dignité";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Garantir la sécurité morale et matérielle de tous et toutes";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 5":
        if (!target5Displayed) {
          target5Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Formation";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Se former pour s’émanciper";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 6":
        if (!target6Displayed) {
          target6Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Responsabilité";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "S’engager, personnellement et collectivement";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 7":
        if (!target7Displayed) {
          target7Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Engagement";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Combattre l’exclusion, la précarité";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;
      case "Target 8":
        if (!target8Displayed) {
          target8Displayed = true;
          increaseScore();
          unblurDescription(activeTargetIndex);
          document.getElementById("wordFoundAnimationText").textContent =
            "Autonomie";
          document.getElementById("wordFoundAnimationDescription").textContent =
            "Favoriser le pouvoir d’agir";
          animBox.classList.add("animation-active");
          controls.enabled = false;
          setTimeout(function () {
            animBox.classList.remove("animation-active");
            controls.enabled = true;
          }, 6000);
        }
        break;

      default:
        break;
    }
  }
}

// Définir les angles azimutal et polaire des contrôles d'orbite
function setCameraAngles(azimuthalAngle, polarAngle) {
  controls.setAzimuthalAngle(azimuthalAngle);
  controls.setPolarAngle(polarAngle);
}

const wordFound = document.querySelector(".word-found-animation");
// Ajustez les angles de la caméra aux coordonnées de la cible
function adjustCamToTarget() {
  setCameraAngles(activeTargetAzimutal, activeTargetPolar);
  wordFound.classList.add("is-active");
}

//unblur les mots trouvé
function unblurDescription(targetIndex) {
  const descriptionClass = ".description" + (targetIndex + 1);
  const foundDescription = document.querySelector(descriptionClass);
  if (foundDescription) {
    foundDescription.classList.add("is-found");
  }
}

//=======================================================================//
// Score=================================================================//
//=======================================================================//

let activeTargetsCount = 0;
const victoryPoints = 8;

function displayWinScreen() {
  var winScreen = document.querySelector(".win-screen");
  winScreen.classList.add("is-active");
}

function increaseScore() {
  // Incrémenter le score et mettre à jour l'affichage
  activeTargetsCount++;
  document.querySelector(".dynamic-score").textContent = activeTargetsCount;
  playSoundForScore(activeTargetsCount);

  if (activeTargetsCount === victoryPoints) {
    setTimeout(function () {
      displayWinScreen();
      stopChrono();
      audioManager.playSound("win");
      // Déplacer les element à la victory page
      var startContainer = document.getElementById("starContainer");
      var timerElement = document.getElementById("timer");
      var newLocation = document.getElementById("newLocation");
      // var descriptionContainer = document.getElementById('descriptionContainer');
      if (timerElement && !newLocation.contains(timerElement)) {
        newLocation.appendChild(timerElement);
      }
      if (startContainer && !newLocation.contains(startContainer)) {
        newLocation.appendChild(startContainer);
      }
      // if (descriptionContainer && !newLocation.contains(descriptionContainer)) {
      //   newLocation.appendChild(descriptionContainer);
    }, 6000);
  }
}

// Fonction pour jouer le son approprié en fonction du score
function playSoundForScore(score) {
  if (score >= 1 && score <= 8) {
    audioManager.playSound(score); // Jouer le son correspondant au score
  }
}

//=======================================================================//
// Rendu=================================================================//
//=======================================================================//

function animate() {
  requestAnimationFrame(animate);

  //definir par défaut que nous ne somme pas dans une target area
  isCibleInView = false;
  //sorti les const et les chnger en let pour les utiliser dans plusieur function
  let azimutTargetData, polarTargetData, labelTargetData, margeTargetData;

  // aller chercher les coordonnées dans le tableau
  Targets.forEach((target) => {
    azimutTargetData = target.azimutal;
    polarTargetData = target.polar;
    labelTargetData = target.label;
    margeTargetData = target.marge;

    checkTargetPosition(
      azimutTargetData,
      polarTargetData,
      labelTargetData,
      margeTargetData
    );
  });

  // Mettre à jour les descriptions des cibles
  Targets.forEach((target, index) => {
    const descriptionElement = document.querySelector(
      `.description${index + 1}`
    ); // Sélectionnez l'élément HTML correspondant
    if (index === activeTargetIndex) {
      descriptionElement.classList.add("is-active"); // Ajoutez la classe is-active
    } else {
      descriptionElement.classList.remove("is-active"); // Retirez la classe is-active des autres éléments
    }
  });

  //evenement quand on rentre et sort de la zone cible
  if (isCibleInView) {
    // scene.add(cube);
    adjustCamToTarget(azimutTargetData, polarTargetData, labelTargetData);
  } else {
    wordFound.classList.remove("is-active");
  }

  // printer en html les coordonnée Azimuthal, Polaire et la distance camera
  //const positionElement = document.getElementById('position');
  //const rotationElement = document.getElementById('rotation');
  //positionElement.textContent = `Camera Position : Distance: ${controls.getDistance().toFixed(4)}`;
  //rotationElement.textContent = `Camera Rotation : Azimuthal: ${controls.getAzimuthalAngle().toFixed(4)}, Polar: ${controls.getPolarAngle().toFixed(4)}`;

  controls.update();

  renderer.render(scene, camera);
}

//web gl compatibility check
if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}

//====================================================================================
// Welcome page=======================================================================
//====================================================================================

function hideWelcomeImage() {
  const welcomeImage = document.querySelector(".welcome-page img");
  const welcomeImageBackground = document.querySelector(
    ".welcome-page .logo-background"
  );
  const startContainer = document.querySelector(".start-container");
  if (welcomeImage) {
    welcomeImage.classList.add("is-gone");
    welcomeImageBackground.classList.add("is-gone");
    startContainer.classList.add("is-active");
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    hideWelcomeImage();
  }, 1000);
});

//====================================================================================
// start Button=======================================================================
//====================================================================================

const startButton = document.querySelector(".start-button");

startButton.addEventListener("click", () => {
  const welcomePage = document.querySelector(".welcome-page");
  const tutorialContainer = document.querySelector(".tutorial-container");
  const descriptionContainer = document.querySelector(".description-container");
  const ScoreCounter = document.querySelector(".score-counter");
  welcomePage.classList.add("is-gone");
  tutorialContainer.classList.add("is-active");
  descriptionContainer.classList.add("is-active");
  ScoreCounter.classList.add("is-active");
  startChrono();
  audioManager.playSound("click-button");

  // audioManager.playSound('doing');//blague
});

//====================================================================================
// remove tutorial====================================================================
//====================================================================================

function checkCameraMovement() {
  const initialPosition = new THREE.Vector3(0, 0, 0);
  const currentPosition = camera.position.clone();
  const distance = initialPosition.distanceTo(currentPosition);

  if (distance > 0.1) {
    const tutorialContainer = document.querySelector(".tutorial-container");

    tutorialContainer.classList.remove("is-active");
    tutorialContainer.classList.add("is-gone");

    // Écoute les clics sur le document pendant 7 secondes
    let timeout = setTimeout(() => {
      tutorialContainer.classList.remove("is-gone");
      tutorialContainer.classList.add("is-active");
    }, 14000);

    // Si un clic est détecté pendant cette période, annule le timeout
    document.addEventListener("click", function onClick() {
      clearTimeout(timeout);
      document.removeEventListener("click", onClick); // Supprime l'écouteur après utilisation
    });
  }
}

controls.addEventListener("change", checkCameraMovement);

//====================================================================================
//  TIMER====================================================================
//====================================================================================

// Variable pour stocker l'identifiant du timer
let chrono;

// Fonction pour démarrer le chronomètre
// Fonction pour démarrer le chronomètre
function startChrono() {
  // minutes et secondes écoulées
  let minutes = 0;
  let secondes = 0;

  // élément où afficher le décompte
  let para = document.getElementById("timer");

  // lance l'exécution de la fonction à toutes les secondes
  chrono = window.setInterval(tictictic, 1000);

  // ---------------------------------------------------------
  // Incrément le nombre de secondes et minutes, affiche cette quantité
  // et arrête automatiquement après 60 minutes.
  // ---------------------------------------------------------
  function tictictic() {
    secondes++;
    if (secondes === 60) {
      minutes++;
      secondes = 0;
    }
    para.innerHTML = formatTime(minutes, secondes);

    // Ajouter la classe is-gone aux étoiles lorsque le temps spécifié est atteint
    if (minutes === 3 && secondes === 0) {
      document.querySelector(".star3").classList.add("is-gone");
    }
    if (minutes === 6 && secondes === 0) {
      document.querySelector(".star2").classList.add("is-gone");
    }
    if (minutes === 9 && secondes === 0) {
      document.querySelector(".star1").classList.add("is-gone");
    }

    if (minutes === 60 && secondes === 0) {
      // arrête l'exécution lancée par setInterval()
      stopChrono();
    }
  }

  // ---------------------------------------------------------
  // Formatage du temps en minutes et secondes
  // ---------------------------------------------------------
  function formatTime(minutes, secondes) {
    return (
      minutes.toString().padStart(2, "0") +
      ":" +
      secondes.toString().padStart(2, "0")
    );
  }
}

// Fonction pour arrêter le chronomètre
function stopChrono() {
  clearInterval(chrono);
}

//====================================================================================
// rejouer================================================================
//====================================================================================

const replayButton = document.querySelector(".replay-button");

replayButton.addEventListener("click", () => {
  location.reload();
  audioManager.playSound("click-button");

  // audioManager.playSound('doing'); //blague
});

//====================================================================================
// bodymovin animation================================================================
//====================================================================================

lottie.loadAnimation({
  container: document.getElementById("bodymovinTouch"), // the dom element that will contain the animation
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "../../bodymovin/doigt4.json", // the path to the animation json
});

lottie.loadAnimation({
  container: document.getElementById("bodymovinDesktop"), // the dom element that will contain the animation
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "../../bodymovin/souris.json", // the path to the animation json
});

// Jouer un son
// audioManager.playSound('explosion');

let isDragging = false;

// Écouter l'événement de début de clic
renderer.domElement.addEventListener("mousedown", function (event) {
  isDragging = true;
});

// Écouter l'événement de fin de clic
renderer.domElement.addEventListener("mouseup", function (event) {
  if (isDragging) {
    audioManager.playSound("woosh");
    isDragging = false;
  }
});

// fonction click pour activer la valeur
document.querySelectorAll(".description").forEach((description) => {
  description.addEventListener("click", () => {
    const target = Targets.find((target) =>
      description.classList.contains(target.descriptionClass)
    );
    if (target) {
      setCameraAngles(target.azimutal, target.polar);
      activateTarget(target);
    }
  });
});
