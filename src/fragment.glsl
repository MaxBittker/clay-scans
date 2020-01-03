#extension GL_OES_standard_derivatives : enable
precision mediump float;

// clang-format off

#pragma glslify: hsv2rgb = require(glsl-y-hsv/hsv2rgb)
#pragma glslify: rgb2hsv = require(glsl-y-hsv/rgb2hsv)
#pragma glslify: fbm3d = require('glsl-fractal-brownian-noise/3d')
#pragma glslify: noise = require('glsl-noise/simplex/3d')
#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')
#pragma glslify: gauss = require('glsl-specular-gaussian')
// clang-format on

struct Light {
  vec3 color;
  vec3 position;
};
uniform float t;
uniform vec2 resolution;

uniform Light lights[4];
varying vec3 fragNormal, fragPosition, fragColor;

varying vec2 vUv;
#define PI 3.1415926538

float rand(vec2 c) {
  return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 lighting(vec3 nor, vec3 lightDir, vec3 viewDir, vec3 col) {
  vec3 dif = col * orenn(lightDir, viewDir, nor, 0.5, 1.0);
  vec3 spc = col * gauss(lightDir, viewDir, nor, 0.05);

  return dif + spc;
}

vec3 getColor() {
  vec3 normal = fragNormal;
  // normalize(cross(dFdx(fragPosition.xyz), dFdy(fragPosition.xyz)));
  vec3 viewDir = normalize(-fragPosition);

  vec3 light = vec3(0.1);
  for (int i = 0; i < 4; ++i) {
    vec3 lightDir =
        normalize((lights[i].position + vec3(50.0, 40., 100.)) - fragPosition);
    light += lighting(normal, lightDir, viewDir, vec3(0.6));

    lightDir =
        normalize(((lights[i].position + vec3(50.0, 40., 100.)) * vec3(-1.)) -
                  fragPosition);
    light += lighting(normal, lightDir, viewDir, vec3(0.6));
  }
  // vec3 hsvLight = rgb2hsv(light);
  vec3 pastel = hsv2rgb(vec3(fragColor.r, 0.3, 0.7));
  vec3 color = light * pastel;
  //  hsv2rgb(vec3(floor(hsvLight.r * 4.0) / 16.0, 0.2, 0.5));
  //  + floor(light*3.0)/5.0;

  if (length(light * color) <
      ((noise(vec3(gl_FragCoord.xy / 1.0, t * 0.001)) * 0.5) + 0.5) * 1.3) {
    color = vec3(0.0);
  }
  color = pastel * light;
  return color;
}

void main() {

  // color = light;
  gl_FragColor = vec4(getColor(), 1);
}