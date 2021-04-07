import { View } from "View"
//import * as OBJ from "webgl-obj-loader"
import { mat4 } from "gl-matrix"
import { Material } from "%COMMON/Material"
import { RTView } from "./RTView"
import { Scenegraph } from "./Scenegraph";
import { VertexPNT, VertexPNTProducer } from "./VertexPNT";
import { ScenegraphJSONImporter } from "./ScenegraphJSONImporter"
import { Scene } from "./RayTracing"

export interface Features {
}
export class Controller implements Features {
    private view: View;
    public raytracerView: RTView;

    constructor(view: View, raytracerView: RTView) {
        this.view = view;
        this.raytracerView = raytracerView;
        this.view.setFeatures(this);
    }

    public initScenegraph(): Promise<void> {

        let simpleScene = new Scene;
    
        return new Promise<void>((resolve) => {
          ScenegraphJSONImporter.importJSON(new VertexPNTProducer(), simpleScene.createSphere())
            .then((s: Scenegraph<VertexPNT>) => {
              this.raytracerView.scenegraph = s;
              this.view.scenegraph = s;
              resolve();
            });
        });
      }

    public go(): void {
        this.initScenegraph()
            .then(() => {
                let numLights: number = this.view.getNumLights();

                console.log("view_Scenegraph: " + this.view.scenegraph);
                console.log(this.raytracerView.scenegraph);

                if(numLights==0)
                    numLights = 2;

                this.view.initShaders(this.getPhongVShader(), this.getPhongFShader(numLights));
                this.view.initRenderer();
                this.view.draw();
                //this.raytracerView.scenegraph = this.view.scenegraph;
            });
    }

    public getPhongVShader(): string {
        return `
        attribute vec4 vPosition;
        attribute vec4 vNormal;
        attribute vec2 vTexCoord;
        
        uniform mat4 projection;
        uniform mat4 modelview;
        uniform mat4 normalmatrix;
        uniform mat4 texturematrix;
        varying vec3 fNormal;
        varying vec4 fPosition;
        varying vec4 fTexCoord;
        
        void main()
        {
            vec3 lightVec,viewVec,reflectVec;
            vec3 normalView;
            vec3 ambient,diffuse,specular;
        
            fPosition = modelview * vPosition;
            gl_Position = projection * fPosition;
        
        
            vec4 tNormal = normalmatrix * vNormal;
            fNormal = normalize(tNormal.xyz);
            fTexCoord = texturematrix * vec4(vTexCoord.s,vTexCoord.t,0,1);
        }
        
    `;
    }

    public getPhongFShader(numLights: number): string {
        return `precision mediump float;

        struct MaterialProperties
        {
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
            float shininess;
        };
        
        struct LightProperties
        {
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
            vec4 position;
            vec4 spotDirection;
            float spotCutoff;
        };
        
        
        varying vec3 fNormal;
        varying vec4 fPosition;
        varying vec4 fTexCoord;

        /* texture */
        uniform sampler2D image;
        
        
        
        uniform MaterialProperties material;
        uniform LightProperties light[`+ numLights + `];
        
        
        void main()
        {
            vec3 lightVec,viewVec,reflectVec;
            vec3 normalView;
            vec3 ambient,diffuse,specular;
            float nDotL,rDotV;
            vec4 result;
            vec4 result_dummy;
        
            result = vec4(0,0,0,1);
        `
            + `for (int i=0;i<` + numLights + `;i++)
            {
                if (light[i].position.w!=0.0)
                    lightVec = normalize(light[i].position.xyz - fPosition.xyz);
                else
                    lightVec = normalize(-light[i].position.xyz);
        
                vec3 tNormal = fNormal;
                normalView = normalize(tNormal.xyz);
                nDotL = dot(normalView,lightVec);
        
                viewVec = -fPosition.xyz;
                viewVec = normalize(viewVec);
        
                reflectVec = reflect(-lightVec,normalView);
                reflectVec = normalize(reflectVec);
        
                rDotV = max(dot(reflectVec,viewVec),0.0);
        
                vec3 spotDirection = normalize(light[i].spotDirection.xyz);
                
                if (dot(spotDirection,-lightVec)>light[i].spotCutoff) {
                    ambient = material.ambient * light[i].ambient;
                    diffuse = material.diffuse * light[i].diffuse * max(nDotL,0.0);
                    if (nDotL>0.0)
                        specular = material.specular * light[i].specular * pow(rDotV,material.shininess);
                    else
                        specular = vec3(0,0,0);
                    result = result + vec4(ambient+diffuse+specular,1.0);  
                }  
            }
            result_dummy = result_dummy * texture2D(image,fTexCoord.st);
            gl_FragColor = result;
        }
        
    `;
    }



}