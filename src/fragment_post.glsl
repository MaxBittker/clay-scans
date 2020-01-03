
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float wRcp, hRcp;
uniform vec2 resolution;

#define R int(0)

// clang-format off
// #pragma glslify: dither = require(glsl-dither)
// #pragma glslify: dither = require(glsl-dither/8x8)
#pragma glslify: dither = require(glsl-dither/4x4)
// #pragma glslify: dither = require(glsl-dither/2x2)
// clang-format on

void main() {
  vec4 color = texture2D(tex, uv);

  gl_FragColor = dither(gl_FragCoord.xy, color);
}

// void main() {
//   float W = float((1 + 2 * R) * (1 + 2 * R));
//   vec3 avg = vec3(0.0);
//   for (int x = -R; x <= +R; x++) {
//     for (int y = -R; y <= +R; y++) {
//       avg += (1.0 / W) *
//              texture2D(tex, uv + vec2(float(x) * wRcp, float(y) * hRcp)).xyz;
//     }
//   }
//   gl_FragColor = dither(gl_FragCoord.xy, vec4(avg, 1.0));
// }
/*

const int lookupSize = 64;
const float errorCarry = 0.3;

float getGrayscale(vec2 coords) {
  vec2 uv = coords / resolution.xy;
  uv.y = 1.0 - uv.y;
  vec3 sourcePixel = texture2D(tex, uv).rgb;
  return length(sourcePixel * vec3(0.2126, 0.7152, 0.0722));
}

void main() {

  int topGapY = int(resolution.y - gl_FragCoord.y);

  int cornerGapX = int((gl_FragCoord.x < 10.0) ? gl_FragCoord.x
                                               : resolution.x - gl_FragCoord.x);
  int cornerGapY = int((gl_FragCoord.y < 10.0) ? gl_FragCoord.y
                                               : resolution.y - gl_FragCoord.y);
  int cornerThreshhold = ((cornerGapX == 0) || (topGapY == 0)) ? 5 : 4;

  if (cornerGapX + cornerGapY < cornerThreshhold) {

    gl_FragColor = vec4(0, 0, 0, 1);

  } else if (topGapY < 20) {

    if (topGapY == 19) {

      gl_FragColor = vec4(0, 0, 0, 1);

    } else {

      gl_FragColor = vec4(1, 1, 1, 1);
    }

  } else {

    float xError = 0.0;
    for (int xLook = 0; xLook < lookupSize; xLook++) {
      float grayscale =
          getGrayscale(gl_FragCoord.xy + vec2(-lookupSize + xLook, 0));
      grayscale += xError;
      float bit = grayscale >= 0.5 ? 1.0 : 0.0;
      xError = (grayscale - bit) * errorCarry;
    }

    float yError = 0.0;
    for (int yLook = 0; yLook < lookupSize; yLook++) {
      float grayscale =
          getGrayscale(gl_FragCoord.xy + vec2(0, -lookupSize + yLook));
      grayscale += yError;
      float bit = grayscale >= 0.5 ? 1.0 : 0.0;
      yError = (grayscale - bit) * errorCarry;
    }

    float finalGrayscale = getGrayscale(gl_FragCoord.xy);
    finalGrayscale += xError * 0.5 + yError * 0.5;
    float finalBit = finalGrayscale >= 0.5 ? 1.0 : 0.0;

    gl_FragColor = vec4(finalBit, finalBit, finalBit, 1);
  }
}
*/