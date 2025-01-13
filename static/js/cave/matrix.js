const normalizeVector = (vector) => {
    const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
    return (length > 0.00001) ?
        [
            vector[0] / length,
            vector[1] / length,
            vector[2] / length,
        ] :
        [0.0, 0.0, 0.0]
}

const scale = (matrix, x, y, z) => {
    return [
        x * matrix[0],
        x * matrix[1],
        x * matrix[2],
        x * matrix[3],
        y * matrix[4],
        y * matrix[5],
        y * matrix[6],
        y * matrix[7],
        z * matrix[8],
        z * matrix[9],
        z * matrix[10],
        z * matrix[11],
        matrix[12],
        matrix[13],
        matrix[14],
        matrix[15],
    ];
}

const addVectors = (vector1, vector2) => {
    return [
        vector1[0] + vector2[0],
        vector1[1] + vector2[1],
        vector1[2] + vector2[2],
    ];
}

const cross = (vector1, vector2) => {
    return [
        vector1[1] * vector2[2] - vector1[2] * vector2[1],
        vector1[2] * vector2[0] - vector1[0] * vector2[2],
        vector1[0] * vector2[1] - vector1[1] * vector2[0],
    ]
}