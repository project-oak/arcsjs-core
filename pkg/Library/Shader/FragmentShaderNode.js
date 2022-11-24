/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const FragmentShader = {
  $meta: {
    id: 'FragmentShader',
    displayName: 'Fragment Shader',
    category: 'Media'
  },
  $stores: {
    shader: {
      $type: 'MultilineText',
      $value:
`/*
 * Webcam 'Giant in a lake' effect by Ben Wheatley - 2018
 * License MIT License
 * Contact: github.com/BenWheatley
 */

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float time = iTime;
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec2 pixelSize = vec2(1,1) / iResolution.xy;

    vec3 col = texture(iChannel0, uv).rgb;
    float mirrorPos = 0.3;
    if (uv.y < mirrorPos) {
        float distanceFromMirror = mirrorPos - uv.y;
        float sine = sin((log(distanceFromMirror)*20.0) + (iTime*2.0));
        float dy = 30.0*sine;
        float dx = 0.0;
        dy *= distanceFromMirror;
        vec2 pixelOff = pixelSize * vec2(dx, dy);
        vec2 tex_uv = uv + pixelOff;
        tex_uv.y = (0.6 /* magic number! */) - tex_uv.y;
        col = texture(iChannel0, tex_uv).rgb;

        float shine = (sine + dx*0.05) * 0.05;
        col += vec3(shine, shine, shine);
    }

    fragColor = vec4(col,1.);
}`
    },
    image: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    image2: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    image3: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    image4: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    audio: {
      $type: `AudioStream`,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
  },
  shader: {
    $kind: '$library/Shader/FragmentShader',
    $inputs: ['shader', 'image', 'image2', 'image3', 'image4', 'audio'],
    $outputs: ['shader', 'outputImage']
  }
};
