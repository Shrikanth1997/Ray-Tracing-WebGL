define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Material = void 0;
    /**
     * This class represents material. Material is represented using (a) ambient (b)
     * diffuse (c) specular (d) emission (for materials that emit light themselves)
     * It also has coefficients for shininess, absorption, reflection (for
     * reflective material), transparency (for transparent material) and refractive
     * index (for transparent material). For the latter ones, the user must make
     * sure that absorption + reflection + transparency = 1
     */
    class Material {
        constructor() {
            this.emission = gl_matrix_1.vec3.create();
            this.ambient = gl_matrix_1.vec3.create();
            this.diffuse = gl_matrix_1.vec3.create();
            this.specular = gl_matrix_1.vec3.create();
            this.init();
        }
        Material(mat) {
            this.emission = gl_matrix_1.vec3.clone(mat.getEmission());
            this.ambient = gl_matrix_1.vec3.clone(mat.getAmbient());
            this.diffuse = gl_matrix_1.vec3.clone(mat.getDiffuse());
            this.specular = gl_matrix_1.vec3.clone(mat.getSpecular());
            this.setShininess(mat.getShininess());
            this.setAbsorption(mat.getAbsorption());
            this.setReflection(mat.getReflection());
            this.setTransparency(mat.getTransparency());
            this.setRefractiveIndex(mat.getRefractiveIndex());
        }
        init() {
            this.setEmission([0.0, 0.0, 0.0]);
            this.setAmbient([0.0, 0.0, 0.0]);
            this.setDiffuse([0.0, 0.0, 0.0]);
            this.setSpecular([0.0, 0.0, 0.0]);
            this.setShininess(0.0);
            this.setAbsorption(1);
            this.setReflection(0);
            this.setTransparency(0);
        }
        setEmission(emission) {
            this.emission = gl_matrix_1.vec3.fromValues(emission[0], emission[1], emission[2]);
        }
        setAmbient(ambient) {
            this.ambient = gl_matrix_1.vec3.fromValues(ambient[0], ambient[1], ambient[2]);
        }
        setDiffuse(diffuse) {
            this.diffuse = gl_matrix_1.vec3.fromValues(diffuse[0], diffuse[1], diffuse[2]);
        }
        setSpecular(specular) {
            this.specular = gl_matrix_1.vec3.fromValues(specular[0], specular[1], specular[2]);
        }
        setShininess(r) {
            this.shininess = r;
        }
        setAbsorption(a) {
            this.absorption = a;
        }
        setReflection(r) {
            this.reflection = r;
        }
        setTransparency(t) {
            this.transparency = t;
            this.ambient[3] = this.diffuse[3] = this.specular[3] = this.emission[3] = 1 - t;
        }
        setRefractiveIndex(r) {
            this.refractive_index = r;
        }
        getEmission() {
            return gl_matrix_1.vec3.fromValues(this.emission[0], this.emission[1], this.emission[2]);
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
        getShininess() {
            return this.shininess;
        }
        getAbsorption() {
            return this.absorption;
        }
        getReflection() {
            return this.reflection;
        }
        getTransparency() {
            return this.transparency;
        }
        getRefractiveIndex() {
            return this.refractive_index;
        }
    }
    exports.Material = Material;
});
//# sourceMappingURL=Material.js.map