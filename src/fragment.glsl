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

  uniform Light lights[4];
  varying vec3 fragNormal, fragPosition;
  varying vec2 vUv;
  #define PI 3.1415926538


float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 lighting( vec3 nor, vec3 lightDir, vec3 viewDir, vec3 col) {
  vec3 dif = col * orenn(lightDir,viewDir, nor, 0.15, 1.0);
  vec3 spc = col * gauss(lightDir, viewDir, nor, 0.15);

  return dif + spc ;
}

  void main() {


vec3 normal = normalize( cross( dFdx( fragPosition.xyz ), dFdy( fragPosition.xyz ) ) );
vec3 viewDir = normalize(-fragPosition);

    vec3 light = vec3(0.05);
    for (int i = 0; i < 4; ++i) {
      vec3 lightDir = normalize((lights[i].position - vec3(0.0,30.0,0.)) - fragPosition);
    //   float diffuse = max(0.0, dot(lightDir, normal));
    //   light += diffuse * lights[i].color;
      light += lighting(normal, lightDir, viewDir, lights[i].color);


    }
    vec3 hsvLight = rgb2hsv(light);
    vec3 color = hsv2rgb(vec3(floor(hsvLight.r*2.0)/2.0,0.3,0.5) );
    //  + floor(light*3.0)/5.0;

    if(length(light)< ((noise(vec3(gl_FragCoord.xy/3.0,t*0.1))*0.5)+0.5)*1.3){
      color = vec3(0.0);
    }
    // color = light;
    gl_FragColor = vec4(color, 1);
  }