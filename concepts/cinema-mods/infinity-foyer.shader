// A moving hall of mirrors, built from a single frame of the current OBS source.
uniform float Amount <
    string label = "Mix (%)"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 100.0; float step = 1.0;
> = 100.0;
uniform float Speed <
    string label = "Motion speed"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 2.0; float step = 0.05;
> = 1.0;

float4 mainImage(VertData v_in) : TARGET {
    float2 uv = v_in.uv;
    float4 base = image.Sample(textureSampler,uv);
    if (Amount <= 0.0 || base.a <= .001) return base;
    float t = elapsed_time * Speed;
    // A drifting vanishing point keeps the infinitely nested rectangles just off axis.
    float2 center = float2(.50+.055*sin(t*.17), .50+.038*sin(t*.23));
    float2 p = uv-center;
    float radius = max(abs(p.x)*2.0,abs(p.y)*2.0);
    float depth = log2(max(radius,.012)) / log2(.55) + t*.14;
    float level = floor(depth);
    float band = frac(depth);
    float2 cell = p * (pow(.55,band) / max(radius,.012));
    // Every other bezel is a mirror. Source normals and text on the next level flip with it.
    float odd = frac(level*.5)*2.0;
    cell.x *= 1.0 - 2.0*odd;
    float2 sampleUV = saturate(float2(.5,.5)+cell);
    float4 reflected = image.Sample(textureSampler,sampleUV);
    float3 room = lerp(base.rgb,reflected.rgb,reflected.a);
    float bevel = 1.-smoothstep(.006,.044,min(band,1.-band));
    float3 trim = lerp(float3(.98,.27,.66),float3(.31,.92,.96),odd);
    room = room*(.85+.15*odd) + trim*bevel*.67;
    float opening = smoothstep(.018,.065,radius);
    return float4(lerp(base.rgb,saturate(room),opening * Amount*.01),base.a);
}
