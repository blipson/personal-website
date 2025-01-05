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

async function loadTexture(gl, url) {

}

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

const rectangleVertices = [
    1.0, -1.0,  0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0,  0.0,
    -1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
];

const rectangleNormals = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
]

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
  in vec2 in_texture;

  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;

  uniform vec3 lightPosition;

  out vec3 normal;
  out vec3 surfaceToLight;
  out vec2 texcoord;

  void main() {
    vec3 surfaceModelPosition = (model * in_position).xyz;
  
    normal = mat3(model) * in_normal;
    surfaceToLight = lightPosition - surfaceModelPosition;
    texcoord = in_texture;
    gl_Position = projection * view * model * in_position;
  }
  `;

    const fragmentShader = `#version 300 es
  precision highp float;

  in vec3 normal;
  in vec3 surfaceToLight;
  in vec2 texcoord;

  uniform vec4 diffuse;
  uniform vec3 lightColor;
  uniform sampler2D u_texture;

  out vec4 outColor;

  void main () {
    float light = dot(normalize(normal), normalize(surfaceToLight));
    vec4 textureColor = texture(u_texture, texcoord);
    vec4 finalColor = textureColor.a > 0.0 ? textureColor : diffuse;
    outColor = vec4(finalColor.rgb * light * lightColor, finalColor.a);
  }
  `;


    const meshProgramInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);

    const rectangleBufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: rectangleVertices,
        normal: rectangleNormals,
        texture: [
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
        ]
    })


    const response = await fetch('/obj/head.obj');
    const text = await response.text();
    const data = parseOBJ(text);
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
    const rectangleVao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, rectangleBufferInfo);

    const emptyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, emptyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    const fireTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fireTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    const image = new Image();
    image.src = '/textures/flame.png';
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, fireTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    const cameraTarget = [0, 0, -1];
    const cameraPosition = [0, 0, 20];
    const zNear = 0.1;
    const zFar = 50;

    const up = [0, 1, 0];
    let camera = m4.lookAt(cameraPosition, cameraTarget, up);
    let view = m4.inverse(camera);

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    document.addEventListener('keydown', (event) => {
        const speed = 0.1;
        const rotationSpeed = 0.05;
        switch (event.key) {
            case "w":
                cameraPosition[2] -= speed;
                cameraTarget[2] -= speed;
                camera = m4.lookAt(cameraPosition, cameraTarget, up);
                break;
            case "s":
                cameraPosition[2] += speed;
                cameraTarget[2] += speed;
                camera = m4.lookAt(cameraPosition, cameraTarget, up);
                break;
            case "a":
                cameraPosition[0] -= speed;
                cameraTarget[0] -= speed;
                camera = m4.lookAt(cameraPosition, cameraTarget, up);
                break;
            case "d":
                cameraPosition[0] += speed;
                cameraTarget[0] += speed;
                camera = m4.lookAt(cameraPosition, cameraTarget, up);
                break;
        }
        view = m4.inverse(camera);
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

        const sharedUniforms = {
            lightPosition: [0, 0, 1],
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
                u_texture: emptyTexture,
            });
            twgl.drawBufferInfo(gl, bufferInfo);
            i++;
        })

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        twgl.setUniforms(meshProgramInfo, {
            model: m4.identity(),
            diffuse: [1, 0, 0, 1],
            u_texture: fireTexture,
        });
        gl.bindVertexArray(rectangleVao);
        twgl.drawBufferInfo(gl, rectangleBufferInfo);
        gl.disable(gl.BLEND);


        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
