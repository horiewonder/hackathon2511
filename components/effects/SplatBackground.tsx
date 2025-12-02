import React from 'react';
import {
  Canvas,
  Skia,
  Shader,
  Fill,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useWindowDimensions, StyleSheet } from 'react-native';

// Splatoon-inspired ink background shader
const source = Skia.RuntimeEffect.Make(`
uniform vec2 uResolution;
uniform float uTime;

// Hash function for randomness
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Smooth noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal brownian motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / uResolution;

  // Dark base color
  vec3 baseColor = vec3(0.102, 0.102, 0.18); // #1A1A2E

  // Animated ink blobs
  float t = uTime * 0.1;

  // Multiple layers of ink-like patterns
  float ink1 = fbm(uv * 3.0 + vec2(t, 0.0));
  float ink2 = fbm(uv * 4.0 + vec2(0.0, t * 0.7));
  float ink3 = fbm(uv * 2.5 + vec2(t * 0.5, t * 0.3));

  // Splatoon colors (subtle)
  vec3 pink = vec3(1.0, 0.376, 0.565);   // #FF6090
  vec3 cyan = vec3(0.0, 0.96, 1.0);      // #00F5FF
  vec3 green = vec3(0.486, 0.988, 0.0);  // #7CFC00
  vec3 purple = vec3(0.702, 0.533, 1.0); // #B388FF

  // Blend colors based on noise
  vec3 inkColor = mix(pink, cyan, smoothstep(0.4, 0.6, ink1));
  inkColor = mix(inkColor, green, smoothstep(0.5, 0.7, ink2) * 0.5);
  inkColor = mix(inkColor, purple, smoothstep(0.45, 0.65, ink3) * 0.3);

  // Create subtle ink patterns
  float pattern = smoothstep(0.45, 0.55, ink1 * ink2);
  pattern *= 0.15; // Keep it subtle

  // Add some movement/flow
  float flow = sin(uv.y * 10.0 + t * 2.0) * 0.02;
  pattern += flow * smoothstep(0.4, 0.6, ink3);

  // Final color
  vec3 finalColor = mix(baseColor, inkColor, pattern);

  // Add slight vignette
  float vignette = 1.0 - length((uv - 0.5) * 1.2);
  vignette = smoothstep(0.0, 1.0, vignette);
  finalColor *= vignette * 0.3 + 0.7;

  return vec4(finalColor, 1.0);
}
`);

export function SplatBackground() {
  const clock = useClock();
  const { width, height } = useWindowDimensions();

  const uniforms = useDerivedValue(() => {
    return {
      uResolution: [width, height],
      uTime: clock.value / 1000,
    };
  }, [clock, width, height]);

  if (!source) {
    return null;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
