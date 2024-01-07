struct VertexOut {
  @builtin(position) position : vec4f,  
  @location(0) textCoords: vec2f,
  @location(1) color : vec4f,
}

@group(0) @binding(0)
var<uniform> projectionViewMatrix: mat4x4f;

@vertex
fn vertexMain(
  @location(0) pos : vec2f,
  @location(1) textCoords: vec2f,
  @location(2) color : vec3f,
  
  ) -> VertexOut {
    var output : VertexOut;
    output.position = projectionViewMatrix * vec4f(pos, 0.0, 1.0);
    output.color = vec4f(color, 1.0);
    output.textCoords = textCoords;
    return output;
}

@group(1) @binding(0)
var texSampler: sampler;

@group(1) @binding(1)
var tex: texture_2d<f32>;

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4f
{
  var textureColor = textureSample(tex, texSampler, in.textCoords);
  return in.color * textureColor;
}