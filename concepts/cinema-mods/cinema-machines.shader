// Cinema Machines | OBS Shaderfilter. Every mode works from the current source frame.
uniform int Mode <
    string label = "Machine"; string widget_type = "select";
    int option_0_value = 0; string option_0_label = "Prism Cathedral";
    int option_1_value = 1; string option_1_label = "Scanline Elevator";
    int option_2_value = 2; string option_2_label = "Lenticular Marquee";
    int option_3_value = 3; string option_3_label = "Black Hole Matinee";
    int option_4_value = 4; string option_4_label = "Folding Screen";
    int option_5_value = 5; string option_5_label = "Pin Matrix";
    int option_6_value = 6; string option_6_label = "Ribbon Plotter";
    int option_7_value = 7; string option_7_label = "Leaded Glass";
    int option_8_value = 8; string option_8_label = "Thermal Receipt";
    int option_9_value = 9; string option_9_label = "Contact Printer";
    int option_10_value = 10; string option_10_label = "Tidal Glass";
    int option_11_value = 11; string option_11_label = "Horizon Drive";
    int option_12_value = 12; string option_12_label = "Mirrorball Ballroom";
    int option_13_value = 13; string option_13_label = "Poster Peel";
    int option_14_value = 14; string option_14_label = "Parallax Cutouts";
    int option_15_value = 15; string option_15_label = "Silk Facets";
    int option_16_value = 16; string option_16_label = "Laser Topography";
    int option_17_value = 17; string option_17_label = "Pinball Optics";
    int option_18_value = 18; string option_18_label = "Warp Gate";
    int option_19_value = 19; string option_19_label = "Glyph Cascade";
> = 0;
uniform float Amount <
    string label = "Mix (%)"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 100.0; float step = 1.0;
> = 100.0;
uniform float Speed <
    string label = "Motion speed"; string widget_type = "slider";
    float minimum = 0.0; float maximum = 2.0; float step = 0.05;
> = 1.0;

#define tau 6.2831853
#define cyanLight float3(.13,.92,1.)
#define pinkLight float3(1.,.12,.55)
float luma(float3 c) { return dot(c,float3(.24,.62,.14)); }
float noiseCell(float2 p) { return frac(sin(dot(p,float2(12.9898,78.233)))*4375.5453); }
float2 foldUV(float2 uv) { return 1.-abs(frac(uv*.5)*2.-1.); }
float3 picture(float2 uv,float3 fallback) {
    float4 s=image.Sample(textureSampler,foldUV(uv));
    return lerp(fallback,s.rgb,s.a);
}
float stroke(float distanceFromLine,float softWidth) {
    return 1.-smoothstep(softWidth*.45,softWidth,abs(distanceFromLine));
}
float2 rotatePoint(float2 p,float a) {
    float c=cos(a),s=sin(a);
    return float2(c*p.x-s*p.y,s*p.x+c*p.y);
}
float3 prism(float2 uv,float3 base,float t) {
    float2 p=(uv-.5)*float2(1.77778,1.);
    float r=length(p), sector=tau/6.;
    float a=abs(frac((atan2(p.y,p.x)+t*.13)/sector+.5)-.5)*sector;
    float2 ray=float2(cos(a+t*.08),sin(a+t*.08));
    float2 v=float2(.26+.05*sin(t*.19),.33)+ray*r*float2(.90,1.55);
    return picture(v,base) + .12*cyanLight*stroke(sin(a*6.),.026);
}
float3 elevator(float2 uv,float3 base,float t) {
    float row=floor(uv.y*13.), y=frac(uv.y*13.);
    float travel=sin(row*1.19+t*.8);
    float offset=.18*travel*travel*travel;
    float3 c=picture(uv+float2(offset,0.),base);
    return c*(.78+.22*smoothstep(0.,.15,y)) + pinkLight*.30*stroke(y-.032,.025)*abs(travel);
}
float3 lenticular(float2 uv,float3 base,float t) {
    float ridge=frac((uv.x+.025*uv.y)*43.+t*.10);
    float phase=.50+.36*sin(t*.52);
    float side=smoothstep(phase-.035,phase+.035,ridge);
    float2 flipped=float2(1.-uv.x+.035*sin(t*.31),uv.y);
    float3 c=lerp(picture(uv+float2((ridge-.5)*.047,0.),base),picture(flipped,base),side);
    return c*(.74+.26*cos((ridge-.5)*2.9)) + .16*cyanLight*stroke(ridge-phase,.065);
}
float3 blackHole(float2 uv,float3 base,float t) {
    float2 aspect=float2(1.77778,1.), center=float2(.50+.08*sin(t*.19),.49+.04*cos(t*.23));
    float2 p=(uv-center)*aspect;
    float r=max(length(p),.001);
    float bend=.033/(r+.065);
    float2 curved=center+rotatePoint(p,bend)*((r+.039/(r+.10))/r)/aspect;
    float3 c=lerp(base,picture(curved,base),1.-smoothstep(.23,.68,r));
    float ring=stroke(r-.128,.017)+.38*exp(-abs(r-.133)*35.);
    return c*smoothstep(.105,.13,r)+float3(1.,.46,.18)*ring*(.68+.32*sin(atan2(p.y,p.x)-t*.7));
}
float3 pleats(float2 uv,float3 base,float t) {
    float axis=uv.x+.40*uv.y, cell=frac(axis*8.);
    float hinge=1.-abs(2.*cell-1.);
    float flex=.5+.47*sin(t*.51+axis*3.);
    float2 bend=float2(-.095,.105)*hinge*flex;
    float bright=cell<.5 ? 1. : .56+.24*(1.-flex);
    return picture(uv+bend,base)*bright + .09*hinge*float3(.57,.40,.99);
}
float3 pins(float2 uv,float3 base,float t) {
    float2 count=float2(144.,81.), id=floor(uv*count), p=frac(uv*count)-.5;
    float3 c=picture((id+.5)/count,base);
    float h=sqrt(saturate(luma(c))), radius=.14+.33*h;
    float2 head=p-float2(-.035,-.15*h);
    float dist=length(head), cover=1.-smoothstep(radius-.065,radius,dist);
    float glow=exp(-dot(head+float2(.1,.10),head+float2(.1,.10))*29.);
    float sweep=.61+.39*cos(id.x*.038+id.y*.056-t*.7);
    return float3(.015,.014,.042)+cover*(c*(.35+.65*h)+float3(.49,.32,.54)*glow*sweep);
}
float3 plotter(float2 uv,float3 base,float t) {
    float y=uv.y*76., row=floor(y), trace=0., hue=0.;
    // One adjacent row can rise into this scanline.
    for(int j=0;j<2;j++){
        float band=row+j, level=luma(picture(float2(uv.x,(band+.5)/76.),base));
        float pen=band+.86-level*1.25+.08*sin(uv.x*32.+t*1.4+band*.18);
        float signal=stroke(y-pen,.13);
        trace=max(trace,signal); hue=max(hue,signal*level);
    }
    float phosphor=.73+.27*cos(t*.68-uv.x*7.);
    return float3(.014,.021,.068)+trace*lerp(cyanLight,pinkLight,saturate(hue*1.8))*phosphor + base*.065;
}
float3 leaded(float2 uv,float3 base,float t) {
    float2 count=float2(48.,27.), grid=uv*count, id=floor(grid), winner=id;
    float first=10.,second=11.;
    for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
        float2 cell=id+float2(x,y);
        float2 jitter=float2(noiseCell(cell),noiseCell(cell+19.));
        float2 site=cell+.5+.29*sin(t*.34+jitter*tau);
        float2 diff=grid-site; float dd=dot(diff,diff);
        if(dd<first){second=first;first=dd;winner=site;} else second=min(second,dd);
    }
    float gap=sqrt(second)-sqrt(first);
    float3 glass=picture(winner/count,base);
    float3 color=glass*.85+.19*float3(.27,.48,.87)*sqrt(saturate(luma(glass)));
    return lerp(float3(.035,.025,.07),color,smoothstep(.014,.085,gap))+.09*stroke(gap-.105,.041);
}
float3 receipt(float2 uv,float3 base,float t) {
    float light=sqrt(saturate(luma(base)));
    float grain=noiseCell(floor(uv*float2(960.,540.)));
    float hatch=frac(uv.x*390.+uv.y*115.);
    float ink=smoothstep(light-.065,light+.065,hatch);
    float3 paper=float3(.96,.85,.71)-.073*grain;
    float head=exp(-abs(uv.y-frac(t*.085))*65.);
    return lerp(paper,float3(.105,.066,.14),ink*.92) -head*float3(.05,.16,.16);
}
float3 contact(float2 uv,float3 base,float t) {
    float column=floor(uv.x*2.), x=frac(uv.x*2.);
    float y=frac(uv.y*2.30+t*.17+.35*column);
    float3 strip=float3(.088,.048,.092);
    float sprocket=step(.23,frac(y*9.))*step(frac(y*9.),.70);
    if(x<.085 || x>.915) return lerp(strip,float3(.91,.78,.62),sprocket*step(.019,min(x,1.-x)));
    float2 frame=(float2(x,y)-float2(.10,.055))/float2(.80,.89);
    if(min(frame.x,frame.y)<0. || max(frame.x,frame.y)>1.) return strip;
    float3 c=picture(frame,base);
    return column<.5 ? c*float3(1.,.89,.72) : (1.-c)*float3(.64,.82,.85);
}
float3 tide(float2 uv,float3 base,float t) {
    float waveA=uv.x*22.+uv.y*7.+t*.85, waveB=uv.y*27.-uv.x*11.-t*.71;
    float2 bend=float2(cos(waveA)+.41*sin(waveB),sin(waveB)+.43*cos(waveA))*.017;
    float3 glass=picture(uv+bend,base);
    glass.r=picture(uv+bend*1.27,base).r;
    float web=pow(saturate(1.-abs(sin(waveA+.64*cos(waveB)))),9.);
    return glass*float3(.86,.98,1.)+float3(.11,.34,.40)*web;
}
float3 highway(float2 uv,float3 base,float t) {
    float horizon=.61;
    float2 sun=(uv-float2(.71+.025*sin(t*.2),.48))*float2(1.77778,1.);
    float disk=1.-smoothstep(.164,.17,length(sun));
    float stripes=smoothstep(.08,.25,frac(uv.y*51.));
    if(uv.y<horizon) return lerp(base,lerp(float3(1.,.56,.16),pinkLight,saturate(uv.y*2.-.45)),disk*stripes*.66);
    float z=max(uv.y-horizon,.008);
    float2 grid=float2((uv.x-.5)/z*2.4, .40/z-t*.60);
    float2 d=abs(frac(grid+.5)-.5);
    float lines=max(stroke(d.x,.04),stroke(d.y,.065))*smoothstep(.012,.06,z);
    float3 road=picture(float2(uv.x,horizon-z*.89),base)*float3(.50,.31,.71);
    return road+lerp(pinkLight,cyanLight,uv.x)*lines*.67;
}
float3 mirrorball(float2 uv,float3 base,float t) {
    float2 center=float2(.54+.085*sin(t*.21),.43+.032*cos(t*.30));
    float2 p=(uv-center)*float2(1.77778,1.)/.29; float r=dot(p,p);
    if(r>=1.)return base*.87;
    float z=sqrt(max(.001,1.-r));
    float2 normalUV=float2(atan2(p.x,z)/tau+t*.055,asin(clamp(p.y,-1.,1.))/3.14159+.5);
    float2 tiles=normalUV*float2(60.,32.),tile=floor(tiles);
    float2 edge=abs(frac(tiles)-.5);
    float seam=smoothstep(.38,.49,max(edge.x,edge.y));
    float2 reflection=frac((tile+.5)/float2(60.,32.)*float2(2.,1.));
    float3 c=picture(reflection,base);
    float glint=pow(saturate(1.-length(p-float2(-.32,-.38))*.98),9.);
    return (c*.87+.13*cyanLight+.65*glint)*(1.-seam*.59)+.20*pow(1.-z,3.);
}
float3 peel(float2 uv,float3 base,float t) {
    float axis=uv.x+.55*uv.y;
    float fold=.99+.31*sin(t*.42);
    float d=axis-fold;
    float3 print=float3(.044,.12,.28)+float3(.36,.59,.68)*sqrt(saturate(luma(picture(float2(1.-uv.x,uv.y),base))));
    if(d>.10)return print*(.69+.31*smoothstep(.10,.19,d));
    if(d<=0.)return base*(1.-.22*exp(d*64.));
    float arc=sin(d/.1*3.14159);
    float3 back=picture(uv-float2(.10,.055)*arc,base);
    return lerp(back,float3(.96,.80,.89),.50+.42*arc)*(.70+.30*arc);
}
float3 cutouts(float2 uv,float3 base,float t) {
    float2 drift=float2(sin(t*.49)*.035,cos(t*.38)*.024);
    float3 rear=picture(uv+drift,base), mid=picture(uv-drift*.6,base), front=picture(uv-drift*1.8,base);
    float m=smoothstep(.095,.14,luma(mid)), f=smoothstep(.30,.38,luma(front));
    float shadow=smoothstep(.23,.34,luma(picture(uv-drift*1.8-float2(.01,.014),base)));
    float3 back=rear*float3(.50,.51,.77);
    back=lerp(back,mid*float3(.83,1.,1.),m)*(1.-.63*shadow);
    return lerp(back,front*float3(1.06,.93,.99),f);
}
float3 silk(float2 uv,float3 base,float t) {
    float2 count=float2(55.,31.);
    float2 warp=float2(sin(uv.y*11.+t*.69),cos(uv.x*12.-t*.47))*.012;
    float2 g=(uv+warp)*count, id=floor(g), st=frac(g);
    float flip=step(1.,st.x+st.y);
    float2 center=(id+lerp(.333,.667,flip))/count-warp;
    float3 cloth=picture(center,base);
    float normal=sin(id.x*.22+id.y*.38+t*.79+flip*.79);
    return cloth*(.76+.28*normal)+float3(.21,.13,.25)*saturate(normal)*(.24+.76*luma(cloth));
}
float3 topo(float2 uv,float3 base,float t) {
    float level=sqrt(saturate(luma(base)));
    float relief=level+.052*sin(uv.x*15.+t*.44)*cos(uv.y*12.-t*.36);
    float d=abs(frac(relief*13.-t*.22+.5)-.5);
    float3 ink=lerp(cyanLight,pinkLight,smoothstep(.17,.74,level));
    return base*.23+float3(.023,.014,.085)+ink*(.16*level+.82*stroke(d,.14));
}
float3 pinball(float2 uv,float3 base,float t) {
    float2 aspect=float2(1.77778,1.); float3 col=base*.77;
    for(int i=0;i<3;i++){
        float k=float(i);
        float2 center=float2(.5+.34*sin(t*(.23+.025*k)+k*2.34),.5+.29*cos(t*(.37-.035*k)+k*1.86));
        float radius=.105+.027*k;
        float2 p=(uv-center)*aspect/radius;
        float rr=dot(p,p);
        if(rr<1.){
            float z=sqrt(max(.001,1.-rr));
            float3 lens=picture(center-p*radius/(aspect*(.55+z)),base);
            float glint=exp(-dot(p+float2(.34,.43),p+float2(.34,.43))*32.);
            col=lens*(.82+.18*z) + lerp(cyanLight,pinkLight,k*.5)*pow(1.-z,2.) + glint*.9;
        }else col*=1.-.28*exp(-abs(rr-1.)*5.);
    }
    return col;
}
float3 gate(float2 uv,float3 base,float t) {
    float2 center=float2(.50+.05*sin(t*.16),.46);
    float2 p=uv-center; float r=length(p*float2(1.77778,1.));
    float3 flare=0.;
    for(int i=1;i<=6;i++){
        float k=float(i)/6.;
        float3 echo=picture(center+p*(1.-k*(.28+.10*sin(t*.65))),base);
        flare=max(flare,echo*smoothstep(.09,.66,luma(echo))*(1.-k*.50));
    }
    float depth=log2(max(r,.024))*2.5-t*.52;
    float ring=stroke(frac(depth+.5)-.5,.055)*smoothstep(.10,.47,r);
    return base*.72+flare*smoothstep(.01,.52,r)+cyanLight*ring*.23;
}
float3 glyphs(float2 uv,float3 base,float t) {
    float2 count=float2(128.,54.), id=floor(uv*count), st=frac(uv*count);
    float3 c=picture((id+.5)/count,base); float brightness=sqrt(saturate(luma(c)));
    float seed=noiseCell(id), column=noiseCell(float2(id.x,43.));
    float phase=frac(id.y/33.-t*(.07+.04*column)+column);
    float head=exp(-phase*9.);
    float2 dotID=floor(st*float2(4.,6.));
    float bit=noiseCell(dotID+float2(floor(brightness*9.)*7.,floor(seed*5.)));
    float ink=step(bit,.22+.57*brightness)*step(st.x,.79)*step(st.y,.80);
    float3 phosphor=lerp(cyanLight,pinkLight,column*.83);
    return float3(.015,.012,.052)+ink*(c*.61+phosphor*(.13+brightness*.65+head*.61));
}
float4 mainImage(VertData v_in) : TARGET {
    float2 uv=v_in.uv;
    float4 source=image.Sample(textureSampler,uv);
    if(Amount<=0. || source.a<=.001)return source;
    float t=elapsed_time*Speed; float3 c=source.rgb;
    if (Mode == 0) c=prism(uv,source.rgb,t);
    else if (Mode == 1) c=elevator(uv,source.rgb,t);
    else if (Mode == 2) c=lenticular(uv,source.rgb,t);
    else if (Mode == 3) c=blackHole(uv,source.rgb,t);
    else if (Mode == 4) c=pleats(uv,source.rgb,t);
    else if (Mode == 5) c=pins(uv,source.rgb,t);
    else if (Mode == 6) c=plotter(uv,source.rgb,t);
    else if (Mode == 7) c=leaded(uv,source.rgb,t);
    else if (Mode == 8) c=receipt(uv,source.rgb,t);
    else if (Mode == 9) c=contact(uv,source.rgb,t);
    else if (Mode == 10) c=tide(uv,source.rgb,t);
    else if (Mode == 11) c=highway(uv,source.rgb,t);
    else if (Mode == 12) c=mirrorball(uv,source.rgb,t);
    else if (Mode == 13) c=peel(uv,source.rgb,t);
    else if (Mode == 14) c=cutouts(uv,source.rgb,t);
    else if (Mode == 15) c=silk(uv,source.rgb,t);
    else if (Mode == 16) c=topo(uv,source.rgb,t);
    else if (Mode == 17) c=pinball(uv,source.rgb,t);
    else if (Mode == 18) c=gate(uv,source.rgb,t);
    else c=glyphs(uv,source.rgb,t);
    return float4(lerp(source.rgb,saturate(c),Amount*.01),source.a);
}
