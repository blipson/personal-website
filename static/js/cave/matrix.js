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

const subtractVectors = (vector1, vector2) => {
    return [
        vector1[0] - vector2[0],
        vector1[1] - vector2[1],
        vector1[2] - vector2[2],
    ];
}


const lookAt = (cameraPosition, target, up) => {
    const zAxis = normalizeVector(
        subtractVectors(cameraPosition, target));
    const xAxis = normalizeVector(cross(up, zAxis));
    const yAxis = normalizeVector(cross(zAxis, xAxis));
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

