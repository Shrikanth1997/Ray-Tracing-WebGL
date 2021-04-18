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
    public rayT: number;
    public material: Material;
    public tex: TextureObject;

    constructor(rayT: number, intersection: vec4, normalHit: vec4, material?: Material, tex?: TextureObject){
        
        this.rayT = rayT;
        this.intersection = intersection;
        this.normalHit = normalHit;
        this.material = material;
        this.tex = tex;
        
    }
}

export class Bounds{
    public min: vec3;
    public max: vec3;

    constructor(min: vec3, max: vec3)
    {
        this.min = min;
        this.max = max;
    }

    public expand(min: vec3, max: vec3): void
    {
        this.min = vec3.min(this.min, this.min, min);
        this.max = vec3.max(this.max, this.max ,max);
    }

    public intersect(ray: Ray3D): boolean
    {
        let position: vec3 = vec3.create();
        position = [ray.position[0], ray.position[1], ray.position[2]];
        let dir: vec3 = vec3.create();
        dir = [ray.direction[0], ray.direction[1], ray.direction[2]];
        let tMin: vec3 = vec3.divide(vec3.create(), vec3.subtract(vec3.create(), this.min, position), dir);
        let tMax: vec3 = vec3.divide(vec3.create(), vec3.subtract(vec3.create(), this.max, position),dir);

        let t1: vec3 = vec3.min(vec3.create(), tMin, tMax);
        let t2: vec3 = vec3.max(vec3.create(),tMin, tMax);

        let tNear: number = Math.max(Math.max(t1[0], t1[1]), t1[2]);
        let tFar: number = Math.min(Math.min(t2[0], t2[1]), t2[2]);

        if(tNear > tFar)
            return false;

        return true;
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
                "spotcutoff": 60
              }
            ],
            "children": [
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              10.0,
                              -10.0,
                              -10.0
                            ]
                        },
                        {
                            "scale": [
                                5.0,
                                5.0,
                                5.0
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


    public createScene(): string{

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
                "spotcutoff": 60
              },

              {
                "ambient": [
                  0.2,
                  0.2,
                  0.2
                ],
                "diffuse": [
                  0.2,
                  0.2,
                  0.2
                ],
                "specular": [
                  0.5,
                  0.5,
                  0.5
                ],
                "position": [
                  100.0,
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
                  "spotcutoff": 60
              }

            ],
            "children": [
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              0.0,
                              0.0,
                              30.0
                            ]
                        },
                        {
                            "scale": [
                                15.0,
                                15.0,
                                15.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
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
                },
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              0.0,
                              -40.0,
                              15.0
                            ]
                        },
                        {
                            "scale": [
                                50,
                                40,
                                40
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.8,
                                0.2,
                                0.3,
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
                              -15,
                              10.0
                            ]
                        },
                        {
                            "scale": [
                                3,
                                3,
                                3
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.2,
                                0.8,
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
                              7.5,
                              7.5,
                              -15.0
                            ]
                        },
                        {
                            "scale": [
                                5,
                                5,
                                5
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.7,
                                0.7,
                                0.7,
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


    

    public createSphere_2(): string{

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
                "spotcutoff": 60
              }
            ],
            "children": [
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              0.0,
                              0.0,
                              30.0
                            ]
                        },
                        {
                            "scale": [
                                15.0,
                                15.0,
                                15.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
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
                },
                {
                    "type": "transform",
                    "transform": [
                        {
                            "translate": [
                              0.0,
                              -40.0,
                              15.0
                            ]
                        },
                        {
                            "scale": [
                                50,
                                40,
                                40
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.8,
                                0.2,
                                0.3,
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
                              -10.0,
                              -10.0,
                              -10.0
                            ]
                        },
                        {
                            "scale": [
                                5.0,
                                5.0,
                                5.0
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
                        "material": {
                            "ambient": [
                                0.1,
                                0.8,
                                0.8,
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
                              -10.0,
                              -5,
                              10.0
                            ]
                        },
                        {
                            "scale": [
                                10,
                                10,
                                10
                            ]
                        },
                        {
                            "rotate": [
                                -10,
                                1.0,
                                0.0,
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
                                0.8,
                                0.8,
                                0.3,
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
                              -15,
                              10.0
                            ]
                        },
                        {
                            "scale": [
                                3,
                                3,
                                3
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "sphere",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.2,
                                0.8,
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
                              7.5,
                              7.5,
                              -15.0
                            ]
                        },
                        {
                            "scale": [
                                5,
                                5,
                                5
                            ]
                        }
                    ],
                    "child": {
                        "type": "object",
                        "instanceof": "box",
                        "texture" : "white",
                        "material": {
                            "ambient": [
                                0.7,
                                0.7,
                                0.7,
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

    public createBox(): string{

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