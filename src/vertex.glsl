precision mediump float;
attribute vec3 position, normal;

uniform mat4 model, view, projection;
uniform float t;
varying vec3 fragNormal, fragPosition;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  pos += vec3(sin(t * 4.0 + (pos.x * 0.1)) * 2.5);

  fragNormal = normal;
  fragPosition = pos;
  // vec4 computed = projection * view *model* vec4(pos + 0.5
  // *normal*cos(t*4.0 + pos.y*5.)*sin(t*4.0 + pos.x*5.), 1) ;
  vec4 computed = projection * view * model * vec4(pos, 1);
  vUv = computed.xy * 0.5 + 0.5;
  gl_Position = computed;
}