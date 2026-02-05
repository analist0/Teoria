/**
 * 🌌 Aurora Background Shader
 *
 * Creates flowing aurora borealis effect for the prayer background
 */

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_intensity;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float time = u_time * 0.15;

  // Create flowing aurora bands
  float y = uv.y;

  // Multiple aurora layers
  float aurora1 = fbm(vec2(uv.x * 2.0 + time, y * 0.5 + time * 0.3));
  float aurora2 = fbm(vec2(uv.x * 3.0 - time * 0.7, y * 0.8 + time * 0.2));
  float aurora3 = fbm(vec2(uv.x * 1.5 + time * 0.5, y * 1.2 - time * 0.4));

  // Vertical gradient - aurora stronger at top
  float verticalFade = pow(1.0 - uv.y, 0.5);

  // Wave distortion
  float wave = sin(uv.x * 10.0 + time * 2.0) * 0.02;
  float distortedY = y + wave + aurora1 * 0.1;

  // Aurora intensity bands
  float band1 = smoothstep(0.3, 0.5, distortedY) * smoothstep(0.8, 0.6, distortedY);
  float band2 = smoothstep(0.1, 0.3, distortedY) * smoothstep(0.5, 0.3, distortedY);
  float band3 = smoothstep(0.5, 0.7, distortedY) * smoothstep(0.9, 0.7, distortedY);

  // Combine with noise for organic look
  float intensity1 = band1 * (aurora1 * 0.5 + 0.5) * 0.6;
  float intensity2 = band2 * (aurora2 * 0.5 + 0.5) * 0.4;
  float intensity3 = band3 * (aurora3 * 0.5 + 0.5) * 0.5;

  // Color mixing
  vec3 color = u_color1 * intensity1 +
               u_color2 * intensity2 +
               u_color3 * intensity3;

  // Add shimmer
  float shimmer = snoise(uv * 50.0 + time * 5.0) * 0.1 + 0.9;
  color *= shimmer;

  // Brightness variation
  float brightness = 0.8 + 0.2 * sin(time * 0.5);
  color *= brightness * u_intensity;

  // Dark base
  vec3 baseColor = vec3(0.02, 0.02, 0.05);
  color = mix(baseColor, color, verticalFade * 0.7 + 0.3);

  // Stars
  float stars = step(0.998, snoise(uv * 200.0));
  float twinkle = sin(time * 3.0 + snoise(uv * 100.0) * 10.0) * 0.5 + 0.5;
  color += vec3(1.0) * stars * twinkle * 0.5;

  gl_FragColor = vec4(color, 1.0);
}
