import { mat4 } from "gl-matrix";

import { loadShader, createWebGLProgram, loadTexture } from "../shaders";

class Program {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    vertexNormal: number;
    textureCoord: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation;
    modelViewMatrix: WebGLUniformLocation;
    normalMatrix: WebGLUniformLocation;
    uSampler: WebGLUniformLocation;
  };
  cubeRotation = 0;
  constructor(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
    const shaderProgram = createWebGLProgram(gl, vsSource, fsSource);

    this.gl = gl;
    this.program = shaderProgram;

    this.attribLocations = {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    };

    this.uniformLocations = {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ) as WebGLUniformLocation,
      modelViewMatrix: gl.getUniformLocation(
        shaderProgram,
        "uModelViewMatrix"
      ) as WebGLUniformLocation,
      normalMatrix: gl.getUniformLocation(
        shaderProgram,
        "uNormalMatrix"
      ) as WebGLUniformLocation,
      uSampler: gl.getUniformLocation(
        shaderProgram,
        "uSampler"
      ) as WebGLUniformLocation,
    };
  }

  bindPositions(
    positions: Array<number>,
    vertexNormals: Array<number>,
    textureCoordinates: Array<number>,
    indices: Array<number>
  ) {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );

    const normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertexNormals),
      this.gl.STATIC_DRAW
    );
    const textureCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      this.gl.STATIC_DRAW
    );

    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );

    return {
      position: positionBuffer,
      normal: normalBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
    };
  }

  drawScene(
    buffers: {
      position: WebGLBuffer;
      normal: WebGLBuffer;
      textureCoord: WebGLBuffer;
      indices: WebGLBuffer;
    },
    texture: WebGLTexture,
    deltaTime = 0
  ) {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeRotation, [0, 0, 1]);
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      this.cubeRotation * 0.7,
      [0, 1, 0]
    );
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      this.cubeRotation * 0.3,
      [1, 0, 0]
    );
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    {
      const numComponents = 3;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
      this.gl.vertexAttribPointer(
        this.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attribLocations.vertexPosition);
    }
    {
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.textureCoord);
      this.gl.vertexAttribPointer(
        this.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attribLocations.textureCoord);
    }

    {
      const numComponents = 3;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
      this.gl.vertexAttribPointer(
        this.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attribLocations.vertexNormal);
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    this.gl.useProgram(this.program);

    this.gl.uniformMatrix4fv(
      this.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    this.gl.uniformMatrix4fv(
      this.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    this.gl.uniformMatrix4fv(
      this.uniformLocations.normalMatrix,
      false,
      normalMatrix
    );

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.uniformLocations.uSampler, 0);

    {
      const vertexCount = 36;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }

    this.cubeRotation += deltaTime;
  }

  draw() {
    const positions = [
      // Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
      // Back face
      -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
      // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
      // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
      // Right face
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
      // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];
    const vertexNormals = [
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    const textureCoordinates = [
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];
    // prettier-ignore
    const indices = [
      0, 1, 2, 0, 2, 3, 
      4, 5, 6, 4, 6, 7, 
      8, 9, 10, 8, 10, 11, 
      12, 13, 14, 12, 14, 15, 
      16, 17, 18, 16, 18, 19, 
      20, 21, 22, 20, 22, 23,
    ];
    const buffers = this.bindPositions(
      positions,
      vertexNormals,
      textureCoordinates,
      indices
    );
    const texture = loadTexture(
      this.gl,
      "http://localhost:8080/cubetexture.png"
    );
    let then = 0;
    const render = (now: number) => {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      this.drawScene(buffers, texture, deltaTime);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
}

export default Program;
