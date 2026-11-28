// OBS Shaderfilter. Apply to a complete scene, or to a browser plate after its color key.
uniform int Mode <
    string label = "Transformation"; string widget_type = "select";
    int option_0_value = 0; string option_0_label = "Vector rebuild";
    int option_1_value = 1; string option_1_label = "Mercury bath";
> = 0;
uniform float Amount <
    string label = "Mix (%)"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 100.0; float step = 1.0;
> = 100.0;
uniform float Speed <
    string label = "Motion speed"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 2.0; float step = 0.05;
> = 1.0;

// Clamp samples at transparent plate edges so the film underneath cannot bleed into relief.
float brightnessAt(float2 uv, float fallback) {
    float4 s = image.Sample(textureSampler, saturate(uv));
    return lerp(fallback, dot(s.rgb, float3(.24,.62,.14)), s.a);
}
float hairline(float distanceFromLine, float width) {
    return 1.0 - smoothstep(width, width * 2.2, abs(distanceFromLine));
}
float3 wire(float2 uv, float3 base, float2 gradient, float light, float t) {
    float edge = saturate(length(gradient) * 4.5);
    float3 ink = lerp(float3(.10,.94,1.), float3(1.,.16,.68),
                      smoothstep(-.12,.12, gradient.x - gradient.y));
    // Two isometric line families share the artwork's facade slope.
    float2 grid = frac(float2(uv.y + .94*uv.x, uv.y - .94*uv.x) * 24.0 + .5) - .5;
    float lattice = max(hairline(grid.x,.022),hairline(grid.y,.022));
    float3 blueprint = float3(.018,.011,.078) + lattice * float3(.078,.075,.18)
                     + ink * (edge + .18 * light);
    float sweep = uv.x + .22 * uv.y - (.54 + .51 * sin(t * .45));
    float split = smoothstep(-.012,.012,sweep);
    float boundary = exp(-abs(sweep) * 125.);
    return lerp(base, blueprint, split) + boundary * float3(.48,.73,.92);
}
float3 mercury(float2 uv, float3 base, float2 gradient, float light, float t) {
    // Luma slopes act as surface normals. An imaginary strip light slides across the relief.
    float ripple = sin(uv.y*17. + uv.x*6. - t*.68) + .45*sin(uv.x*19. + t*.41);
    float relief = dot(gradient, float2(1.75,-2.4));
    float angle = uv.y*1.8 + uv.x*.47 + ripple*.12 + relief + light*.70 + t*.09;
    float env = .5 + .5*cos(angle * 6.2831853);
    float3 metal = lerp(float3(.020,.023,.12),float3(.25,.16,.54),smoothstep(.13,.65,env));
    metal = lerp(metal,float3(.18,.90,.98),smoothstep(.64,.85,env));
    metal = lerp(metal,float3(.96,.99,1.),smoothstep(.85,.95,env));
    metal += float3(.66,.085,.38) * exp(-abs(env-.49)*14.);
    float coverage = smoothstep(.012,.20,light + length(gradient)*.75);
    return lerp(base*.72, metal*(.58+.42*saturate(light+length(gradient))) + base*.14,coverage);
}
float4 mainImage(VertData v_in) : TARGET {
    float2 uv = v_in.uv;
    float4 src = image.Sample(textureSampler,uv);
    if (Amount <= 0.0 || src.a <= .001) return src;
    float light = dot(src.rgb,float3(.24,.62,.14));
    float2 d = float2(2./1920.,2./1080.);
    float2 slope = float2(brightnessAt(uv+float2(d.x,0.),light)-brightnessAt(uv-float2(d.x,0.),light),
                          brightnessAt(uv+float2(0.,d.y),light)-brightnessAt(uv-float2(0.,d.y),light));
    float t = elapsed_time * Speed;
    float3 result;
    if (Mode == 0) result = wire(uv,src.rgb,slope,light,t);
    else result = mercury(uv,src.rgb,slope,light,t);
    return float4(lerp(src.rgb,saturate(result),Amount*.01),src.a);
}
