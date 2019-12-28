precision mediump float;
attribute vec3 position, normal;

uniform mat4 model, view, projection;
uniform float t;
varying vec3 fragNormal, fragPosition;
varying vec2 vUv;

void main() {
  fragNormal = normal;
  fragPosition = position;
  // vec4 computed = projection * view *model* vec4(position + 0.5
  // *normal*cos(t*4.0 + position.y*5.)*sin(t*4.0 + position.x*5.), 1) ;
  vec4 computed = projection * view * model * vec4(position, 1);
  vUv = computed.xy * 0.5 + 0.5;
  gl_Position = computed;
}