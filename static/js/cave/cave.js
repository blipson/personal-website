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


const rectangleVertices = [
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
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
];


const degreesToRadians = (degrees) => {
    return degrees * Math.PI / 180;
}

const headOptions = {
    start: 0,
    end: degreesToRadians(360),
    numHeads: 10,
}

const caveState = {
    cameraPosition: [0, 0, 20],
    cameraTarget: [0, 0, -1],
    up: [0, 1, 0],
    headAngles: Array.from(
        {
            length: headOptions.numHeads
        },
        (_, index) => {
            return headOptions.start + index * (headOptions.end - headOptions.start) / (headOptions.numHeads - 1);
    }),
}

const cameraOptions = {
    movementSpeed: 0.1,
    rotationSpeed: 0.05,
}

const moveCameraForward = () => {
    // todo: cameraPosition = view * speed

    caveState.cameraPosition[2] -= cameraOptions.movementSpeed;
    caveState.cameraTarget[2] -= cameraOptions.movementSpeed;
}

const moveCameraBackward = () => {
    // todo: cameraPosition = view * -speed
    caveState.cameraPosition[2] += cameraOptions.movementSpeed;
    caveState.cameraTarget[2] += cameraOptions.movementSpeed;
}

const moveCameraLeft = () => {
    // todo: cameraPosition = u * -speed
    caveState.cameraPosition[0] -= cameraOptions.movementSpeed;
    caveState.cameraTarget[0] -= cameraOptions.movementSpeed;
}

const moveCameraRight = () => {
    // todo: cameraPosition = u * speed
    caveState.cameraPosition[0] += cameraOptions.movementSpeed;
    caveState.cameraTarget[0] += cameraOptions.movementSpeed;
}

const translateCameraToOrigin = (originalCameraPosition) => {
    const translationToCamera = m4.translation(-originalCameraPosition[0], -originalCameraPosition[1], -originalCameraPosition[2]);
    caveState.cameraPosition = m4.transformPoint(translationToCamera, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(translationToCamera, caveState.cameraTarget);
}

const translateCameraFromOrigin = (originalCameraPosition) => {
    const translationBack = m4.translation(originalCameraPosition[0], originalCameraPosition[1], originalCameraPosition[2]);
    caveState.cameraPosition = m4.transformPoint(translationBack, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(translationBack, caveState.cameraTarget);
}

const rotateCameraUp = (originalCameraPosition) => {
    translateCameraToOrigin(originalCameraPosition);
    const pitchMatrixUp = m4.xRotation(cameraOptions.rotationSpeed);
    caveState.cameraPosition = m4.transformPoint(pitchMatrixUp, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(pitchMatrixUp, caveState.cameraTarget);
    caveState.up = m4.transformDirection(pitchMatrixUp, caveState.up);
    translateCameraFromOrigin(originalCameraPosition);
}

const rotateCameraDown = (originalCameraPosition) => {
    translateCameraToOrigin(originalCameraPosition);
    const pitchMatrixDown = m4.xRotation(-cameraOptions.rotationSpeed);
    caveState.cameraPosition = m4.transformPoint(pitchMatrixDown, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(pitchMatrixDown, caveState.cameraTarget);
    caveState.up = m4.transformDirection(pitchMatrixDown, caveState.up);
    translateCameraFromOrigin(originalCameraPosition);
}

const rotateCameraLeft = (originalCameraPosition) => {
    translateCameraToOrigin(originalCameraPosition);
    const yawMatrixLeft = m4.yRotation(cameraOptions.rotationSpeed);
    caveState.cameraPosition = m4.transformPoint(yawMatrixLeft, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(yawMatrixLeft, caveState.cameraTarget);
    translateCameraFromOrigin(originalCameraPosition);
}

const rotateCameraRight = (originalCameraPosition) => {
    translateCameraToOrigin(originalCameraPosition);
    const yawMatrixRight = m4.yRotation(-cameraOptions.rotationSpeed);
    caveState.cameraPosition = m4.transformPoint(yawMatrixRight, caveState.cameraPosition);
    caveState.cameraTarget = m4.transformPoint(yawMatrixRight, caveState.cameraTarget);
    translateCameraFromOrigin(originalCameraPosition);
}

document.addEventListener('keydown', (event) => {
    const originalCameraPosition = [...caveState.cameraPosition];
    switch (event.key) {
        case "r":
            event.preventDefault();
            caveState.cameraPosition = [0, 0, 20];
            caveState.cameraTarget = [0, 0, 0];
            caveState.up = [0, 1, 0];
            break;
        case "w":
            event.preventDefault();
            moveCameraForward();
            break;
        case "s":
            event.preventDefault();
            moveCameraBackward();
            break;
        case "a":
            event.preventDefault();
            moveCameraLeft();
            break;
        case "d":
            event.preventDefault();
            moveCameraRight();
            break;
        case "ArrowUp":
            event.preventDefault();
            rotateCameraUp(originalCameraPosition);
            break;
        case "ArrowDown":
            event.preventDefault();
            rotateCameraDown(originalCameraPosition);
            break;
        case "ArrowLeft":
            event.preventDefault();
            rotateCameraLeft(originalCameraPosition);
            break;
        case "ArrowRight":
            event.preventDefault();
            rotateCameraRight(originalCameraPosition);
            break;
    }
})

const enter = async () => {
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

    const headVertexShader = `#version 300 es
  in vec4 in_position;
  in vec3 in_normal;
  in vec2 in_texture;

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

    const headFragmentShader = `#version 300 es
  precision highp float;

  in vec3 normal;
  in vec3 surfaceToLight;

  uniform vec4 diffuse;
  uniform vec3 lightColor;
  uniform sampler2D u_texture;

  out vec4 outColor;

  void main () {
    float light = dot(normalize(normal), normalize(surfaceToLight));
    outColor = vec4(diffuse.rgb * light * lightColor, diffuse.a);
  }
  `;

    const fireVertexShader = `#version 300 es
  in vec4 in_position;
  in vec3 in_normal;
  in vec2 in_texture;

  uniform mat4 model;
  uniform mat4 view;
  uniform mat4 projection;
  uniform float frameTime;
  uniform vec3 scrollSpeeds;
  uniform vec3 scales;

  out vec2 texCoord;
  out vec2 texCoord1;
  out vec2 texCoord2;
  out vec2 texCoord3;

  void main() {
    texCoord = in_texture;
    texCoord1 = in_texture * scales.x;
    texCoord1.y = texCoord1.y - (frameTime * scrollSpeeds.x);
    texCoord2 = in_texture * scales.y;
    texCoord2.y = texCoord2.y - (frameTime * scrollSpeeds.y);
    texCoord3 = in_texture * scales.z;
    texCoord3.y = texCoord3.y - (frameTime * scrollSpeeds.z);

    gl_Position = projection * view * model * in_position;
  }
  `;

    const fireFragmentShader = `#version 300 es
  precision highp float;

  in vec2 texCoord;
  in vec2 texCoord1;
  in vec2 texCoord2;
  in vec2 texCoord3;

  uniform sampler2D fireTexture;
  uniform sampler2D noiseTexture;
  uniform sampler2D alphaTexture;
  uniform vec2 distortion1;
  uniform vec2 distortion2;
  uniform vec2 distortion3;
  uniform float distortionScale;
  uniform float distortionBias;

  out vec4 outColor;

  void main () {
    vec4 noise1;
    vec4 noise2;
    vec4 noise3;
    vec4 finalNoise;
    float perturb;
    vec2 noiseCoords;
    vec4 fireColor;
    vec4 alphaColor;
    
    noise1 = texture(noiseTexture, texCoord1);
    noise2 = texture(noiseTexture, texCoord2);
    noise3 = texture(noiseTexture, texCoord3);
    
    noise1 = (noise1 - 0.5f) * 2.0f;
    noise2 = (noise2 - 0.5f) * 2.0f;
    noise3 = (noise3 - 0.5f) * 2.0f;
    
    noise1.xy = noise1.xy * distortion1.xy;
    noise2.xy = noise2.xy * distortion2.xy;
    noise3.xy = noise3.xy * distortion3.xy;
    
    finalNoise = noise1 + noise2 + noise3;
    
    perturb = ((texCoord.y) * distortionScale) + distortionBias;
    noiseCoords.x = (finalNoise.x * perturb) + texCoord.x;
    noiseCoords.y = (finalNoise.y * perturb) + (1.0f - texCoord.y);
    
    fireColor = texture(fireTexture, noiseCoords);
    alphaColor = texture(alphaTexture, noiseCoords.xy);
    
    fireColor.a = alphaColor.r;
    outColor = fireColor;
  }
  `;


    const headMeshProgramInfo = twgl.createProgramInfo(gl, [headVertexShader, headFragmentShader]);
    const fireMeshProgramInfo = twgl.createProgramInfo(gl, [fireVertexShader, fireFragmentShader]);

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
    const headVao = twgl.createVAOFromBufferInfo(gl, headMeshProgramInfo, bufferInfo);
    const rectangleVao = twgl.createVAOFromBufferInfo(gl, fireMeshProgramInfo, rectangleBufferInfo);

    const greyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, greyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([122.5, 122.5, 122.5, 255]));

    const flameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, flameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    const image = new Image();
    image.src = '/textures/fire/flame.png';
    image.addEventListener('load', function () {
        gl.bindTexture(gl.TEXTURE_2D, flameTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    const fireTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fireTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    const fireImage = new Image();
    fireImage.src = '/textures/fire/fire01.gif';
    fireImage.addEventListener('load',  () => {
        gl.bindTexture(gl.TEXTURE_2D, fireTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fireImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });

    const noiseTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    const noiseImage = new Image();
    noiseImage.src = '/textures/fire/noise01.gif';
    noiseImage.addEventListener('load',  () => {
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noiseImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    });

    const alphaTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, alphaTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    const alphaImage = new Image();
    alphaImage.src = '/textures/fire/alpha01.gif';
    alphaImage.addEventListener('load',  () => {
        gl.bindTexture(gl.TEXTURE_2D, alphaTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, alphaImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });

    const render = (frameTime) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const sharedModelUniforms = {
            lightPosition: [0, 0, 5],
            lightColor: m4.normalize([0.5, 0.25, 0]),
            view: m4.inverse(m4.lookAt(caveState.cameraPosition, caveState.cameraTarget, caveState.up)),
            projection: m4.perspective(degreesToRadians(60), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 50),
        };

        gl.useProgram(headMeshProgramInfo.program);

        twgl.setUniforms(headMeshProgramInfo, sharedModelUniforms);
        gl.bindVertexArray(headVao);

        caveState.headAngles.forEach((angle, index) => {
            caveState.headAngles[index] += 0.001;
            const radius = 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            twgl.setUniforms(headMeshProgramInfo, {
                model: m4.multiply(m4.translation(x, 0, z), m4.lookAt([0, 0, 0], [x, 0, z], caveState.up)),
                diffuse: [0.5, 0.5, 0.5, 1],
                u_texture: greyTexture,
            });
            twgl.drawBufferInfo(gl, bufferInfo);
        });

        gl.useProgram(fireMeshProgramInfo.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        twgl.setUniforms(fireMeshProgramInfo, {
            model:  m4.lookAt(m4.normalize(caveState.cameraPosition), [0, 0, 0], caveState.up),
            view: m4.inverse(m4.lookAt(caveState.cameraPosition, caveState.cameraTarget, caveState.up)),
            projection: m4.perspective(degreesToRadians(60), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 50),
            frameTime: frameTime,
            scrollSpeeds: [1.3, 2.1, 2.3],
            scales: [1.0, 2.0, 3.0],
            fireTexture: fireTexture,
            noiseTexture: noiseTexture,
            alphaTexture: alphaTexture,
            distortion1: [0.1, 0.2],
            distortion2: [0.1, 0.3],
            distortion3: [0.1, 0.1],
            distortionScale: 0.8,
            distortionBias: 0.5,
        });
        gl.bindVertexArray(rectangleVao);
        twgl.drawBufferInfo(gl, rectangleBufferInfo);
        gl.disable(gl.BLEND);

        // Note that if you don't lock the FPS to 60 then you will need to determine the
        // difference of time each frame and update a timer to keep the fire burning at a
        // consistent speed regardless of the FPS.
        requestAnimationFrame(() => {
            render(frameTime > 1000.0 ? 0.0 : frameTime + 0.01)
        });
    }

    requestAnimationFrame(() => {
        render(0.0);
    });
}
