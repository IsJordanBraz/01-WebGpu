struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f,
  @location(1) textCoords: vec2f,
}

@vertex
fn vertexMain(
  @location(0) pos : vec2f,
  @location(1) color : vec3f,
  @location(2) textCoords: vec2f,
  ) -> VertexOut {
    var output : VertexOut;
    output.position = vec4f(pos, 0.0, 1.0);
    output.color = vec4f(color, 1.0);
    output.textCoords = textCoords;
    return output;
}

@group(0) @binding(0)
var texSampler: sampler;

@group(0) @binding(1)
var tex: texture_2d<f32>;

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4f
{
  var textureColor = textureSample(tex, texSampler, in.textCoords);
  return in.color * textureColor;
}