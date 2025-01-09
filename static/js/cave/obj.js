
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

    return {
        position: webglVertexData[0],
        texture: webglVertexData[1],
        normal: webglVertexData[2],
    };
}