const glslify = require("glslify");
const path = require("path");

module.exports = {
  shaders: require("shader-reload")({
    vertex: glslify(path.resolve(__dirname, "vertex.glsl")),
    fragment: glslify(path.resolve(__dirname, "fragment.glsl"))
  }),
  postShaders: require("shader-reload")({
    vertex: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = 0.5 * (position + 1.0);
      gl_Position = vec4(position, 0, 1);
    }`,
    fragment: glslify(path.resolve(__dirname, "fragment_post.glsl"))
  })
};
