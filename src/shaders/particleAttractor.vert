/**
 * 🌌 Particle Attractor Vertex Shader
 *
 * GPU-accelerated particles that flow toward spiritual words
 */

uniform float u_time;
uniform float u_deltaTime;
uniform vec3 u_attractorPosition;
uniform float u_attractorStrength;
uniform float u_attractorActive;
uniform float u_flowDirection; // 0=down, 1=up, 2=converge, 3=diverge, 4=spiral
uniform float u_turbulence;
uniform float u_particleSpeed;

attribute float a_size;
attribute float a_seed;
attribute vec3 a_velocity;
attribute float a_life;

varying float v_life;
varying float v_distanceToAttractor;
varying vec3 v_color;

// Simplex noise for organic movement
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  float x = snoise(p + dy) - snoise(p - dy);
  float y = snoise(p + dz) - snoise(p - dz);
  float z = snoise(p + dx) - snoise(p - dx);

  return normalize(vec3(x, y, z) / (2.0 * e));
}

void main() {
  vec3 pos = position;
  float seed = a_seed;
  float time = u_time * u_particleSpeed;

  // Base organic movement using curl noise
  vec3 noisePos = pos * 0.5 + time * 0.2;
  vec3 curlVel = curl(noisePos + seed * 100.0) * u_turbulence;

  // Flow direction base velocity
  vec3 flowVel = vec3(0.0);
  if (u_flowDirection < 0.5) {
    flowVel = vec3(0.0, -0.5, 0.0); // Down
  } else if (u_flowDirection < 1.5) {
    flowVel = vec3(0.0, 0.5, 0.0);  // Up
  } else if (u_flowDirection < 2.5) {
    flowVel = normalize(u_attractorPosition - pos) * 0.3; // Converge
  } else if (u_flowDirection < 3.5) {
    flowVel = normalize(pos - u_attractorPosition) * 0.3; // Diverge
  } else {
    // Spiral
    vec3 toCenter = u_attractorPosition - pos;
    vec3 tangent = normalize(cross(toCenter, vec3(0.0, 1.0, 0.0)));
    flowVel = tangent * 0.4 + normalize(toCenter) * 0.2;
  }

  // Attractor influence
  vec3 toAttractor = u_attractorPosition - pos;
  float distToAttractor = length(toAttractor);
  vec3 attractorDir = normalize(toAttractor);

  // Gravitational pull increases as particles get closer
  float pullStrength = u_attractorStrength * u_attractorActive;
  pullStrength *= 1.0 / (distToAttractor * distToAttractor + 0.1);
  pullStrength = min(pullStrength, 2.0); // Cap the pull

  vec3 attractorVel = attractorDir * pullStrength;

  // Combine all velocities
  vec3 finalVel = curlVel + flowVel + attractorVel;

  // Apply velocity
  pos += finalVel * u_deltaTime;

  // Respawn particles that get too close or too far
  if (distToAttractor < 0.05 || distToAttractor > 5.0) {
    // Reset to random position in sphere
    float theta = seed * 6.28318;
    float phi = (fract(seed * 137.5) - 0.5) * 3.14159;
    float r = 2.0 + fract(seed * 73.1) * 2.0;
    pos = u_attractorPosition + vec3(
      r * cos(theta) * cos(phi),
      r * sin(phi),
      r * sin(theta) * cos(phi)
    );
  }

  // Calculate distance for color/size variation
  v_distanceToAttractor = distToAttractor;
  v_life = a_life;

  // Size varies with distance - closer = larger
  float sizeFactor = 1.0 + (1.0 - min(distToAttractor, 2.0) / 2.0) * u_attractorActive;
  float finalSize = a_size * sizeFactor;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = finalSize * (300.0 / -mvPosition.z);
}
