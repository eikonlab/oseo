uniform vec3 viewVector;
varying float intensity;

void main() {
    vec3 vNormal = normalize(normalMatrix * normal);
    vec3 vNormel = normalize(normalMatrix * viewVector);
    intensity = pow( dot(vNormal, vNormel), 4.0 );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
