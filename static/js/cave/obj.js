const getReferenceIndexes = (vertex) => {
    return vertex.split("/").map(reference => parseInt(reference.toString(), 10) - 1);
}

const getOrDefaultTextureCoordinates = (vertexTextureCoordinates, textureCoordinateIndex) => {
    return textureCoordinateIndex >= 0 ? vertexTextureCoordinates[textureCoordinateIndex] : [0, 0]
}

const getOrDefaultNormals = (vertexNormals, normalIndex) => {
    return normalIndex >= 0 ? vertexNormals[normalIndex] : [0, 0, 1]
}

const addVertexToAccumulator = (accumulator, vertex, vertexData) => {
    const [positionIndex, textureCoordinateIndex, normalIndex] = getReferenceIndexes(vertex);
    accumulator.position.push(...vertexData.positions[positionIndex]);
    accumulator.texture.push(...(getOrDefaultTextureCoordinates(vertexData.textureCoordinates, textureCoordinateIndex)));
    accumulator.normal.push(...(getOrDefaultNormals(vertexData.normals, normalIndex)));
}

const addTriangleToAccumulator = (accumulator, triangle, vertexData) => {
    triangle.forEach((vertex) => {
        addVertexToAccumulator(accumulator, vertex, vertexData);
    });
}

const getTriangles = (faceLine) => {
    return faceLine.length === 4 ?
        [
            [faceLine[0], faceLine[1], faceLine[2]],
            [faceLine[0], faceLine[2], faceLine[3]]
        ] :
        [faceLine]
}

const addTrianglesToAccumulator = (accumulator, face, vertexData) => {
    getTriangles(face)
        .forEach((triangle) => {
            addTriangleToAccumulator(accumulator, triangle, vertexData);
        });
}

const parseObjFast = (text) => {
    const vertexData = {
        positions: [],
        textureCoordinates: [],
        normals: [],
    };

    const vertexInformation = {
        position: [],
        texture: [],
        normal: [],
    };

    text.split('\n').forEach((line) => {
        const trimmed = line.trim();
        const vertexLine = trimmed.startsWith('v ');
        const textureCoordinateLine = trimmed.startsWith('vt ');
        const normalLine = trimmed.startsWith('vn ');
        const faceLine = trimmed.startsWith('f ');

        if (vertexLine || textureCoordinateLine || normalLine || faceLine) {
            const tail = trimmed.split(/\s+/).slice(1);
            if (vertexLine) {
                vertexData.positions.push(tail.map(parseFloat));
            } else if (textureCoordinateLine) {
                vertexData.textureCoordinates.push(tail.map(parseFloat));
            } else if (normalLine) {
                vertexData.normals.push(tail.map(parseFloat));
            } else {
                addTrianglesToAccumulator(vertexInformation, tail, vertexData);
            }
        }
    });

    return vertexInformation;
}