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
uniform float t;
varying vec3 fragNormal, fragPosition, fragColor;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  // pos = pos * rotateZ(angle);

  // pos += vec3(sin(t * 4.0 + (pos.x * 0.5)) * 0.5);
  // pos.x += fbm3d(vec3(position) * 0.01, 5) * 9.1;
  // pos.y += fbm3d(vec3(position.yxz) * 0.01, 5) * 3.1;
  // pos.z += fbm3d(vec3(position.zxy) * 0.01, 5) * 3.1;
  pos = pos * rotateX(80. * DEG_TO_RAD);
  pos = pos * rotateY(30. * DEG_TO_RAD);
  pos = pos * rotateZ(20. * DEG_TO_RAD);
  pos += offset;
  // pos -= vec3(30.0, 30., 30.);
  pos = pos * rotateX(angle * 1.);
  pos = pos * rotateZ(angle * .2);
  pos = pos * rotateZ(angle * .3);
  // pos += vec3(30.0, 30., 30.);

  // pos += offset;
  // pos = pos * rotateY(angle);

  // pos = pos * rotateY(angle * 6.000 * DEG_TO_RAD);

  fragNormal = normal;
  fragPosition = pos;
  fragColor = color;
  vec4 computed = projection * view * model * vec4(pos, 1.0);

  vUv = computed.xy * 0.5 + 0.5;
  gl_Position = computed;
}