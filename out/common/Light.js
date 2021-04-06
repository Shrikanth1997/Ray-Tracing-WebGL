define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Light = void 0;
    /**
     * This class represents a single light source. The light source has various
     * properties: position (location or direction), colors (ambient, diffuse,
     * specular) direction in which it is pointing (if a spotlight), angle of the
     * cone (if a spotlight)
     */
    class Light {
        constructor() {
            this.ambient = gl_matrix_1.vec3.fromValues(0, 0, 0);
            this.diffuse = gl_matrix_1.vec3.fromValues(0, 0, 0);
            this.specular = gl_matrix_1.vec3.fromValues(0, 0, 0);
            this.position = gl_matrix_1.vec4.fromValues(0, 0, 0, 1);
            this.spotDirection = gl_matrix_1.vec4.fromValues(0, 0, 0, 0);
            this.spotCutoff = 0.0;
            this.isSpot = false;
        }
        setAmbient(ambient) {
            this.ambient = gl_matrix_1.vec3.fromValues(ambient[0], ambient[1], ambient[2]);
        }
        setDirection(dir) {
            this.position = gl_matrix_1.vec4.fromValues(dir[0], dir[1], dir[2], 0.0);
        }
        setSpotDirection(sDir) {
            this.spotDirection = gl_matrix_1.vec4.fromValues(sDir[0], sDir[1], sDir[2], 0);
        }
        setDiffuse(diff) {
            this.diffuse = gl_matrix_1.vec3.fromValues(diff[0], diff[1], diff[2]);
        }
        setSpecular(spec) {
            this.specular = gl_matrix_1.vec3.fromValues(spec[0], spec[1], spec[2]);
        }
        setSpotAngle(angle) {
            this.spotCutoff = angle;
        }
        setPosition(pos) {
            this.position = gl_matrix_1.vec4.fromValues(pos[0], pos[1], pos[2], 1);
        }
        getAmbient() {
            return gl_matrix_1.vec3.fromValues(this.ambient[0], this.ambient[1], this.ambient[2]);
        }
        getDiffuse() {
            return gl_matrix_1.vec3.fromValues(this.diffuse[0], this.diffuse[1], this.diffuse[2]);
        }
        getSpecular() {
            return gl_matrix_1.vec3.fromValues(this.specular[0], this.specular[1], this.specular[2]);
        }
        getPosition() {
            return gl_matrix_1.vec4.fromValues(this.position[0], this.position[1], this.position[2], this.position[3]);
        }
        getSpotDirection() {
            return gl_matrix_1.vec4.fromValues(this.spotDirection[0], this.spotDirection[1], this.spotDirection[2], this.spotDirection[3]);
        }
        getSpotCutoff() {
            return this.spotCutoff;
        }
        clone() {
            let L = new Light();
            L.ambient = this.ambient;
            L.diffuse = this.diffuse;
            L.specular = this.specular;
            L.spotCutoff = this.spotCutoff;
            L.spotDirection = this.spotDirection;
            L.isSpot = this.isSpot;
            L.position = this.position;
            return L;
        }
    }
    exports.Light = Light;
});
//# sourceMappingURL=Light.js.map