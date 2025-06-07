(() => {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');
  if(!gl) {
    console.error('WebGL not supported');
    return;
  }

  const SAMPLES = 30; // number of points per row/column

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  const vsSource = `
attribute vec2 aPosition;
attribute vec3 aColor;
varying vec3 vColor;
void main() {
  gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);
  vColor = aColor;
}`;

  const fsSource = `
precision mediump float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}`;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function link(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
  }

  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = link(gl, vs, fs);
  gl.useProgram(program);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aColor = gl.getAttribLocation(program, 'aColor');
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  function randomPoints(hue) {
    const width = SAMPLES;
    const height = SAMPLES;
    const num = width * height;
    const points = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = num - (height * y + x);
        let h = hue + 120 * ((Math.round(Math.random() * 4 - 2) + x) / width + (Math.round(Math.random() * 4 - 2) + y) / height) / 2;
        if (h > 360) h -= 360;
        const c = 80;
        const l = 80 - 60 * ((Math.round(Math.random() * 4 - 2) + x) / width + (Math.round(Math.random() * 4 - 2) + y) / height) / 2 + 20 * (i / num);
        const rgb = d3.hcl(h, c, l).rgb();
        points.push([
          x / width + (Math.random() * 0.1 - 0.05),
          y / height + (Math.random() * 0.1 - 0.05),
          [rgb.r / 255, rgb.g / 255, rgb.b / 255]
        ]);
      }
    }
    return points;
  }

  function pointsFromImage(img) {
    const samplesX = SAMPLES;
    const samplesY = SAMPLES;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = samplesX;
    ctx.canvas.height = samplesY;
    const imgRatio = img.width / img.height;
    const canvasRatio = samplesX / samplesY;
    let sx, sy, sw, sh;
    if (imgRatio > canvasRatio) {
      sh = img.height;
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / canvasRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, samplesX, samplesY);
    const pixels = ctx.getImageData(0, 0, samplesX, samplesY).data;
    const pts = [];
    for (let y = 0; y < samplesY; y++) {
      for (let x = 0; x < samplesX; x++) {
        const p = 4 * (y * samplesX + x);
        pts.push([
          x / samplesX + (Math.random() * 0.1 - 0.05),
          y / samplesY + (Math.random() * 0.1 - 0.05),
          [pixels[p] / 255, pixels[p + 1] / 255, pixels[p + 2] / 255]
        ]);
      }
    }
    return pts;
  }

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(pointsFromImage(img));
      img.src = src;
    });
  }

  function setTarget(points) {
    currentPoints = interpolatePoints(0);
    targetPoints = points;
    progress = 0;
  }

  let currentPoints = randomPoints(Math.random() * 360);
  let targetPoints = randomPoints(Math.random() * 360);
  let progress = 0;
  const duration = 10000;
  let lastTime = 0;

  function interpolatePoints(dt) {
    progress += dt / duration;
    if (progress >= 1) {
      progress = 1;
      currentPoints = targetPoints;
    }
    const t = progress;
    return currentPoints.map((p, i) => {
      const np = targetPoints[i];
      return [
        p[0] * (1 - t) + np[0] * t,
        p[1] * (1 - t) + np[1] * t,
        [
          p[2][0] * (1 - t) + np[2][0] * t,
          p[2][1] * (1 - t) + np[2][1] * t,
          p[2][2] * (1 - t) + np[2][2] * t
        ]
      ];
    });
  }

  function buildGeometry(points) {
    const delaunay = d3.Delaunay.from(points.map(p => [p[0], p[1]]));
    const voronoi = delaunay.voronoi([0, 0, 1, 1]);
    const vertices = [];
    const colors = [];
    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (!cell) continue;
      let cx = 0, cy = 0;
      cell.forEach(pt => { cx += pt[0]; cy += pt[1]; });
      cx /= cell.length;
      cy /= cell.length;
      for (let j = 0; j < cell.length; j++) {
        const p1 = cell[j];
        const p2 = cell[(j + 1) % cell.length];
        vertices.push(cx, cy, p1[0], p1[1], p2[0], p2[1]);
        const c = points[i][2];
        colors.push(c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2]);
      }
    }
    return { vertices, colors };
  }

  function render(time) {
    const dt = time - lastTime;
    lastTime = time;

    const interp = interpolatePoints(dt);
    const geom = buildGeometry(interp);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, geom.vertices.length / 2);

    requestAnimationFrame(render);
  }

  const changeInterval = setInterval(() => {
    setTarget(randomPoints(Math.random() * 360));
  }, 10000);

  document.ondragover = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  document.ondrop = e => {
    e.preventDefault();
    clearInterval(changeInterval);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.match(/image.*/)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          loadImage(reader.result).then(setTarget);
        };
        reader.readAsDataURL(files[i]);
        break;
      }
    }
  };

  requestAnimationFrame(render);
})();
