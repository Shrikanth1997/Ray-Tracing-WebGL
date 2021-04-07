import { vec3, mat4, vec4, glMatrix } from "gl-matrix";
import { Stack } from "%COMMON/Stack"
import * as WebGLUtils from "%COMMON/WebGLUtils";
import { Light } from "%COMMON/Light"
import { Material } from "%COMMON/Material";
import { TextureObject } from "%COMMON/TextureObject";
import { ShaderLocationsVault } from "%COMMON/ShaderLocationsVault";

export class Ray3D{

    // Starting point
    public position: vec4;

    //Vector direction of the ray
    public direction: vec4;

    constructor(position: vec4, direction: vec4){
        this.position = position;
        this.direction = direction;
    }

}

export class HitRecord{

    public hitTime: number;
    public intersection: vec3;
    public normalHit: vec3;
    public material: Material;
    public tex: TextureObject;

    constructor(hitTime: number, intersection: vec3, normalHit: vec3, material: Material, tex: TextureObject){
        this.hitTime = hitTime;
        this.intersection = intersection;
        this.normalHit = normalHit;
        this.material = material;
        this.tex = tex;   
    }

}

export class RayTraceScene{

    public rayTrace(W: number, H: number, modelview: Stack<mat4>): void{

        for(let x: number =0;x<=W/2;x=x+1){
            for(let y: number=0;y<=H/2;y=y+1){
                let Sv: vec4 = [0,0,0,1];
                let V: vec4 = [x-W/2, y-H/2, (-H/2)/Math.tan(glMatrix.toRadian(30)),1];
                let ray: Ray3D = new Ray3D(Sv, V);

                let color: vec4 = rayCast(ray, modelview);

            }
        }

    }

    public rayCast(ray: Ray3D, modelview: Stack<mat4>): vec4{
        let ifHit: boolean;
        let rayHit: HitRecord;
        [ifHit, rayHit] = intersect(ray, modelview);

        if(!ifHit)
            return [0,0,0,1]; // Black Color
        else{
            //return shadeColor(rayHit, modelview);
            return [1,1,1,1]; // White Color
        }
    }

    
    public shadeColor(rayHit: HitRecord, modelview: Stack<mat4>, light: Light, normal:vec3 ): vec4 {

        
        /*struct LightProperties
        {
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
            vec4 position;
            vec4 spotDirection;
            float spotCutoff;
        };*/
        
        // Pass in these values
        let fNormal:vec3 ;
        let fPosition:vec3 ;
        let fTexCoord:vec3 ;

        /* texture */
        //uniform sampler2D image;
        
        
        
        //uniform MaterialProperties material;
        //uniform LightProperties light[`+ numLights + `];
        
        
        
        let lightVec:vec3,viewVec:vec3,reflectVec:vec3;
        let normalView:vec3;
        let ambient:vec3,diffuse:vec3,specular:vec3;
        let nDotL: number,rDotV: number;
        
        
        
        let result: vec4 = [0,0,0,1];
        
        for (let i=0;i<numLights;i++)
        {
                if (light[i].position.w!=0.0)
                    vec3.normalize(lightVec, light[i].position.xyz - fPosition.xyz);
                else
                    vec3.normalize(lightVec,-light[i].position.xyz);
        
                let tNormal: vec3 = fNormal;
                normalView = vec3.normalize(normalView, [tNormal[0],tNormal[1],tNormal[2]]);
                nDotL = vec3.dot(normalView,lightVec);

        
                viewVec = -fPosition.xyz;
                viewVec = vec3.normalize(viewVec,viewVec);
        
                // Should be calculated like this
                // I - 2.0 * dot(N, I) * N 
                reflectVec = vec3.reflect(-lightVec,normalView);
                reflectVec = vec3.normalize(reflectVec, reflectVec);
        
                rDotV = Math.max(vec3.dot(reflectVec,viewVec),0.0);
        
                let spotDirection: vec3 = vec3.normalize(spotDirection, light[i].spotDirection.xyz);
                
            

                if (vec3.dot(spotDirection,vec3.negate(lightVec,lightVec))>light[i].spotCutoff) {
                    
                    ambient = vec3.multiply(ambient, rayHit.material.getAmbient(),light[i].ambient);
                    diffuse = vec3.multiply(diffuse, rayHit.material.getDiffuse(), vec3.mul(vec3.create(), light[i].diffuse,[Math.max(nDotL,0.0),Math.max(nDotL,0.0),Math.max(nDotL,0.0)]));
                    if (nDotL>0.0)
                        specular = vec3.multiply(specular, rayHit.material.getSpecular(), vec3.mul(vec3.create(), light[i].specular , [Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess())]));
                    else
                        specular = [0,0,0];


                    let final: vec3 = [0,0,0];
                    final = vec3.add(final, final, specular);
                    final = vec3.add(final, final, diffuse);
                    final = vec3.add(final, final, ambient);
                    result = vec4.add(result, result,   [final[0], final[1], final[2], 1.0]);  
                }  
            }
           
        
            return result;
        
        }


    
    


    public createSmallScene(): string{

        return `
        {
        "instances": [
            {
            "name": "sphere",
            "path": "models/sphere.obj"
            },
            {
            "name": "box",
            "path": "models/box.obj"
            },
            {
            "name": "cylinder",
            "path": "models/cylinder.obj"
            },
            {
            "name": "cone",
            "path": "models/cone.obj"
            }
        ],
        "images": [
            {
            "name": "white",
            "path": "textures/white.png"
            }
        ],
        "root": {
            "type": "group",
            "name": "Root of scene graph",
            "lights": [
              {
                "ambient": [
                  0.8,
                  0.8,
                  0.8
                ],
                "diffuse": [
                  0.8,
                  0.8,
                  0.8
                ],
                "specular": [
                  0.8,
                  0.8,
                  0.8
                ],
                "position": [
                  0.0,
                  100.0,
                  0.0,
                  1.0
                ],
                "spotdirection": [
                  0.0,
                  -1.0,
                  0.0,
                  0.0
                ],
                "spotcutoff": 25.0
              }
            ],

            "children": [
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              -10.0,
                              5.0,
                              -25.0
                            ]
                        },
                        {
                            "scale": [
                                30.0,
                                30.0,
                                30.0
                            ]
                        },
                        {
                            "rotate": [
                                30.0,
                                0.0,
                                1.0,
                                0.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.2,
                                0.2,
                                0.2,
                                1.0
                            ],
                            "diffuse": [
                                0.8,
                                0.8,
                                0.8,
                                1.0
                            ],
                            "specular": [
                                0.8,
                                0.8,
                                0.8,
                                1.0
                            ],
                            "emission": [
                                0.0,
                                0.0,
                                0.0,
                                1.0
                            ],
                        "shininess": 100.0,
                        "absorption": 1.0,
                        "reflection": 0.0,
                        "transparency": 0.0,
                        "refractive_index": 0.0
                        }
                    }
                },
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              10.0,
                              5.0,
                              10.0
                            ]
                        },
                        {
                            "scale": [
                                20.0,
                                20.0,
                                20.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.4,
                                0.2,
                                0.6,
                                1.0
                            ],
                            "diffuse": [
                                0.8,
                                0.8,
                                0.8,
                                1.0
                            ],
                            "specular": [
                                0.8,
                                0.8,
                                0.8,
                                1.0
                            ],
                            "emission": [
                                0.0,
                                0.0,
                                0.0,
                                1.0
                            ],
                        "shininess": 100.0,
                        "absorption": 1.0,
                        "reflection": 0.0,
                        "transparency": 0.0,
                        "refractive_index": 0.0
                        }
                    }
                }
            ]
        }
    }


    `;

    }


}