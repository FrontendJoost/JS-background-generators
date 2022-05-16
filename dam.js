// A js plugin for generating geometric triangle background.

class Gradient {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  point(pos) {
    const r = Math.floor(this.from.r + (this.to.r - this.from.r) * pos);
    const g = Math.floor(this.from.g + (this.to.g - this.from.g) * pos);
    const b = Math.floor(this.from.b + (this.to.b - this.from.b) * pos);
    return new Color(r, g, b);
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Triangle {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
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
    const fromColor = Color.fromHex(this.options.gradient.from);
    const toColor = Color.fromHex(this.options.gradient.to);
    this.gradient = new Gradient(fromColor, toColor);
    this.init();
  }

  init() {
    // Create a 2d array
    for (let i = 0; i < this.options.w + 3; i++) {
      this.points[i] = [];
      for (let j = 0; j < this.options.h + 3; j++) {
        const x = ((i - 1) * this.canvas.width) / this.options.w;
        const y = ((j - 1) * this.canvas.height) / this.options.h;
        this.points[i][j] = new Point(x, y);
      }
    }
    this.randomizePoints(this.options.randomness);
    // this.generateDots();
    this.generateTriangles();
    this.drawTriangles(this.gradient, this.options.gradient.randomness);
  }

  generateTriangles() {
    for (let x = 0; x < this.points.length - 1; x++) {
      for (let y = 0; y < this.points[x].length - 1; y++) {
        const point = this.points[x][y];
        const a = new Point(point.x, point.y);
        const b = new Point(
          this.points[x + 1][y + 1].x,
          this.points[x + 1][y + 1].y
        );
        const c = new Point(this.points[x][y + 1].x, this.points[x][y + 1].y);
        const triangle = new Triangle(a, b, c);
        this.triangles.push(triangle);
      }
    }
    for (let x = 0; x < this.points.length - 1; x++) {
      for (let y = 0; y < this.points[x].length - 1; y++) {
        const point = this.points[x][y];
        const a = new Point(point.x, point.y);
        const b = new Point(
          this.points[x + 1][y + 1].x,
          this.points[x + 1][y + 1].y
        );
        const c = new Point(this.points[x + 1][y].x, this.points[x + 1][y].y);
        const triangle = new Triangle(a, b, c);
        this.triangles.push(triangle);
      }
    }
  }

  drawTriangles(gradient, randomness) {
    this.triangles.forEach((triangle) => {
      var pos = triangle.a.x / this.canvas.width;
      triangle.draw(this.ctx, gradient.point(pos).randomize(randomness));
    });
  }

  randomizePoints(amount) {
    for (let x = 0; x < this.points.length; x++) {
      for (let y = 0; y < this.points[x].length; y++) {
        const point = this.points[x][y];
        point.x += Math.floor((Math.random() * 2 - 1) * amount);
        point.y += Math.floor((Math.random() * 2 - 1) * amount);
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
