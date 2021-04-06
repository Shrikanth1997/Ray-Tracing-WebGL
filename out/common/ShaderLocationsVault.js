define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShaderLocationsVault = void 0;
    /**
     * This class stores all the shader variables that are used by a shader program. This makes it
     * possible to look up shader locations without having to repeatedly use webgl functions
     */
    class ShaderLocationsVault {
        constructor(gl, program) {
            this.attribs = new Map();
            this.uniforms = new Map();
            this.getAllShaderVariables(gl, program);
        }
        getAllShaderVariables(gl, program) {
            let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < numUniforms; i++) {
                let uniformInfo = gl.getActiveUniform(program, i);
                let location = gl.getUniformLocation(program, uniformInfo.name);
                this.addUniformLocation(uniformInfo.name, location);
            }
            let numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < numAttribs; i++) {
                let activeInfo = gl.getActiveAttrib(program, i);
                let location = gl.getAttribLocation(program, activeInfo.name);
                this.addAttribLocation(activeInfo.name, location);
            }
        }
        /**
         * Add a new shader variable and location
         */
        addAttribLocation(varName, location) {
            this.attribs.set(varName, location);
        }
        addUniformLocation(varName, location) {
            this.uniforms.set(varName, location);
        }
        /**
         * Return the location of an attrib, else return -1
         *
         * @param varName the shader variable name whose location is being sought
         * @return the location if found, else -1
         */
        getAttribLocation(varName) {
            if (this.attribs.has(varName)) {
                return this.attribs.get(varName);
            }
            return -1;
        }
        /**
         * Return the location of an attrib, else return -1
         *
         * @param varName the shader variable name whose location is being sought
         * @return the location if found, else -1
         */
        getUniformLocation(varName) {
            if (this.uniforms.has(varName)) {
                return this.uniforms.get(varName);
            }
            return -1;
        }
    }
    exports.ShaderLocationsVault = ShaderLocationsVault;
});
//# sourceMappingURL=ShaderLocationsVault.js.map