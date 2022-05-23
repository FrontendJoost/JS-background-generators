// A js plugin for generating geometric triangle background.

class Gradient {
  constructor(colors) {
    this.colors = colors;
  }

  point(pos) {
    var index = Math.floor(Math.abs(pos) * (this.colors.length - 1));
    if (index >= this.colors.length - 1) {
      index = this.colors.length - 2;
    }
    console.log(pos);
    const from = this.colors[index];
    const to = this.colors[index + 1];

    pos = pos * (this.colors.length - 1) - index;

    // console.log(pos);

    const r = Math.floor(from.r + (to.r - from.r) * pos);
    const g = Math.floor(from.g + (to.g - from.g) * pos);
    const b = Math.floor(from.b + (to.b - from.b) * pos);
    return new Color(r, g, b);
    // return new Color(255, 255, 255);
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  randomize(amount) {
    const r =
      this.r + Math.floor(Math.random() * (amount - -amount + 1)) + -amount;
    const g =
      this.g + Math.floor(Math.random() * (amount - -amount + 1)) + -amount;
    const b =
      this.b + Math.floor(Math.random() * (amount - -amount + 1)) + -amount;
    return new Color(r, g, b);
  }

  toRgbString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  static fromHex(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return new Color(r, g, b);
  }
}

class Point {
  constructor(x, y, localX, localY) {
    this.x = x;
    this.y = y;
    this.localX = localX;
    this.localY = localY;
  }
}

class Triangle {
  constructor(a, b, c, aNR, BNR, cNR) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.aNR = aNR;
    this.BNR = BNR;
    this.cNR = cNR;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(this.a.x, this.a.y);
    ctx.lineTo(this.b.x, this.b.y);
    ctx.lineTo(this.c.x, this.c.y);
    ctx.closePath();
    ctx.fillStyle = color.toRgbString();
    ctx.strokeStyle = color.toRgbString();
    ctx.fill();
    ctx.stroke();
  }
}

class DAM {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.options = options;
    this.points = [];
    this.triangles = [];
    this.pointsNotRandomized = [];
    var colors = [];
    for (let i = 0; i < options.gradient.length; i++) {
      colors.push(Color.fromHex(options.gradient[i]));
    }
    this.gradient = new Gradient(colors);
    this.init();
  }

  init() {
    this.randomizeSize();

    // Create a 2d array
    for (let i = 0; i < this.options.x + 3; i++) {
      this.points[i] = [];
      for (let j = 0; j < this.options.y + 3; j++) {
        const x = ((i - 1) * this.canvas.width) / this.options.x;
        const y = ((j - 1) * this.canvas.height) / this.options.y;
        this.points[i][j] = new Point(
          x,
          y,
          i / (this.options.x + 3),
          j / (this.options.y + 3)
        );
      }
    }
    this.pointsNotRandomized = JSON.parse(JSON.stringify(this.points));

    this.randomizePoints(
      this.options.randomness.pos,
      this.options.randomness.pos / this.canvas.width
    );
    // this.generateDots();
    this.generateTriangles();
    this.drawTriangles(this.gradient, this.options.randomness.color);
  }

  randomizeSize() {
    this.options.x +=
      Math.floor(Math.random() * this.options.randomness.size * 2) -
      this.options.randomness.size;
    this.options.y +=
      Math.floor(Math.random() * this.options.randomness.size * 2) -
      this.options.randomness.size;
  }

  generateTriangles() {
    for (let x = 0; x < this.points.length - 1; x++) {
      for (let y = 0; y < this.points[x].length - 1; y++) {
        const a = this.points[x][y];
        const b = this.points[x + 1][y + 1];
        const c = this.points[x][y + 1];
        const aNR = this.pointsNotRandomized[x][y];
        const bNR = this.pointsNotRandomized[x + 1][y + 1];
        const cNR = this.pointsNotRandomized[x][y + 1];
        const triangle = new Triangle(a, b, c, aNR, bNR, cNR);
        this.triangles.push(triangle);
      }
    }
    for (let x = 0; x < this.points.length - 1; x++) {
      for (let y = 0; y < this.points[x].length - 1; y++) {
        const a = this.points[x][y];
        const b = this.points[x + 1][y + 1];
        const c = this.points[x + 1][y];
        const aNR = this.pointsNotRandomized[x][y];
        const bNR = this.pointsNotRandomized[x + 1][y + 1];
        const cNR = this.pointsNotRandomized[x + 1][y];
        const triangle = new Triangle(a, b, c, aNR, bNR, cNR);
        this.triangles.push(triangle);
      }
    }
  }

  getGradientPos(a) {
    const beta = (Math.atan(a.localY / a.localX) * 180) / Math.PI || 0;
    const OA = Math.sqrt(a.localX * a.localX + a.localY * a.localY);
    const gamma = beta - this.options.angle;
    const OB = OA * Math.cos((gamma * Math.PI) / 180);
    return OB;
  }

  drawTriangles(gradient, randomness) {
    this.triangles.forEach((triangle) => {
      var pos = this.getGradientPos(triangle.aNR);
      triangle.draw(this.ctx, gradient.point(pos).randomize(randomness));
    });
  }

  randomizePoints(amount, localAmount) {
    for (let x = 0; x < this.points.length; x++) {
      for (let y = 0; y < this.points[x].length; y++) {
        const point = this.points[x][y];
        point.x += Math.floor((Math.random() * 2 - 1) * amount);
        point.y += Math.floor((Math.random() * 2 - 1) * amount);
        point.localX += Math.floor((Math.random() * 2 - 1) * localAmount);
        point.localY += Math.floor((Math.random() * 2 - 1) * localAmount);
      }
    }
  }

  generateDots() {
    this.ctx.fillStyle = "black";
    for (let x = 0; x < this.points.length; x++) {
      for (let y = 0; y < this.points[x].length; y++) {
        const point = this.points[x][y];
        this.ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
      }
    }
  }

  generate() {}
}
