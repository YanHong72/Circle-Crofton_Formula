# Circle-Crofton_Formula

An interactive bilingual website for numerically exploring Crofton's formula for circles of fixed radius.

Users draw a curve in the coordinate region \([-2,2] \times [-2,2]\). The website generates uniformly distributed circles, counts their intersections with the drawn curve, and compares the curve's point-by-point length with the Crofton estimate

\[
\widehat{L}=\frac{N}{m}\frac{A}{4r}.
\]

Here, \(N\) is the total number of intersections, \(m\) is the number of circles, \(A=16\) is the sampling area, and \(r\) is the fixed circle radius.

## Features

- Draw a curve with a mouse or touch screen
- Choose 10–50,000 circles and a fixed radius
- Use a new random seed each time or a reproducible fixed seed
- Show or hide circles and intersection points
- Compare the measured polyline length with the Crofton estimate
- Switch between Traditional Chinese and English

## Website files

The complete static website is in `dist/`:

- `dist/index.html`
- `dist/styles.css`
- `dist/app.js`

No installation or build step is required.
