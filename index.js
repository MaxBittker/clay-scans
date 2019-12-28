// var mesh = require("./assets/skullmeshbig.json");
var mesh = require("./assets/model.json");
 
const { setupOverlay } = require("regl-shader-error-overlay");
setupOverlay();


var regl = require("regl")({
  extensions: ['OES_element_index_uint', 'OES_standard_derivatives']
});


let shaders = require("./src/pack.shader.js");
let vert = shaders.vertex;
let frag = shaders.fragment;


shaders.on("change", () => {
  console.log("update");
  vert = shaders.vertex;
  frag = shaders.fragment;
  let overlay = document.getElementById("regl-overlay-error");
  overlay && overlay.parentNode.removeChild(overlay);
});



var mat4 = require("gl-mat4");
var normals = require("angle-normals");
var camera = require("regl-camera")(regl, {
  center: [0, -30, 0],
  distance: 120
});

var lightSpeed = 0.1;
function clay(regl) {

  return regl({
  
    frag: () => shaders.fragment,
    vert: () => shaders.vertex,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      model: function (context, props) {
        var rmat = [];
        var rmati = mat4.identity(rmat);
        var theta = context.time;
        mat4.rotateY(rmati, rmati, 0.);
        return rmat;
      },
      t: ({ time }) => time,
      projection: ({ viewportWidth, viewportHeight }) =>
        mat4.perspective([],
          Math.PI / 4,
          viewportWidth / viewportHeight,
          0.01,
          1000),
      'lights[0].color': [1, 0.4, 0.4],
      'lights[1].color': [0.4, 1, 0.4],
      'lights[2].color': [0.4, 0.4, 1],
      'lights[3].color': [1, 1, 0.4],
      'lights[0].position': ({ tick }) => {
        const t = lightSpeed * tick
        return [
          40 * Math.cos(0.09 * (t)),
          (40 * Math.sin(0.09 * (2 * t))),
          40 * Math.cos(0.09 * (3 * t))
        ]
      },
      'lights[1].position': ({ tick }) => {
        const t = lightSpeed * tick
        return [
          40 * Math.cos(0.05 * (5 * t + 1)),
          40 * Math.sin(0.05 * (4 * t)),
          40 * Math.cos(0.05 * (0.1 * t))
        ]
      },
      'lights[2].position': ({ tick }) => {
        const t = lightSpeed * tick
        return [
          40 * Math.cos(0.05 * (9 * t)),
          40 * Math.sin(0.05 * (0.25 * t)),
          40 * Math.cos(0.05 * (4 * t))
        ]
      },
      'lights[3].position': ({ tick }) => {
        const t = lightSpeed * tick
        return [
          40 * Math.cos(0.1 * (0.3 * t)),
          40 * Math.sin(0.1 * (2.1 * t)),
          40 * Math.cos(0.1 * (1.3 * t))
        ]
      }
    },
    primitive: "triangles"
  });
}

var draw = {
  clay: clay(regl)
};

regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  });
  camera(function () {
    draw.clay();
  });
});
