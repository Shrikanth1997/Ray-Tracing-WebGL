define(["require", "exports", "%COMMON/RenderableMesh", "gl-matrix", "%COMMON/TextureObject"], function (require, exports, RenderableMesh_1, gl_matrix_1, TextureObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScenegraphRenderer = void 0;
    /**
     * This is a scene graph renderer implementation that works specifically with WebGL.
     * @author Amit Shesh
     */
    class ScenegraphRenderer {
        constructor(gl, shaderLocations, shaderVarsToAttribs) {
            this.gl = gl;
            this.shaderLocations = shaderLocations;
            this.shaderVarsToVertexAttribs = shaderVarsToAttribs;
            this.meshRenderers = new Map();
            this.textures = new Map();
        }
        /**
         * Add a mesh to be drawn later.
         * The rendering context should be set before calling this function, as this function needs it
         * This function creates a new
         * {@link RenderableMesh} object for this mesh
         * @param name the name by which this mesh is referred to by the scene graph
         * @param mesh the {@link PolygonMesh} object that represents this mesh
         * @throws Exception
         */
        addMesh(meshName, mesh) {
            if (meshName in this.meshRenderers)
                return;
            //verify that the mesh has all the vertex attributes as specified in the map
            if (mesh.getVertexCount() <= 0)
                return;
            let vertexData = mesh.getVertexAttributes()[0];
            for (let [s, a] of this.shaderVarsToVertexAttribs) {
                if (!vertexData.hasData(a))
                    throw new Error("Mesh does not have vertex attribute " + a);
            }
            let renderableMesh = new RenderableMesh_1.RenderableMesh(this.gl, meshName);
            renderableMesh.initMeshForRendering(this.shaderVarsToVertexAttribs, mesh);
            this.meshRenderers.set(meshName, renderableMesh);
        }
        addTexture(name, path) {
            let image;
            let imageFormat = path.substring(path.indexOf('.') + 1);
            image = new TextureObject_1.TextureObject(this.gl, name, path);
            this.textures.set(name, image);
        }
        /**
         * Begin rendering of the scene graph from the root
         * @param root
         * @param modelView
         */
        draw(root, modelView) {
            let lights = root.getLights(modelView);
            this.sendLightsToShader(lights);
            root.draw(this, modelView);
        }
        intersect(root, ray, modelView, isHit) {
            isHit = root.intersect(this, ray, modelView, isHit);
            return isHit;
        }
        hit_sphere(center, radius, r) {
            let oc = center;
            let a = gl_matrix_1.vec4.dot(r.direction, r.direction);
            let b = 2.0 * gl_matrix_1.vec4.dot(oc, r.direction);
            let c = gl_matrix_1.vec4.dot(oc, oc) - radius * radius;
            let discriminant = b * b - 4 * a * c;
            if (discriminant < 0) {
                return -1.0;
            }
            else {
                return (-b - Math.sqrt(discriminant)) / (2.0 * a);
            }
        }
        intersectNode(meshName, ray, transformation, isHit, info) {
            if (this.meshRenderers.has(meshName)) {
                console.log("intersecting node name: " + this.meshRenderers.get(meshName).getName());
                let objectType = this.meshRenderers.get(meshName).getName();
                if (objectType == "sphere") {
                    console.log("QAUDRATIC: " + this.hit_sphere([info.center[0], info.center[1], info.center[2], 1], info.radius, ray));
                }
                isHit = true;
            }
            return isHit;
        }
        sendLightsToShader(lights) {
            //send all the light colors
            for (let i = 0; i < lights.length; i++) {
                let ambientLocation = "light[" + i + "].ambient";
                let diffuseLocation = "light[" + i + "].diffuse";
                let specularLocation = "light[" + i + "].specular";
                let positionLocation = "light[" + i + "].position";
                let spotDirectionLocation = "light[" + i + "].spotDirection";
                let spotCutoffLocation = "light[" + i + "].spotCutoff";
                this.gl.uniform3fv(this.shaderLocations.getUniformLocation(ambientLocation), lights[i].getAmbient());
                this.gl.uniform3fv(this.shaderLocations.getUniformLocation(diffuseLocation), lights[i].getDiffuse());
                this.gl.uniform3fv(this.shaderLocations.getUniformLocation(specularLocation), lights[i].getSpecular());
                this.gl.uniform4fv(this.shaderLocations.getUniformLocation(positionLocation), lights[i].getPosition());
                this.gl.uniform4fv(this.shaderLocations.getUniformLocation(spotDirectionLocation), lights[i].getSpotDirection());
                //console.log("spot angle: " + lights[i].getSpotCutoff());
                this.gl.uniform1f(this.shaderLocations.getUniformLocation(spotCutoffLocation), Math.cos(gl_matrix_1.glMatrix.toRadian(lights[i].getSpotCutoff())));
            }
        }
        dispose() {
            for (let mesh of this.meshRenderers.values()) {
                mesh.cleanup();
            }
        }
        /**
         * Draws a specific mesh.
         * If the mesh has been added to this renderer, it delegates to its correspond mesh renderer
         * This function first passes the material to the shader. Currently it uses the shader variable
         * "vColor" and passes it the ambient part of the material. When lighting is enabled, this
         * method must be overriden to set the ambient, diffuse, specular, shininess etc. values to the
         * shader
         * @param name
         * @param material
         * @param transformation
         */
        drawMesh(meshName, material, textureName, transformation) {
            if (this.meshRenderers.has(meshName)) {
                //get the color
                let loc = this.shaderLocations.getUniformLocation("material.ambient");
                this.gl.uniform3fv(loc, material.getAmbient());
                loc = this.shaderLocations.getUniformLocation("material.diffuse");
                this.gl.uniform3fv(loc, material.getDiffuse());
                loc = this.shaderLocations.getUniformLocation("material.specular");
                this.gl.uniform3fv(loc, material.getSpecular());
                loc = this.shaderLocations.getUniformLocation("material.shininess");
                this.gl.uniform1f(loc, material.getShininess());
                loc = this.shaderLocations.getUniformLocation("modelview");
                this.gl.uniformMatrix4fv(loc, false, transformation);
                let normalMatrix = gl_matrix_1.mat4.create();
                gl_matrix_1.mat4.invert(normalMatrix, transformation);
                gl_matrix_1.mat4.transpose(normalMatrix, normalMatrix);
                loc = this.shaderLocations.getUniformLocation("normalmatrix");
                this.gl.uniformMatrix4fv(loc, false, normalMatrix);
                //matrix to flip the texture vertically
                let flipTextureMatrix = gl_matrix_1.mat4.create();
                gl_matrix_1.mat4.translate(flipTextureMatrix, flipTextureMatrix, [0, 1, 0]);
                gl_matrix_1.mat4.scale(flipTextureMatrix, flipTextureMatrix, [1, -1, 1]);
                loc = this.shaderLocations.getUniformLocation("texturematrix");
                this.gl.uniformMatrix4fv(loc, false, flipTextureMatrix);
                this.gl.activeTexture(this.gl.TEXTURE0);
                loc = this.shaderLocations.getUniformLocation("image");
                this.gl.uniform1i(loc, 0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.get(textureName).getTextureID());
                //set parameters for texture filtering
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                // Prevents s-coordinate wrapping (repeating).
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                // Prevents t-coordinate wrapping (repeating).
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.meshRenderers.get(meshName).draw(this.shaderLocations);
            }
        }
    }
    exports.ScenegraphRenderer = ScenegraphRenderer;
});
//# sourceMappingURL=ScenegraphRenderer.js.map