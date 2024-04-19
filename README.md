# eikon parcel starter --> oseo

## Prérequis

- Git installé
- NPM installé

## Installation

Cloner le repository git

```
git clone git@github.com:eikon-frontend/starterkit.git <nom du projet>
```

Se rendre dans le dossier du projet, puis installer les dépendances avec NPM

```
cd <nom-du-projet>
npm install
```

## Commandes

Compiler la SCSS, aggréger le JS, lancer le serveur et écouter les changements

```
npm run dev
```

Compiler pour la production

```
npm run build
```

## packages externes

### [three.js](https://threejs.org)

Installer le paquet avec NPM

```
npm install three
```

Inclure le JS depuis un fichier JS

```js
import * as THREE from "three";
```

### web gl compatibility

importation
```
import WebGL from 'three/examples/jsm/capabilities/WebGL.js';
```
https://threejs.org/docs/#manual/en/introduction/WebGL-compatibility-check

### GLTFLoader

importation
```
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
```
https://threejs.org/docs/#examples/en/loaders/GLTFLoader

### Three-stdlib

Installer avec npm
```
npm install three-stdlib
```
```
import { OrbitControls, ... } from 'three-stdlib'
```
https://github.com/pmndrs/three-stdlib


