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

    public intersection: vec4;
    public normalHit: vec4;
    public material: Material;
    public tex: TextureObject;

    constructor(intersection: vec4, normalHit: vec4, material?: Material, tex?: TextureObject){
        
        this.intersection = intersection;
        this.normalHit = normalHit;
        this.material = material;
        this.tex = tex;
        
    }
}

export class Scene{


    public createSphere(): string{

        return `
        {
        "scaleinstances": "false",
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
                  500.0,
                  500.0,
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
                              10.0,
                              0.0,
                              0.0
                            ]
                        },
                        {
                            "scale": [
                                10.0,
                                10.0,
                                10.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
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