/**
 * 🌌 Particle Attractor Fragment Shader
 *
 * Renders glowing spiritual particles
 */

uniform vec3 u_color;
uniform vec3 u_secondaryColor;
uniform float u_time;
uniform float u_attractorActive;
uniform float u_pulseFrequency;

varying float v_life;
varying float v_distanceToAttractor;

void main() {
  // Create circular particle with soft edges
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // Discard pixels outside the circle
  if (dist > 0.5) discard;

  // Soft falloff
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha = pow(alpha, 1.5);

  // Pulse effect
  float pulse = 0.8 + 0.2 * sin(u_time * u_pulseFrequency * 6.28318);

  // Color based on distance to attractor
  float colorMix = smoothstep(0.0, 2.0, v_distanceToAttractor);
  vec3 color = mix(u_color, u_secondaryColor, colorMix);

  // Increase brightness near attractor
  float brightness = 1.0 + (1.0 - min(v_distanceToAttractor, 1.0)) * u_attractorActive * 0.5;
  color *= brightness * pulse;

  // Inner glow
  float innerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
  color += vec3(1.0) * innerGlow * 0.3 * u_attractorActive;

  // Apply life fade
  alpha *= v_life;

  // HDR output for bloom
  gl_FragColor = vec4(color, alpha);
}
