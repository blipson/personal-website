var options = {
    // some of these options are not actually available in the UI to save visual space
    fireEmitPositionSpread: {x:100,y:20},

    fireEmitRate: 1600,
    fireEmitRateSlider: {min:1,max:5000},

    fireSize: 40.0,
    fireSizeSlider: {min:2.0,max:100.0},

    fireSizeVariance:  100.0,
    fireSizeVarianceSlider: {min:0.0,max:100.0},

    fireEmitAngleVariance: 0.42,
    fireEmitAngleVarianceSlider: {min:0.0,max:Math.PI/2},

    fireSpeed: 200.0,
    fireSpeedSlider: {min:20.0,max:500},

    fireSpeedVariance: 80.0,
    fireSpeedVarianceSlider: {min:0.0,max:100.0},

    fireDeathSpeed: 0.003,
    fireDeathSpeedSlider: {min: 0.001, max: 0.05},

    fireTriangleness: 0.00015,
    fireTrianglenessSlider: {min:0.0, max:0.0003},

    fireTextureHue: 25.0,
    fireTextureHueSlider: {min:-180,max:180},

    fireTextureHueVariance: 15.0,
    fireTextureHueVarianceSlider: {min:0.0,max:180},

    fireTextureColorize: true,
    wind: true,
    omnidirectionalWind:false,

    windStrength:20.0,
    windStrengthSlider:{min:0.0,max:60.0},

    windTurbulance:0.0003,
    windTurbulanceSlider:{min:0.0,max:0.001},

    sparks: true,

    sparkEmitRate: 6.0,
    sparkEmitSlider: {min:0.0,max:10.0},

    sparkSize: 10.0,
    sparkSizeSlider: {min:5.0,max:100.0},

    sparkSizeVariance: 20.0,
    sparkSizeVarianceSlider: {min:0.0,max:100.0},

    sparkSpeed: 400.0,
    sparkSpeedSlider: {min:20.0, max:700.0},

    sparkSpeedVariance: 80.0,
    sparkSpeedVarianceSlider: {min:0.0, max:100.0},

    sparkDeathSpeed: 0.0085,
    sparkDeathSpeedSlider: {min: 0.002, max: 0.05},

};

async function loadShader(gl, url, shaderType) {
    const shaderSource =
        await fetch(url).then((response) => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Web request to fetch shader failed at ' + url);
        });

    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        alert("*** Error compiling shader '" + shader + "':" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

window.onload = main;

async function main() {
    canvas = document.getElementById("canvas");
    gl = getWebGLContext(canvas);
    if (!gl) {
        return;
    }

    const textureName = "/textures/fire/flame.png"
    const texture = gl.createTexture();
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    image.onerror = () => {
        alert("ERROR: texture " + textureName + " can't be loaded!"); console.error("ERROR: texture " + textureName + " can't be loaded!");
    };
    image.src = textureName;


    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    vertexBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();
    squareTextureCoordinateVertices = gl.createBuffer();

    // setup GLSL program
    const vertexShader = await loadShader(gl, "/js/vertex-shader.js", gl.VERTEX_SHADER);
    const fragmentShader = await loadShader(gl, "/js/fragment-shader.js", gl.FRAGMENT_SHADER);

    const program = createProgram(gl, [vertexShader, fragmentShader], null, null);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    positionAttrib = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttrib);
    colorAttrib = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorAttrib);
    textureCoordAttribute = gl.getAttribLocation(program, "a_texture_coord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    // lookup uniforms
    resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    textureSamplerLocation = gl.getUniformLocation(program, "u_sampler")

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    animloop(time(), texture, [], []);

}

function animloop(lastParticleTime, texture, fireParticles, sparkParticles) {
    var sparkParticleDiscrepancy = 0;
    var particleDiscrepancy = 0;
    const emitCenter = {x:canvas.width/2,y:canvas.height/2+200};


    var currentParticleTime = time();
    var timeDifference = currentParticleTime - lastParticleTime;

    // we don't want to generate a ton of particles if the browser was minimized or something
    if (timeDifference > 100)
        timeDifference = 100;

    // update fire particles

    particleDiscrepancy += options.fireEmitRate*(timeDifference)/1000.0;
    while (particleDiscrepancy > 0) {
        var size = randomSpread(options.fireSize,options.fireSize*(options.fireSizeVariance/100.0));
        var speed = randomSpread(options.fireSpeed,options.fireSpeed*options.fireSpeedVariance/100.0);
        var color = {};
        if (!options.fireTextureColorize)
            color = {r:1.0,g:1.0,b:1.0,a:0.5};
        else {
            var hue = randomSpread(options.fireTextureHue,options.fireTextureHueVariance);
            color = HSVtoRGB(convertHue(hue),1.0,1.0);
            color.a = 0.5;
        }
        var particle = {
            pos: random2DVec(emitCenter,options.fireEmitPositionSpread),
            vel: scaleVec(randomUnitVec(Math.PI/2,options.fireEmitAngleVariance),speed),
            size: {width:size,
                height:size},
            color: color,
        };
        fireParticles.push(particle);
        particleDiscrepancy -= 1.0;
    }

    particleAverage = {x:0,y:0};
    var numParts = fireParticles.length;
    for (var i = 0; i < numParts; i++) {
        particleAverage.x += fireParticles[i].pos.x/numParts;
        particleAverage.y += fireParticles[i].pos.y/numParts;
    }


    for (var i = 0; i < fireParticles.length; i++) {
        var x = fireParticles[i].pos.x;
        var y = fireParticles[i].pos.y;

        // apply wind to the velocity
        if (options.wind) {
            if (options.omnidirectionalWind)
                fireParticles[i].vel = addVecs(fireParticles[i].vel,scaleVec(unitVec((noise.simplex3(x / 500, y / 500, lastParticleTime*options.windTurbulance)+1.0)*Math.PI),options.windStrength));
            else
                fireParticles[i].vel = addVecs(fireParticles[i].vel,scaleVec(unitVec((noise.simplex3(x / 500, y / 500, lastParticleTime*options.windTurbulance)+1.0)*Math.PI*0.5),options.windStrength));
        }
        // move the particle
        fireParticles[i].pos = addVecs(fireParticles[i].pos,scaleVec(fireParticles[i].vel,timeDifference/1000.0));

        fireParticles[i].color.a -= options.fireDeathSpeed+Math.abs(particleAverage.x-fireParticles[i].pos.x)*options.fireTriangleness;//;Math.abs((fireParticles[i].pos.x-canvas.width/2)*options.fireTriangleness);

        if (fireParticles[i].pos.y <= -fireParticles[i].size.height*2 || fireParticles[i].color.a <= 0)
            markForDeletion(fireParticles,i);
    }
    fireParticles = deleteMarked(fireParticles);

    // update spark particles
    sparkParticleDiscrepancy += options.sparkEmitRate*(timeDifference)/1000.0;
    while (sparkParticleDiscrepancy > 0) {
        var size = randomSpread(options.sparkSize,options.sparkSize*(options.sparkSizeVariance/100.0));
        var origin = clone2DVec(emitCenter);
        var speed = randomSpread(options.sparkSpeed,options.sparkSpeed*options.sparkSpeedVariance/100.0);
        var particle = {
            origin: origin,
            pos: random2DVec(emitCenter,options.fireEmitPositionSpread),
            vel: scaleVec(randomUnitVec(Math.PI/2,options.fireEmitAngleVariance*2.0),speed),
            size: {width:size,
                height:size},
            color: {r:1.0, g:0.8, b:0.3, a: 1.0}
        };
        sparkParticles.push(particle);

        sparkParticleDiscrepancy -= 1.0;
    }

    for (var i = 0; i < sparkParticles.length; i++) {

        var x = sparkParticles[i].pos.x;
        var y = sparkParticles[i].pos.y;
        sparkParticles[i].vel = addVecs(sparkParticles[i].vel,scaleVec(unitVec((noise.simplex3(x / 500, y / 500, lastParticleTime*0.0003)+1.0)*Math.PI*0.5),20.0));
        sparkParticles[i].pos = addVecs(sparkParticles[i].pos,scaleVec(sparkParticles[i].vel,timeDifference/1000.0));

        sparkParticles[i].color.a -= options.sparkDeathSpeed;

        if (sparkParticles[i].pos.y <= -sparkParticles[i].size.height*2 || sparkParticles[i].color.a <= 0)
            markForDeletion(sparkParticles,i);
    }
    sparkParticles = deleteMarked(sparkParticles);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // set the resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1i(textureSamplerLocation, 0);

    drawRects(fireParticles, texture);
    if (options.sparks)
        drawRects(sparkParticles, texture);
    requestAnimFrame(() => { animloop(currentParticleTime, texture, fireParticles, sparkParticles) });

}

function time() {
    var d = new Date();
    var n = d.getTime();
    return n;
}


function concat_inplace(index,arr1,arr2) {
    for (var i = 0; i < arr2.length; i++) {
        arr1[index] = arr2[i];
        index += 1;
    }
    return index;
}


function drawRects(rects, texture) {
    var index = 0;
    var colorIndex = 0;
    var texIndex = 0;
    var rectArray = [];
    var colorArray = [];
    var textureCoordinates = [];
    for (var i = 0; i < rects.length; i++) {
        var x1 = rects[i].pos.x - rects[i].size.width/2;
        var x2 = rects[i].pos.x + rects[i].size.width/2;
        var y1 = rects[i].pos.y - rects[i].size.height/2;
        var y2 = rects[i].pos.y + rects[i].size.height/2;
        index = concat_inplace(index,rectArray,[
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2]);
        texIndex = concat_inplace(texIndex,textureCoordinates,[
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]);
        for (var ii = 0; ii < 6; ii++) {
            colorIndex = concat_inplace(colorIndex,colorArray,[
                rects[i].color.r,
                rects[i].color.g,
                rects[i].color.b,
                rects[i].color.a
            ]);
        }
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareTextureCoordinateVertices);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, rects.length*6);
}
