/**
 * ✨ Spiritual Glow Fragment Shader
 *
 * Creates volumetric light effect around sacred words
 */

uniform vec2 u_resolution;
uniform vec2 u_target;       // Word center position (normalized)
uniform float u_time;
uniform float u_intensity;
uniform vec3 u_color;
uniform float u_phase;       // 0=dormant, 0.33=awakening, 0.66=active, 1=fading

// God rays / volumetric light parameters
const int NUM_SAMPLES = 64;
const float DENSITY = 0.5;
const float WEIGHT = 0.6;
const float DECAY = 0.93;
const float EXPOSURE = 0.4;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

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

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Distance from word center
  vec2 toCenter = uv - u_target;
  float dist = length(toCenter);

  // Phase-based intensity
  float phaseIntensity = 1.0;
  if (u_phase < 0.33) {
    // Dormant to awakening
    phaseIntensity = u_phase / 0.33;
  } else if (u_phase > 0.66) {
    // Active to fading
    phaseIntensity = 1.0 - (u_phase - 0.66) / 0.34;
  }

  // === CORE GLOW ===
  float glow = 0.08 / (dist + 0.02);
  glow = pow(glow, 1.2);

  // === VOLUMETRIC RAYS ===
  vec2 rayDir = normalize(toCenter);
  vec2 samplePos = uv;
  float illumination = 0.0;
  float weight = WEIGHT;

  for (int i = 0; i < NUM_SAMPLES; i++) {
    samplePos -= rayDir * DENSITY / float(NUM_SAMPLES);
    float sampleDist = distance(samplePos, u_target);

    // Sample the "light source"
    float lightSample = 0.1 / (sampleDist + 0.05);
    lightSample = pow(lightSample, 1.5);

    illumination += lightSample * weight;
    weight *= DECAY;
  }

  illumination *= EXPOSURE;

  // === ANIMATED NOISE ===
  vec2 noiseCoord = uv * 3.0 + u_time * 0.1;
  float noiseValue = fbm(noiseCoord);
  noiseValue = noiseValue * 0.3 + 0.7;

  // === RIPPLE EFFECT ===
  float ripple = sin(dist * 30.0 - u_time * 3.0) * 0.5 + 0.5;
  ripple = pow(ripple, 3.0);
  ripple *= exp(-dist * 5.0); // Fade with distance

  // === COMBINE EFFECTS ===
  float totalLight = (glow + illumination * 0.5 + ripple * 0.3) * noiseValue;
  totalLight *= u_intensity * phaseIntensity;

  // Color with slight variation
  vec3 finalColor = u_color * totalLight;

  // Add white core
  float coreIntensity = 0.15 / (dist + 0.01);
  coreIntensity = pow(coreIntensity, 2.0) * 0.5;
  finalColor += vec3(1.0) * coreIntensity * phaseIntensity;

  // Chromatic aberration at edges
  float chromatic = dist * 0.1;
  finalColor.r *= 1.0 + chromatic * 0.5;
  finalColor.b *= 1.0 - chromatic * 0.3;

  // Output with alpha for blending
  float alpha = min(totalLight + coreIntensity * 0.5, 1.0);

  gl_FragColor = vec4(finalColor, alpha * phaseIntensity);
}
