precision mediump float;
attribute vec3 position, normal, color;

// These three are instanced attributes.
attribute vec3 offset;
// attribute vec3 color;
attribute float angle;

// clang-format off
#pragma glslify: rotateX = require(glsl-y-rotate/rotateX)
#pragma glslify: rotateY = require(glsl-y-rotate/rotateY)
#pragma glslify: rotateZ = require(glsl-y-rotate/rotateZ)
#pragma glslify: fbm3d = require('glsl-fractal-brownian-noise/3d')

// clang-format on
const float DEG_TO_RAD = 3.141592653589793 / 180.0;

uniform mat4 model, view, projection;
uniform float t, index;
varying vec3 fragNormal, fragPosition, fragColor;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  // pos = pos * rotateZ(angle);

  // pos += vec3(sin(t * 4.0 + ((pos.z + offset.z) * 0.1)) * 0.5) * sin(t)
  // * 10.;
  pos.x += fbm3d(vec3(position) * 0.06, 2) * 2.1;
  pos.y += fbm3d(vec3(position) * 0.06, 2) * 2.1;
  pos.z += fbm3d(vec3(position) * 0.06, 2) * 2.1;

  if (index > 1.1) {
    pos.x *= -1.;
    pos = pos * rotateX(170. * DEG_TO_RAD);
    pos = pos * rotateY(-30. * DEG_TO_RAD);
    pos = pos * rotateZ(170. * DEG_TO_RAD);

  } // sin(t);
  // pos = pos * rotateX(180. *
  // DEG_TO_RAD); pos = pos * rotateY(180. * DEG_TO_RAD); pos = pos *
  // rotateZ(180. * DEG_TO_RAD); pos -= vec3(30.0, 30., 30.); pos = pos *
  // rotateX(angle * 1.);
  // pos = pos * rotateY(angle * 0.2 * (index + 1.));
  // pos = pos * rotateZ(angle * 1.3);
  pos += offset;

  // pos += vec3(30.0, 30., 30.);

  // pos += offset;
  // pos = pos * rotateY(angle);

  // pos = pos * rotateY(angle * 6.000 * DEG_TO_RAD);

  fragNormal = normal;
  fragPosition = pos;
  fragColor = color;
  // fragOffset = o
  vec4 computed = projection * view * model * vec4(pos, 1.0);

  vUv = computed.xy * 0.5 + 0.5;
  gl_Position = computed;
}