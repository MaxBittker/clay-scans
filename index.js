// var mesh = require("./assets/skullmesh.json");
// var mesh = require("./assets/skullmeshbig.json");
var mesh = require("./assets/mobius_small.json");
// var mesh = require("./assets/skelly.json");
// var mesh = require("./assets/tristar.json");
// var mesh = require("./assets/tri_small.json");

const { setupOverlay } = require("regl-shader-error-overlay");
setupOverlay();

var regl = require("regl")({
  extensions: [
    "OES_element_index_uint",
    "OES_standard_derivatives",
    "angle_instanced_arrays"
  ]
});

let shaders = require("./src/pack.shader.js");
let postShaders = require("./src/post.shader.js");

shaders.on("change", () => {
  console.log("update");
  vert = shaders.vertex;
  frag = shaders.fragment;
  let overlay = document.getElementById("regl-overlay-error");
  overlay && overlay.parentNode.removeChild(overlay);
});
postShaders.on("change", () => {
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
  distance: 120,
  far: 40000,
  near: -200
});

// create fbo. We set the size in `regl.frame`
const fbo = regl.framebuffer({
  color: regl.texture({
    width: 1,
    height: 1,
    wrap: "clamp"
  }),
  depth: true
});

var N = 3; // N bunnies on the width, N bunnies on the height.

var angle = [];
for (var i = 0; i < N * N; i++) {
  // generate random initial angle.
  angle[i] = Math.random() * (2 * Math.PI);
}

// This buffer stores the angles of all
// the instanced bunnies.
const angleBuffer = regl.buffer({
  length: angle.length * 4,
  type: "float",
  usage: "dynamic"
});

var lightSpeed = 0.01;

var drawClay = regl({
  frag: () => shaders.fragment,
  vert: () => shaders.vertex,
  attributes: {
    position: mesh.positions,
    normal: normals(mesh.cells, mesh.positions),
    offset: {
      buffer: regl.buffer(
        Array(N * N)
          .fill()
          .map((_, i) => {
            var hi = (N * N) / 2;
            var ni = i - hi;
            var x = (-1 + (2 * Math.floor(i / N)) / N) * 150;
            var z = (-1 + (2 * (i % N)) / N) * 150;
            // return [x, ni * 0, z];
            return [0, ni * 0, 0];
          })
      ),
      divisor: 1
    },
    color: {
      buffer: regl.buffer(
        Array(N * N)
          .fill()
          .map((_, i) => {
            var x = Math.floor(i / N) / (N - 1);
            var z = (i % N) / (N - 1);
            return [Math.random(), Math.random(), Math.random()];
          })
      ),
      divisor: 1
    },
    angle: {
      buffer: angleBuffer,
      divisor: 1
    }
  },
  elements: mesh.cells,
  instances: N * N,

  uniforms: {
    model: function(context, props) {
      var rmat = [];
      var rmati = mat4.identity(rmat);
      var theta = context.time * 0.0;
      mat4.rotateY(rmati, rmati, theta);
      return rmat;
    },
    t: ({ time }) => time,
    projection: ({ viewportWidth, viewportHeight }) =>
      mat4.perspective(
        [],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      ),
    resolution: ({ viewportWidth, viewportHeight }) => [
      viewportWidth,
      viewportHeight
    ],
    "lights[0].color": [1, 0.4, 0.4],
    "lights[1].color": [0.4, 1, 0.4],
    "lights[2].color": [0.4, 0.4, 1],
    "lights[3].color": [1, 1, 0.4],
    "lights[0].position": ({ tick }) => {
      const t = lightSpeed * tick;
      console.log(camera);
      // debugger;
      return [
        40 * Math.cos(0.09 * t),
        40 * Math.sin(0.09 * (2 * t)),
        40 * Math.cos(0.09 * (3 * t))
      ];
    },
    "lights[1].position": ({ tick }) => {
      const t = lightSpeed * tick;
      return [
        40 * Math.cos(0.05 * (5 * t + 1)),
        40 * Math.sin(0.05 * (4 * t)),
        40 * Math.cos(0.05 * (0.1 * t))
      ];
    },
    "lights[2].position": ({ tick }) => {
      const t = lightSpeed * tick;
      return [
        40 * Math.cos(0.05 * (9 * t)),
        40 * Math.sin(0.05 * (0.25 * t)),
        40 * Math.cos(0.05 * (4 * t))
      ];
    },
    "lights[3].position": ({ tick }) => {
      const t = lightSpeed * tick;
      return [
        40 * Math.cos(0.1 * (0.3 * t)),
        40 * Math.sin(0.1 * (2.1 * t)),
        40 * Math.cos(0.1 * (1.3 * t))
      ];
    }
  },
  framebuffer: fbo,
  primitive: "triangles"
});
// console.log(shaders);
// debugger;
const drawFboBlurred = regl({
  frag: () => postShaders.fragment,
  vert: () => postShaders.vertex,
  attributes: {
    position: [-4, -4, 4, -4, 0, 4]
  },
  uniforms: {
    tex: ({ count }) => fbo,
    resolution: ({ viewportWidth, viewportHeight }) => [
      viewportWidth,
      viewportHeight
    ],
    wRcp: ({ viewportWidth }) => 1.0 / viewportWidth,
    hRcp: ({ viewportHeight }) => 1.0 / viewportHeight
  },
  depth: { enable: false },
  count: 3
});

// var draw = {
//   clay: clay(regl)
// };

regl.frame(function({ viewportWidth, viewportHeight }) {
  fbo.resize(viewportWidth, viewportHeight);

  // regl.clear({
  //   color: [0.7, 0.8, 0.8, 1]
  // });

  // rotate the bunnies every frame.
  for (var i = 0; i < N * N; i++) {
    angle[i] += 0.01;
  }
  angleBuffer.subdata(angle);
  // regl.clear({
  //   color: [0.7, 0.8, 0.8, 1]
  // });
  camera(function(c) {
    console.log(c);
    // debugger;

    fbo.use(() => {
      regl.clear({
        color: [0.7, 0.8, 0.8, 1],
        // color: [1, 1, 1, 1],
        depth: 1
      });
      drawClay();
    });
    drawFboBlurred();
  });
});
