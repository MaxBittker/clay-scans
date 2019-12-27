var regl = require("regl")({extensions: 'OES_element_index_uint'
});
var mesh = require("./skullmeshbig.json");
// var mesh = require('mesh-fixer')(mesh.cells, mesh.positions)

var mat4 = require("gl-mat4");
var normals = require("angle-normals");
var camera = require("regl-camera")(regl, {
  center: [0, -30, 0],
  distance: 120
});
const glsl = x => x;

function skelly(regl) {

  return regl({
    frag: glsl`
      precision mediump float;
  struct Light {
    vec3 color;
    vec3 position;
  };
  uniform Light lights[4];
  varying vec3 fragNormal, fragPosition;
  varying vec2 vUv;


float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p, float freq ){
	float unit = 1080.0/freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(PI*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

// float pNoise(vec2 p, int res){
// 	float persistance = .5;
// 	float n = 0.;
// 	float normK = 0.;
// 	float f = 4.;
// 	float amp = 1.;
// 	int iCount = 0;
// 	for (int i = 0; i<50; i++){
// 		n+=amp*noise(p, f);
// 		f*=2.;
// 		normK+=amp;
// 		amp*=persistance;
// 		if (iCount == res) break;
// 		iCount++;
// 	}
// 	float nf = n/normK;
// 	return nf*nf*nf*nf;
// }

  void main() {
    vec3 normal = normalize(fragNormal);
    vec3 light = vec3(0, 0, 0);
    for (int i = 0; i < 4; ++i) {
      vec3 lightDir = normalize(lights[i].position - fragPosition);
      float diffuse = max(0.0, dot(lightDir, normal));
      light += diffuse * lights[i].color;
    }
    vec3 color = light;
    // color *= fract(vUv.x * 20.);
    color *= fract(gl_FragCoord.x / 20.);
    color *= fract(gl_FragCoord.y / 20.);
    gl_FragColor = vec4(color, 1);
  }`,
    vert: glsl`
      precision mediump float;
      attribute vec3 position, normal;

      uniform mat4 model, view, projection;
      varying vec3 fragNormal, fragPosition;
      varying vec2 vUv;

      void main() {
        fragNormal = normal;
        fragPosition = position;
        vec4 computed = projection * view *model* vec4(position, 1);
        vUv = computed.xy* 0.5 + 0.5;
        gl_Position = computed;
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      model: function(context, props) {
        var rmat = [];
        var rmati = mat4.identity(rmat);
        var theta = context.time;
        mat4.rotateY(rmati, rmati, theta);
        return rmat;
      },
   
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000),
    'lights[0].color': [1, 0, 0],
    'lights[1].color': [0, 1, 0],
    'lights[2].color': [0, 0, 1],
    'lights[3].color': [1, 1, 0],
    'lights[0].position': ({tick}) => {
      const t = 0.1 * tick
      return [
        10 * Math.cos(0.09 * (t)),
        10 * Math.sin(0.09 * (2 * t)),
        10 * Math.cos(0.09 * (3 * t))
      ]
    },
    'lights[1].position': ({tick}) => {
      const t = 0.1 * tick
      return [
        10 * Math.cos(0.05 * (5 * t + 1)),
        10 * Math.sin(0.05 * (4 * t)),
        10 * Math.cos(0.05 * (0.1 * t))
      ]
    },
    'lights[2].position': ({tick}) => {
      const t = 0.1 * tick
      return [
        10 * Math.cos(0.05 * (9 * t)),
        10 * Math.sin(0.05 * (0.25 * t)),
        10 * Math.cos(0.05 * (4 * t))
      ]
    },
    'lights[3].position': ({tick}) => {
      const t = 0.1 * tick
      return [
        10 * Math.cos(0.1 * (0.3 * t)),
        10 * Math.sin(0.1 * (2.1 * t)),
        10 * Math.cos(0.1 * (1.3 * t))
      ]
    }
    },
    primitive: "triangles"
  });
}
var draw = {
  skelly: skelly(regl)
};
regl.frame(function() {
  regl.clear({
    color: [0, 0, 0, 1]
  });
  camera(function() {
    draw.skelly();
  });
});
