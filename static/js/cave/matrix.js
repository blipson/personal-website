const normalize = (vector) => {
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

const setMatrix = (matrix) => {
    const matrix0 = matrix[0];
    const matrix1 = matrix[1];
    const matrix2 = matrix[2];
    const matrix3 = matrix[3];
    const matrix4 = matrix[4];
    const matrix5 = matrix[5];
    const matrix6 = matrix[6];
    const matrix7 = matrix[7];
    const matrix8 = matrix[8];
    const matrix9 = matrix[9];
    const matrix10 = matrix[10];
    const matrix11 = matrix[11];
    const matrix12 = matrix[12];
    const matrix13 = matrix[13];
    const matrix14 = matrix[14];
    const matrix15 = matrix[15];
    return {
        matrix0,
        matrix1,
        matrix2,
        matrix3,
        matrix4,
        matrix5,
        matrix6,
        matrix7,
        matrix8,
        matrix9,
        matrix10,
        matrix11,
        matrix12,
        matrix13,
        matrix14,
        matrix15
    };
}

const translate = (matrix, x, y, z) => {
    const {
        matrix0,
        matrix1,
        matrix2,
        matrix3,
        matrix4,
        matrix5,
        matrix6,
        matrix7,
        matrix8,
        matrix9,
        matrix10,
        matrix11,
        matrix12,
        matrix13,
        matrix14,
        matrix15
    } = setMatrix(matrix);
    return [matrix0,
        matrix1,
        matrix2,
        matrix3,
        matrix4,
        matrix5,
        matrix6,
        matrix7,
        matrix8,
        matrix9,
        matrix10,
        matrix11,
        matrix0 * x + matrix4 * y + matrix8 * z + matrix12,
        matrix1 * x + matrix5 * y + matrix9 * z + matrix13,
        matrix2 * x + matrix6 * y + matrix10 * z + matrix14,
        matrix3 * x + matrix7 * y + matrix11 * z + matrix15,
    ];
}

const xRotate = (matrix, angleInRadians) => {
    const matrix4 = matrix[4];
    const matrix5 = matrix[5];
    const matrix6 = matrix[6];
    const matrix7 = matrix[7];
    const matrix8 = matrix[8];
    const matrix9 = matrix[9];
    const matrix10 = matrix[10];
    const matrix11 = matrix[11];
    const cosine = Math.cos(angleInRadians);
    const sine = Math.sin(angleInRadians);

    return [
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3],
        cosine * matrix4 + sine * matrix8,
        cosine * matrix5 + sine * matrix9,
        cosine * matrix6 + sine * matrix10,
        cosine * matrix7 + sine * matrix11,
        cosine * matrix8 - sine * matrix4,
        cosine * matrix9 - sine * matrix5,
        cosine * matrix10 - sine * matrix6,
        cosine * matrix11 - sine * matrix7,
        matrix[12],
        matrix[13],
        matrix[14],
        matrix[15],
    ];
}

const yRotate = (matrix, angleInRadians) => {
    const matrix0 = matrix[0];
    const matrix1 = matrix[1];
    const matrix2 = matrix[2];
    const matrix3 = matrix[3];
    const matrix8 = matrix[8];
    const matrix9 = matrix[9];
    const matrix10 = matrix[10];
    const matrix11 = matrix[11];
    const cosine = Math.cos(angleInRadians);
    const sine = Math.sin(angleInRadians);
    return [
        cosine * matrix0 - sine * matrix8,
        cosine * matrix1 - sine * matrix9,
        cosine * matrix2 - sine * matrix10,
        cosine * matrix3 - sine * matrix11,
        matrix[4],
        matrix[5],
        matrix[6],
        matrix[7],
        cosine * matrix8 + sine * matrix0,
        cosine * matrix9 + sine * matrix1,
        cosine * matrix10 + sine * matrix2,
        cosine * matrix11 + sine * matrix3,
        matrix[12],
        matrix[13],
        matrix[14],
        matrix[15],
    ];
}

const translation = (x, y, z) => {
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        x,
        y,
        z,
        1,
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

const transformPoint = (matrix, p) => {
    const px = p[0];
    const py = p[1];
    const pz = p[2];
    const scale = px * matrix[3] + py * matrix[7] + pz * matrix[11] + matrix[15];
    return [
        (px * matrix[0] + py * matrix[4] + pz * matrix[8] + matrix[12]) / scale,
        (px * matrix[1] + py * matrix[5] + pz * matrix[9] + matrix[13]) / scale,
        (px * matrix[2] + py * matrix[6] + pz * matrix[10] + matrix[14]) / scale,
    ];
}

const axisRotation = (axis, angleInRadians) => {
    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    x /= magnitude;
    y /= magnitude;
    z /= magnitude;
    const xSquared = x * x;
    const ySquared = y * y;
    const zSquared = z * z;
    const cosine = Math.cos(angleInRadians);
    const sine = Math.sin(angleInRadians);
    const oneMinusCosine = 1 - cosine;
    return [
        xSquared + (1 - xSquared) * cosine,
        x * y * oneMinusCosine + z * sine,
        x * z * oneMinusCosine - y * sine,
        0,
        x * y * oneMinusCosine - z * sine,
        ySquared + (1 - ySquared) * cosine,
        y * z * oneMinusCosine + x * sine,
        0,
        x * z * oneMinusCosine + y * sine,
        y * z * oneMinusCosine - x * sine,
        zSquared + (1 - zSquared) * cosine,
        0,
        0,
        0,
        0,
        1,
    ];
}

const transformDirection = (matrix, direction) => {
    const directionX = direction[0];
    const directionY = direction[1];
    const directionZ = direction[2];
    return [
        directionX * matrix[0] + directionY * matrix[4] + directionZ * matrix[8],
        directionX * matrix[1] + directionY * matrix[4 + 1] + directionZ * matrix[9],
        directionX * matrix[2] + directionY * matrix[4 + 2] + directionZ * matrix[10],
    ]
}

const yRotation = (angleInRadians) => {
    const cosine = Math.cos(angleInRadians);
    const sine = Math.sin(angleInRadians);
    return [
        cosine,
        0,
        -sine,
        0,
        0,
        1,
        0,
        0,
        sine,
        0,
        cosine,
        0,
        0,
        0,
        0,
        1,
    ];
}

const inverse = (matrix) => {
    const {
        matrix0,
        matrix1,
        matrix2,
        matrix3,
        matrix4,
        matrix5,
        matrix6,
        matrix7,
        matrix8,
        matrix9,
        matrix10,
        matrix11,
        matrix12,
        matrix13,
        matrix14,
        matrix15
    } = setMatrix(matrix);
    const tmp0 = matrix10 * matrix15;
    const tmp1 = matrix14 * matrix11;
    const tmp2 = matrix6 * matrix15;
    const tmp3 = matrix14 * matrix7;
    const tmp4 = matrix6 * matrix11;
    const tmp5 = matrix10 * matrix7;
    const tmp6 = matrix2 * matrix15;
    const tmp7 = matrix14 * matrix3;
    const tmp8 = matrix2 * matrix11;
    const tmp9 = matrix10 * matrix3;
    const tmp10 = matrix2 * matrix7;
    const tmp11 = matrix6 * matrix3;
    const tmp12 = matrix8 * matrix13;
    const tmp13 = matrix12 * matrix9;
    const tmp14 = matrix4 * matrix13;
    const tmp15 = matrix12 * matrix5;
    const tmp16 = matrix4 * matrix9;
    const tmp17 = matrix8 * matrix5;
    const tmp18 = matrix0 * matrix13;
    const tmp19 = matrix12 * matrix1;
    const tmp20 = matrix0 * matrix9;
    const tmp21 = matrix8 * matrix1;
    const tmp22 = matrix0 * matrix5;
    const tmp23 = matrix4 * matrix1;

    const t0 = (tmp0 * matrix5 + tmp3 * matrix9 + tmp4 * matrix13) -
        (tmp1 * matrix5 + tmp2 * matrix9 + tmp5 * matrix13);
    const t1 = (tmp1 * matrix1 + tmp6 * matrix9 + tmp9 * matrix13) -
        (tmp0 * matrix1 + tmp7 * matrix9 + tmp8 * matrix13);
    const t2 = (tmp2 * matrix1 + tmp7 * matrix5 + tmp10 * matrix13) -
        (tmp3 * matrix1 + tmp6 * matrix5 + tmp11 * matrix13);
    const t3 = (tmp5 * matrix1 + tmp8 * matrix5 + tmp11 * matrix9) -
        (tmp4 * matrix1 + tmp9 * matrix5 + tmp10 * matrix9);

    const determinant = 1.0 / (matrix0 * t0 + matrix4 * t1 + matrix8 * t2 + matrix12 * t3);

    return [
        determinant * t0,
        determinant * t1,
        determinant * t2,
        determinant * t3,
        determinant * ((tmp1 * matrix4 + tmp2 * matrix8 + tmp5 * matrix12) -
            (tmp0 * matrix4 + tmp3 * matrix8 + tmp4 * matrix12)),
        determinant * ((tmp0 * matrix0 + tmp7 * matrix8 + tmp8 * matrix12) -
            (tmp1 * matrix0 + tmp6 * matrix8 + tmp9 * matrix12)),
        determinant * ((tmp3 * matrix0 + tmp6 * matrix4 + tmp11 * matrix12) -
            (tmp2 * matrix0 + tmp7 * matrix4 + tmp10 * matrix12)),
        determinant * ((tmp4 * matrix0 + tmp9 * matrix4 + tmp10 * matrix8) -
            (tmp5 * matrix0 + tmp8 * matrix4 + tmp11 * matrix8)),
        determinant * ((tmp12 * matrix7 + tmp15 * matrix11 + tmp16 * matrix15) -
            (tmp13 * matrix7 + tmp14 * matrix11 + tmp17 * matrix15)),
        determinant * ((tmp13 * matrix3 + tmp18 * matrix11 + tmp21 * matrix15) -
            (tmp12 * matrix3 + tmp19 * matrix11 + tmp20 * matrix15)),
        determinant * ((tmp14 * matrix3 + tmp19 * matrix7 + tmp22 * matrix15) -
            (tmp15 * matrix3 + tmp18 * matrix7 + tmp23 * matrix15)),
        determinant * ((tmp17 * matrix3 + tmp20 * matrix7 + tmp23 * matrix11) -
            (tmp16 * matrix3 + tmp21 * matrix7 + tmp22 * matrix11)),
        determinant * ((tmp14 * matrix10 + tmp17 * matrix14 + tmp13 * matrix6) -
            (tmp16 * matrix14 + tmp12 * matrix6 + tmp15 * matrix10)),
        determinant * ((tmp20 * matrix14 + tmp12 * matrix2 + tmp19 * matrix10) -
            (tmp18 * matrix10 + tmp21 * matrix14 + tmp13 * matrix2)),
        determinant * ((tmp18 * matrix6 + tmp23 * matrix14 + tmp15 * matrix2) -
            (tmp22 * matrix14 + tmp14 * matrix2 + tmp19 * matrix6)),
        determinant * ((tmp22 * matrix10 + tmp16 * matrix2 + tmp21 * matrix6) -
            (tmp20 * matrix6 + tmp23 * matrix10 + tmp17 * matrix2)),
    ];
}

const subtractVectors = (vectorToSubtractFrom, vectorToSubtract) => {
    return [
        vectorToSubtractFrom[0] - vectorToSubtract[0],
        vectorToSubtractFrom[1] - vectorToSubtract[1],
        vectorToSubtractFrom[2] - vectorToSubtract[2],
    ];
}


const lookAt = (cameraPosition, target, up) => {
    const zAxis = normalize(
        subtractVectors(cameraPosition, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = normalize(cross(zAxis, xAxis));
    return [
        xAxis[0],
        xAxis[1],
        xAxis[2],
        0,
        yAxis[0],
        yAxis[1],
        yAxis[2],
        0,
        zAxis[0],
        zAxis[1],
        zAxis[2],
        0,
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        1,
    ];
}

const scaling = (x, y, z) => {
    return [
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1,
    ];
}


const identity = () => {
    return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
    ];
}

const perspective = (fieldOfViewInRadians, aspect, near, far) => {
    const scalingFactor = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInverse = 1.0 / (near - far);
    return [
        scalingFactor / aspect,
        0,
        0,
        0,
        0,
        scalingFactor,
        0,
        0,
        0,
        0,
        (near + far) * rangeInverse,
        -1,
        0,
        0,
        near * far * rangeInverse * 2,
        0,
    ];
}

const multiply = (firstMatrix, secondMatrix) => {
    const secondMatrix0 = secondMatrix[0];
    const secondMatrix1 = secondMatrix[1];
    const secondMatrix2 = secondMatrix[2];
    const secondMatrix3 = secondMatrix[3];
    const secondMatrix4 = secondMatrix[4];
    const secondMatrix5 = secondMatrix[5];
    const secondMatrix6 = secondMatrix[6];
    const secondMatrix7 = secondMatrix[7];
    const secondMatrix8 = secondMatrix[8];
    const secondMatrix9 = secondMatrix[9];
    const secondMatrix10 = secondMatrix[10];
    const secondMatrix11 = secondMatrix[11];
    const secondMatrix12 = secondMatrix[12];
    const secondMatrix13 = secondMatrix[13];
    const secondMatrix14 = secondMatrix[14];
    const secondMatrix15 = secondMatrix[15];
    const firstMatrix0 = firstMatrix[0];
    const firstMatrix1 = firstMatrix[1];
    const firstMatrix2 = firstMatrix[2];
    const firstMatrix3 = firstMatrix[3];
    const firstMatrix4 = firstMatrix[4];
    const firstMatrix5 = firstMatrix[5];
    const firstMatrix6 = firstMatrix[6];
    const firstMatrix7 = firstMatrix[7];
    const firstMatrix8 = firstMatrix[8];
    const firstMatrix9 = firstMatrix[9];
    const firstMatrix10 = firstMatrix[10];
    const firstMatrix11 = firstMatrix[11];
    const firstMatrix12 = firstMatrix[12];
    const firstMatrix13 = firstMatrix[13];
    const firstMatrix14 = firstMatrix[14];
    const firstMatrix15 = firstMatrix[15];
    return [
        secondMatrix0 * firstMatrix0 + secondMatrix1 * firstMatrix4 + secondMatrix2 * firstMatrix8 + secondMatrix3 * firstMatrix12,
        secondMatrix0 * firstMatrix1 + secondMatrix1 * firstMatrix5 + secondMatrix2 * firstMatrix9 + secondMatrix3 * firstMatrix13,
        secondMatrix0 * firstMatrix2 + secondMatrix1 * firstMatrix6 + secondMatrix2 * firstMatrix10 + secondMatrix3 * firstMatrix14,
        secondMatrix0 * firstMatrix3 + secondMatrix1 * firstMatrix7 + secondMatrix2 * firstMatrix11 + secondMatrix3 * firstMatrix15,
        secondMatrix4 * firstMatrix0 + secondMatrix5 * firstMatrix4 + secondMatrix6 * firstMatrix8 + secondMatrix7 * firstMatrix12,
        secondMatrix4 * firstMatrix1 + secondMatrix5 * firstMatrix5 + secondMatrix6 * firstMatrix9 + secondMatrix7 * firstMatrix13,
        secondMatrix4 * firstMatrix2 + secondMatrix5 * firstMatrix6 + secondMatrix6 * firstMatrix10 + secondMatrix7 * firstMatrix14,
        secondMatrix4 * firstMatrix3 + secondMatrix5 * firstMatrix7 + secondMatrix6 * firstMatrix11 + secondMatrix7 * firstMatrix15,
        secondMatrix8 * firstMatrix0 + secondMatrix9 * firstMatrix4 + secondMatrix10 * firstMatrix8 + secondMatrix11 * firstMatrix12,
        secondMatrix8 * firstMatrix1 + secondMatrix9 * firstMatrix5 + secondMatrix10 * firstMatrix9 + secondMatrix11 * firstMatrix13,
        secondMatrix8 * firstMatrix2 + secondMatrix9 * firstMatrix6 + secondMatrix10 * firstMatrix10 + secondMatrix11 * firstMatrix14,
        secondMatrix8 * firstMatrix3 + secondMatrix9 * firstMatrix7 + secondMatrix10 * firstMatrix11 + secondMatrix11 * firstMatrix15,
        secondMatrix12 * firstMatrix0 + secondMatrix13 * firstMatrix4 + secondMatrix14 * firstMatrix8 + secondMatrix15 * firstMatrix12,
        secondMatrix12 * firstMatrix1 + secondMatrix13 * firstMatrix5 + secondMatrix14 * firstMatrix9 + secondMatrix15 * firstMatrix13,
        secondMatrix12 * firstMatrix2 + secondMatrix13 * firstMatrix6 + secondMatrix14 * firstMatrix10 + secondMatrix15 * firstMatrix14,
        secondMatrix12 * firstMatrix3 + secondMatrix13 * firstMatrix7 + secondMatrix14 * firstMatrix11 + secondMatrix15 * firstMatrix15,
    ];
}
