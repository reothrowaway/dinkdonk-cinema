// DinkDonk Cinema display looks for obs-shaderfilter. Place on a scene, or on the auditorium browser source after its color key.
uniform int Preset <
    string label = "Cinema look";
    string widget_type = "select";
    int option_0_value = 0;
    string option_0_label = "After-hours mall";
    int option_1_value = 1;
    string option_1_label = "Pearl diffusion";
    int option_2_value = 2;
    string option_2_label = "Chrome & cyan";
    int option_3_value = 3;
    string option_3_label = "Pink halation";
    int option_4_value = 4;
    string option_4_label = "Miami dusk";
    int option_5_value = 5;
    string option_5_label = "Anamorphic neon";
    int option_6_value = 6;
    string option_6_label = "Star-filter glass";
    int option_7_value = 7;
    string option_7_label = "Curved CRT";
    int option_8_value = 8;
    string option_8_label = "VHS rental";
    int option_9_value = 9;
    string option_9_label = "Milk-glass pastels";
    int option_10_value = 10;
    string option_10_label = "Ultraviolet arcade";
    int option_11_value = 11;
    string option_11_label = "35 mm midnight";
    int option_12_value = 12;
    string option_12_label = "Neon rain";
> = 0;
uniform float Strength <
    string label = "Strength (%)";
    string widget_type = "slider";
    float minimum = 0.0; float maximum = 100.0; float step = 1.0;
> = 85.0;
uniform bool Keyed_Plate <
    string label = "Keep film cutout aligned (keyed browser source)";
> = false;

float luma(float3 rgb) { return dot(rgb, float3(0.24, 0.64, 0.12)); }

// Only bright, opaque picture content contributes to a halo. Sampling radius is expressed at the 1080p design size.
float3 bulb(float2 uv) {
    float4 c = image.Sample(textureSampler, saturate(uv));
    float peak = max(c.r, max(c.g, c.b));
    float t = saturate((peak - 0.40) / 0.52);
    return c.rgb * t * t * c.a;
}
float3 ring(float2 uv, float2 d) {
    float2 a = d * 0.7071;
    return (bulb(uv+float2(d.x,0))+bulb(uv-float2(d.x,0))
           +bulb(uv+float2(0,d.y))+bulb(uv-float2(0,d.y))
           +bulb(uv+a)+bulb(uv-a)+bulb(uv+float2(a.x,-a.y))+bulb(uv+float2(-a.x,a.y))) * 0.125;
}
float3 spikes(float2 uv, float2 stepUV, float distancePx) {
    float2 d = stepUV * distancePx;
    float2 crossD = float2(d.x,-d.y);
    return (bulb(uv+d)+bulb(uv-d)+bulb(uv+crossD)+bulb(uv-crossD)) * 0.25;
}
float4 mainImage(VertData v_in) : TARGET {
    float mixAmount = saturate(Strength * 0.01);
    float2 uv = v_in.uv;
    float4 original = image.Sample(textureSampler, uv);
    if (mixAmount <= 0.0) return original;
    float2 centered = uv * 2.0 - 1.0;
    float radius2 = dot(centered,centered);
    float2 unitUV = float2(1.0 / 1920.0, 1.0 / 1080.0);
    if ((Preset == 7 || Preset == 12) && !Keyed_Plate) {
        float k = (Preset == 7 ? 0.12 : 0.027) * mixAmount;
        uv = 0.5 + 0.5 * centered * (1.0 + k * radius2) / (1.0 + 2.0 * k);
    }
    float4 surface = image.Sample(textureSampler,uv);
    if (surface.a <= 0.0001) return surface;
    float3 rgb = surface.rgb;
    if (Preset == 7 || Preset == 12) {
        float2 fringe = unitUV * centered * radius2 * ((Preset == 7 ? 3.2 : 1.1) * mixAmount);
        rgb.r = image.Sample(textureSampler,saturate(uv+fringe)).r;
        rgb.b = image.Sample(textureSampler,saturate(uv-fringe)).b;
    }
    float3 shadow, light, tint;
    float saturation, contrast, glow;
    if (Preset == 0) { // After-hours mall
        shadow = float3(-13,17,26); light = float3(30,-7,18); tint = float3(1,0.69,0.97);
        saturation = 1.12; contrast = 1.00; glow = 0.95;
    }
    else if (Preset == 1) { // Pearl diffusion
        shadow = float3(3,1,6); light = float3(10,7,8); tint = float3(1,0.93,0.96);
        saturation = 0.92; contrast = 1.00; glow = 1.75;
    }
    else if (Preset == 2) { // Chrome & cyan
        shadow = float3(-9,7,18); light = float3(-15,26,27); tint = float3(0.48,0.94,1);
        saturation = 0.84; contrast = 1.20; glow = 0.50;
    }
    else if (Preset == 3) { // Pink halation
        shadow = float3(8,-4,10); light = float3(15,-2,-4); tint = float3(1,0.24,0.32);
        saturation = 1.00; contrast = 1.00; glow = 1.60;
    }
    else if (Preset == 4) { // Miami dusk
        shadow = float3(18,-13,39); light = float3(43,12,-22); tint = float3(1,0.61,0.43);
        saturation = 1.14; contrast = 1.00; glow = 0.75;
    }
    else if (Preset == 5) { // Anamorphic neon
        shadow = float3(-3,0,13); light = float3(4,6,14); tint = float3(0.34,0.72,1);
        saturation = 1.00; contrast = 1.07; glow = 0.52;
    }
    else if (Preset == 6) { // Star-filter glass
        shadow = float3(4,-3,9); light = float3(12,6,-4); tint = float3(1,0.83,0.65);
        saturation = 1.00; contrast = 1.00; glow = 0.38;
    }
    else if (Preset == 7 || Preset == 12) { // Curved CRT
        shadow = float3(-3,6,8); light = float3(4,2,8); tint = float3(0.72,1,0.96);
        saturation = 1.00; contrast = 1.00; glow = 0.38;
    }
    else if (Preset == 8) { // VHS rental
        shadow = float3(10,4,16); light = float3(3,5,2); tint = float3(1,0.75,0.94);
        saturation = 0.91; contrast = 1.00; glow = 0.00;
    }
    else if (Preset == 9) { // Milk-glass pastels
        shadow = float3(18,5,25); light = float3(-4,17,14); tint = float3(0.77,1,0.9);
        saturation = 0.76; contrast = 0.83; glow = 0.90;
    }
    else if (Preset == 10) { // Ultraviolet arcade
        shadow = float3(16,-18,42); light = float3(37,-18,30); tint = float3(0.96,0.4,1);
        saturation = 1.28; contrast = 1.12; glow = 1.05;
    }
    else if (Preset == 11) { // 35 mm midnight
        shadow = float3(0,2,12); light = float3(23,10,-7); tint = float3(1,0.72,0.46);
        saturation = 0.91; contrast = 1.05; glow = 0.66;
    }
    else { // Neon rain: a slight lens bow, cool shadows, rose light and polished wet highlights.
        shadow = float3(-9,10,26); light = float3(25,0,18); tint = float3(0.94,0.71,1.0);
        saturation = 1.10; contrast = 1.07; glow = 1.12;
    }
    float y = luma(rgb);
    float low = saturate(y * 12.0) * pow(saturate(1.0-y), 2.1);
    float3 graded = lerp(float3(y,y,y),rgb,saturation);
    if (Preset == 8) {
        float3 echo = image.Sample(textureSampler,saturate(uv - unitUV*float2(8,0))).rgb;
        graded += 0.64 * ((echo-luma(echo))-(rgb-y)) + 0.27 * (echo-rgb);
    }
    graded = (graded - 0.37) * contrast + 0.37 + (shadow*low + light*pow(saturate(y),0.95))/255.0;
    if (Preset == 9) graded += 0.031;
    if (Preset == 8) graded += 0.016;
    float3 halo = float3(0,0,0);
    if (glow > 0.0) halo = (0.52*ring(uv,unitUV*3.0) + 0.32*ring(uv,unitUV*8.0) + 0.16*ring(uv,unitUV*16.0))*glow;
    if (Preset == 5) {
        float3 streak = float3(0,0,0);
        for(int i=1;i<=6;i++) {
            float2 offset = float2(unitUV.x*(2.0*i*i),0);
            streak += (bulb(uv+offset)+bulb(uv-offset))*(7.0-i)/42.0;
        }
        halo += 2.2*streak;
    }
    if (Preset == 6) halo += 0.95*spikes(uv,unitUV,5.0)+0.65*spikes(uv,unitUV,12.0)+0.38*spikes(uv,unitUV,23.0);
    graded += (1.0 - saturate(graded)*0.91) * halo * tint;
    if (Preset == 2 || Preset == 12) graded += (Preset == 2 ? 0.65 : 0.41)*max(0.0,max(rgb.r,max(rgb.g,rgb.b))-0.57)*rgb*rgb;
    if (Preset == 7) graded *= (1.0-0.03*radius2*radius2) * (1.0-0.065*(1.0+cos(v_in.uv.y*1080.0*1.256637)));
    if (Preset == 11) graded *= 1.0-0.08*radius2*radius2;
    if (Preset == 8 || Preset == 11) {
        float2 xy = floor(v_in.uv / uv_pixel_interval);
        float grain = frac(52.9829189*frac(dot(xy,float2(0.06711056,0.00583715))))-0.5;
        graded += grain*(Preset == 8 ? 0.014 : 0.018);
    }
    return float4(lerp(surface.rgb,saturate(graded),mixAmount),surface.a);
}
