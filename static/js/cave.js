/*
    Personal website of Ben Gangl-Lipson
    Copyright (C) 2024 Ben Gangl-Lipson

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const parseOBJ = (text) => {
    const objPositions = [[0, 0, 0]];
    const objTextureCoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    const objVertexData = [
        objPositions,
        objTextureCoords,
        objNormals,
    ];

    const webglVertexData = [
        [],
        [],
        [],
    ];

    const addVertex = (vertex) => {
        const position = vertex.split('/');
        position.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr.toString());
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTextureCoords.push(parts.map(parseFloat));
        },
        f(parts) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
    };

    const keywordRegEx = /(\w*) *(.*)/;
    const lines = text.split('\n');
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) {
            return;
        }
        const m = keywordRegEx.exec(trimmed);
        if (!m) {
            return;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = trimmed.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            return;
        }
        handler(parts, unparsedArgs);
    })

    return {
        position: webglVertexData[0],
        texture: webglVertexData[1],
        normal: webglVertexData[2],
    };
}

async function enter() {
    document.querySelector("#enter-cave").style.display = "none";
    const canvas = document.querySelector("#cave-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";
    canvas.fillStyle = "black";
    new Audio('/mp3/cave.mp3').play()
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    gl.clearColor(0, 0, 0, 1);

    twgl.setAttributePrefix("in_");

    const vertexShader = `#version 300 es
  in vec4 in_position;
  in vec3 in_normal;

  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;

  uniform vec3 lightPosition;

  out vec3 normal;
  out vec3 surfaceToLight;

  void main() {
    vec3 surfaceModelPosition = (model * in_position).xyz;
  
    normal = mat3(model) * in_normal;
    surfaceToLight = lightPosition - surfaceModelPosition;
    gl_Position = projection * view * model * in_position;
  }
  `;

    const fragmentShader = `#version 300 es
  precision highp float;

  in vec3 normal;
  in vec3 surfaceToLight;

  uniform vec4 diffuse;
  uniform vec3 lightColor;

  out vec4 outColor;

  void main () {
    float light = dot(normalize(normal), normalize(surfaceToLight));
    outColor = vec4(diffuse.rgb * light * lightColor, diffuse.a);
  }
  `;


    const meshProgramInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);

    const response = await fetch('/obj/head.obj');
    const text = await response.text();
    const data = parseOBJ(text);
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

    const cameraTarget = [0, 0, -1];
    const cameraPosition = [0, 0, 20];
    const zNear = 0.1;
    const zFar = 50;

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    document.addEventListener('keydown', (event) => {
        const speed = 0.1;
        const rotationSpeed = 0.05;
        switch (event.key) {
            case "w":
                cameraPosition[2] -= speed;
                break;
            case "s":
                cameraPosition[2] += speed;
                break;
            case "a":
                cameraPosition[0] -= speed;
                break;
            case "d":
                cameraPosition[0] += speed;
                break;
        }
    })

    const start = 0;
    const end = 6.28319;
    const numElements = 10;

    const angles = Array.from({ length: numElements }, (_, index) => start + index * (end - start) / (numElements - 1));


    function render(time) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        const up = [0, 1, 0];
        const camera = m4.lookAt(cameraPosition, cameraTarget, up);
        const view = m4.inverse(camera);

        const sharedUniforms = {
            lightPosition: m4.normalize([0, 0, 0]),
            lightColor: m4.normalize([0.5, 0.25, 0]),
            view: view,
            projection: projection,
        };

        gl.useProgram(meshProgramInfo.program);

        twgl.setUniforms(meshProgramInfo, sharedUniforms);
        gl.bindVertexArray(vao);

        let i = 0;
        angles.forEach(angle => {
            angles[i] += 0.001;
            const radius = 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const lookAtMatrix = m4.lookAt([0, 0, 0], [x, 0, z], [0, 1, 0]);
            const modelMatrix = m4.multiply(m4.translation(x, 0, z), lookAtMatrix);
            twgl.setUniforms(meshProgramInfo, {
                model: modelMatrix,
                diffuse: [0.5, 0.5, 0.5, 1],
            });
            twgl.drawBufferInfo(gl, bufferInfo);
            i++;
        })
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
