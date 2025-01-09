
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
    });

    const sum = [0, 0, 0];
    const vertexCount = objPositions.length - 1; // Exclude the dummy starting position

    objPositions.slice(1).forEach((position) => {
        sum[0] += position[0];
        sum[1] += position[1];
        sum[2] += position[2];
    });

    const centroid = [
        sum[0] / vertexCount,
        sum[1] / vertexCount,
        sum[2] / vertexCount,
    ];

    let minY = Infinity;
    let maxY = -Infinity;

    objPositions.slice(1).forEach((position) => {
        const y = position[1];
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    });

    const height = maxY - minY;

    console.log("height is " + height);

    return {
        position: webglVertexData[0],
        texture: webglVertexData[1],
        normal: webglVertexData[2],
    };
}