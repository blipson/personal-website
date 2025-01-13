const getLines = (text) => {
    return text.split('\n');
}

const trimmedStartsWith = (s, prefix) => {
    return s.trim().startsWith(prefix);
}

const getTail = (s) => {
    return s.trim().split(/\s+/).slice(1)
}

const getTailAsFloats = (s) => {
    return getTail(s).map(parseFloat);
}

const getVertexPositions = (lines) => {
    return lines
        .filter(line => trimmedStartsWith(line, 'v '))
        .map(vertexLine => getTailAsFloats(vertexLine));
}

const getTextureCoordinates = (lines) => {
    return lines
        .filter(line => trimmedStartsWith(line, 'vt '))
        .map(textureCoordinateLine => getTailAsFloats(textureCoordinateLine));
}

const getNormals = (lines) => {
    return lines
        .filter(line => trimmedStartsWith(line, 'vn '))
        .map(normalLine => getTailAsFloats(normalLine));
}

const getFaces = (lines) => {
    return lines
        .filter(line => trimmedStartsWith(line, 'f '))
        .map(faceLine => getTail(faceLine))
}

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

const getVertexInformation = (faces, vertexData) => {
    return faces
        .reduce((accumulator, face) => {
            addTrianglesToAccumulator(accumulator, face, vertexData);
            return accumulator
        }, {
            position: [],
            texture: [],
            normal: [],
        });
}

const parseObj = (text) => {
    const lines = getLines(text);
    const vertexData = {
        positions: getVertexPositions(lines),
        textureCoordinates: getTextureCoordinates(lines),
        normals: getNormals(lines),
    }
    return getVertexInformation(getFaces(lines), vertexData);
}
