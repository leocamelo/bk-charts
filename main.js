'use strict';

const fs      = require('fs');
const jsdom   = require('jsdom');
const d3      = require('d3');
const svg2png = require('svg2png');

const body = new jsdom.JSDOM().window.document.body;

const length = 10;
const radius = 30;
const offset =  5;

const canvasW  = (length * (radius * 2)) + (length * offset) + offset;
const canvasH  = (radius * 2) + (offset * 2);
const canvasVB = '0 0 ' + canvasW + ' ' + canvasH;

const cy = radius + offset;

const pngRatio = 2;
const pngArgs  = { width: canvasW * pngRatio };

const colors = {
  sorbus:   '#E96A3C',
  laurel:   '#70926C',
  maitai:   '#A96738',
  creamcan: '#F7C264'
};

const percents = [
  26.19, 11.9, 14.28, 21.42, 2.38, 7.14,
  4.76, 73.8, 59.52, 19.04, 47.61, 9.52,
  28.57, 30.95, 23.8, 57.14, 16.66, 35.71
];

function circleX(radius, offset, index) {
  return (radius * index) + (radius * (index - 1)) + (offset * index);
}

function circleRatio(length, index, percent) {
  const total = 100 / length;
  if (index * total <= percent) return 100;
  return Math.max(0, percent - ((index - 1) * total)) / (total * 0.01);
}

function circleRadius(limit, ratio) {
  return limit * 0.01 * ratio;
}

function fileName(color, ratio) {
  return color + '_' + ratio.toString().replace('.', '-') + '.png';
}

Object.keys(colors).forEach((color) => {
  percents.forEach((percent) => {
    let svg = d3.select(body)
                .append('svg')
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('viewBox', canvasVB)
                .attr('width', canvasW)
                .attr('height', canvasH);

    for (let index = 1; index <= length; index++) {
      let cx = circleX(radius, offset, index);
      let colorHex = colors[color];

      svg.append('circle')
         .attr('r', radius)
         .attr('cx', cx)
         .attr('cy', cy)
         .attr('fill', 'none')
         .attr('stroke', colorHex);

      svg.append('circle')
         .attr('r', circleRadius(radius, circleRatio(length, index, percent)))
         .attr('cx', cx)
         .attr('cy', cy)
         .attr('fill', colorHex);
    }

    let buffer = Buffer.from(body.innerHTML);
    body.innerHTML = '';

    svg2png(buffer, pngArgs).then((png) => {
      fs.writeFile('dist/' + fileName(color, percent), png, (err) => {
        if (err) throw err;
        console.log('Success!', color, percent);
      });
    });
  });
});
