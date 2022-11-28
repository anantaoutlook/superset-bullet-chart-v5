import React, { createRef, useEffect } from 'react';
import { getCategoricalSchemeRegistry } from '@superset-ui/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';

const categorialSchemeRegistry = getCategoricalSchemeRegistry();

export default function BullectChart(props: any) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉

  // console.log('child props', props.props);

  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.
  const svgRef = createRef<SVGSVGElement>();
  useEffect(() => {
    d3.select('#graphic').selectAll('svg').remove();
    props.props.data.forEach((selectedDatasetata: any, index: number) => {
      const selectedDataset = {
        data: selectedDatasetata,
        height: props.props.height,
        width: props.props.width,
        colorScheme: props.props.colorScheme,
        orderDesc: props.props.orderDesc,
        bulletColorScheme: props.props.bulletColorScheme,
        chartIndex: index,
      };
      render(svgRef, selectedDataset);
    });
  }, [props]);

  const render = (svgRef: any, selectedDataset: any) => {
    // custom colors theme
    let customColors: string[];
    const colorsValues = categorialSchemeRegistry.values();
    const filterColors: any = colorsValues.filter(
      (c: any) => c.id === selectedDataset.colorScheme,
    );
    const findLegendColorScheme: any = colorsValues.filter(
      (c: any) => c.id === selectedDataset.bulletColorScheme,
    );

    if (filterColors[0]) {
      customColors = [...filterColors[0].colors];
    }

    let legendBulletColor: Array<string> = [];
    if (findLegendColorScheme[0]) {
      legendBulletColor = [...findLegendColorScheme[0].colors];
    }

    const groupData = (data: any, total: any) => {
      let cumulative = 0;
      const _data = data
        .map((d: any) => {
          cumulative += d.metricpossiblevalues;
          return {
            metricpossiblevalues: d.metricpossiblevalues,
            cumulative: cumulative - d.metricpossiblevalues,
            metricvalue: d.metricvalue,
            period: d.period,
            company: d.company,
            metricpossible: d.metricpossible,
            percent: ((d.metricpossiblevalues / total) * 100).toFixed(2),
          };
        })
        .filter((d: any) => d.metricpossiblevalues > 0);
      return _data;
    };

    const config: any = {
      f: d3.format('.1f'),
      margin: {
        top: -50,
        right: 0,
        bottom: 0,
        left: 20,
      },
      barHeight: 20,
    };
    const { f, margin, barHeight } = config;
    const w = selectedDataset.width;
    const h = selectedDataset.height;
    const halfBarHeight = barHeight;
    const lineHeight = 1.1;

    //
    const getMetricPossible = (data: any) => {
      const rectangles: any = selection.selectAll('rect') || null;
      data.each(function (this: any) {
        const filterVal = rectangles[0].filter(
          (d: any, eleIndex: number) => data[0].indexOf(this) === eleIndex,
        );
        if (filterVal.length > 0) {
          wrap(this, parseFloat(filterVal[0].attributes[4].value) + 5);
        }
      });
    };

    // wrap text
    const wrap = (txt: any, data: any) => {
      const width = data;
      const text = d3.select(txt);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line: any = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const x = text.attr('x');
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy')) || 0;
      let tspan: any = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        const tspanWidth = tspan.node().getComputedTextLength() + 1;
        if (tspanWidth > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    };

    // find unique metric value
    function creatUniqueArray() {
      const unique = [];
      const distinct = [];
      // const result = [];
      for (let i = 0; i < selectedDataset.data.length; i++) {
        if (selectedDataset.data[i].metricpossible) {
          if (!unique[selectedDataset.data[i].metricpossible]) {
            distinct.push(selectedDataset.data[i]);
            unique[selectedDataset.data[i].metricpossible] = 1;
          }
        }
      }
      return distinct;
    }
    // find unique metric value
    function createCompanyArray() {
      const unique = [];
      const distinct = [];
      for (let i = 0; i < selectedDataset.data.length; i++) {
        if (selectedDataset.data[i].company) {
          if (!unique[selectedDataset.data[i].company]) {
            distinct.push(selectedDataset.data[i]);
            unique[selectedDataset.data[i].company] = 1;
          }
        }
      }
      for (let index = 0; index < distinct.length; index++) {
        distinct[index].color = legendBulletColor[index];
      }
      return distinct;
    }

    const resultset = creatUniqueArray();
    const uniqueCompanies = createCompanyArray();

    // draw indicator conditionally
    const getCompanyIndicator = (data: any) => {
      const matchingMatricValue = uniqueCompanies.filter(
        (d: any) => d.metricvalue === data.metricpossible,
      );
      return matchingMatricValue.length > 0 ? matchingMatricValue[0] : {};
    };

    const total = d3.sum(resultset, (d: any) => d.metricpossiblevalues);
    selectedDataset.orderDesc
      ? resultset.sort((a: any, b: any) => a.orderby - b.orderby)
      : resultset.sort((a: any, b: any) => b.orderby - a.orderby);

    // const middleIndex = resultset.indexOf(resultset[Math.round((resultset.length - 1) / 2)]);
    /* const middle =
      resultset.length / 2 +
      (resultset.length % 2 === 0 ? 1 : resultset.length % 2);
    const middleIndex: any = parseInt(middle + ''); */
    const _data = groupData(resultset, total);

    //generate random number
    const randomIntFromInterval = (min: number, max: number) => {
      // min and max included
      let num = Math.floor(Math.random() * (max - (min + 1)) + min);
      if (num % 5 === 0) {
        return num;
      } else {
        num = Math.round(num / 11) * 11;
        return num;
      }
    };
    //genratePoints to draw ppolylines and flip according to x position to left/right
    const pointsArray: any = [];
    const yPoints: any = [];
    const generatePoints = (d: any, index: any) => {
      // const polyLineHeight = 13;
      const pointFirstX =
        xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12;
      const pointFirstY = h / 2 + halfBarHeight * lineHeight - 20;
      let pointSecondX = pointFirstX;
      let pointSecondY = randomIntFromInterval(pointFirstY, h);
      if (yPoints.indexOf(pointSecondY) === -1) {
        yPoints.push(pointSecondY);
        pointsArray.push({
          index: index,
          x: pointSecondX,
          y: pointSecondY,
          percent: d.percent,
          points: `${pointFirstX} ${pointFirstY} ${pointSecondX} ${pointSecondY}`,
        });
      } else {
        generatePoints(d, index);
      }
      return true;
      /*  if (pointFirstX < w / 2) {
        pointSecondY = h - polyLineHeight * (index + 1);
      } else {
        pointSecondY = pointFirstY + polyLineHeight * (index + 1);
      } */
      // return `${pointFirstX} ${pointFirstY} ${pointSecondX} ${pointSecondY} ${pointThirdX} ${pointThirdY}`;
      // return `${pointFirstX} ${pointFirstY} ${pointSecondX} ${pointSecondY}`;
    };

    const getPoints = (data: any, index: any) => {
      const newArray = [...pointsArray];
      const originalArray = [...pointsArray];
      newArray.sort((a, b) => a.y - b.y);
      newArray.forEach((na: any) => {
        originalArray.forEach((oa: any) => {
          if (na.x === oa.x) oa.y = na.y;
        });
      });
      console.log('newArray', newArray);
      console.log('originalArray', originalArray);
      // console.log('pointsArray', pointsArray);
      const res = originalArray.filter(
        (d: any) => d.index === index && d.percent === data.percent,
      );
      return res[0].points;
    };

    //getPoints to draw text alignment
    const getTextAlignment = (d: any, index: any) => {
      const pointFirstX =
        xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12;
      let alignPos = '';
      if (pointFirstX < w / 2) {
        alignPos = 'start';
      } else {
        alignPos = 'end';
      }
      return alignPos;
    };

    // find polyline endX position to place text at same X postion
    const getPolylineEndX = (selectionS: any, d: any, index: any) => {
      /* const polylines: any = selectionS.selectAll('polyline') || null;
      const filterVal = polylines.filter(
        (d: any, eleIndex: number) => index === eleIndex,
      );
      const pointArr = filterVal[0][0].attributes[1].value.split(' ');
      const xCordinate =
        index < middleIndex
          ? pointArr[pointArr.length - 2] + 7
          : pointArr[pointArr.length - 2] - 5;
      return xCordinate; */
      const filter = pointsArray.filter((d: any) => d.index === index);
      return filter.length > 0 ? filter[0].x : 0;
    };

    // find polyline endY position to place text at same Y postion
    const getPolylineEndY = (d: any, index: any) => {
      /* const polyLineHeight = 13;
      const pointFirstX =
        xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12;
      let pointFirstY = h / 2 + halfBarHeight * lineHeight - 20;
      // let pointSecondY = 0
      if (pointFirstX < w / 2) {
        pointFirstY = h - polyLineHeight * (index + 1);
      } else {
        pointFirstY = pointFirstY + polyLineHeight * (index + 1);
        if (pointFirstY > h) {
          pointFirstY = pointFirstY + (polyLineHeight * (index - 1));
        }
      }
      return pointFirstY + 8; */
      /* console.log('pointsArray', pointsArray);
      console.log('index Y', pointsArray[index] ? pointsArray[index].y : 0); */
      const filter = pointsArray.filter((d: any) => d.index === index);
      return filter.length > 0 ? filter[0].y + 8 : 0;
    };

    // set up scales for horizontal placement
    const xScale = d3Scale
      .scaleLinear()
      .domain([0, total])
      .range([0, w - 20]);

    // create svg in passed in div
    // d3.select("#graphic").selectAll('svg').remove();
    // console.log('svgRef', svgRef);
    const selection = d3
      .select('#graphic')
      .append('svg')
      .attr('id', '#svg' + selectedDataset.chartIndex)
      // .attr('style', 'outline: thin solid #187581;')
      .attr('width', w)
      .attr('height', _data.length === 1 ? 100 : h)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // legend on top company, period
    selection
      .selectAll('.legend-label-top')
      .data(_data)
      .enter()
      .append('text')
      .attr('class', 'legend-label-top')
      // .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('x', -10)
      .attr('y', (d: any, i) => h / 2 - halfBarHeight * 2.2)
      .text((d: any, index: number) =>
        index === 0
          ? selectedDataset.chartIndex + 1 + '. ' + d.company + ', ' + d.period
          : '',
      );

    // stack rect for each data value
    // d3.selectAll('rect').remove();
    selection
      .selectAll('rect')
      .data(_data)
      .enter()
      .append('rect')
      .attr('class', 'rect-stacked')
      .attr('x', (d: any) => xScale(d.cumulative)! - 12)
      .attr('y', h / 2 - halfBarHeight)
      .attr('height', barHeight)
      .attr('width', (d: any) => xScale(d.metricpossiblevalues)!)
      .style('fill', (d, i) => customColors[i + 4])
      .text((d: any) =>
        f(d.percent) < 5
          ? f(d.percent) + '%, ' + ' ' + d.metricpossible
          : f(d.percent) + '%',
      );

    // add image on top of bar(indicator)
    // d3.selectAll(
    //   '.indicator-row-one',
    // ).remove();
    selection
      .selectAll('.indicator-row-one')
      .data(_data)
      .enter()
      .append('text')
      .attr('class', 'indicator-row-one')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr(
        'x',
        (d: any) =>
          xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12,
      )
      .attr('y', (d: any, i) => h / 2 - halfBarHeight * 1.1)
      .text((d: any) =>
        getCompanyIndicator(d).metricvalue === d.metricpossible ? '▼' : '',
      );

    // add some labels for percentages
    // d3.selectAll('.text-percent').remove();
    selection
      .selectAll('.text-percent')
      .data(_data)
      .enter()
      .append('text')
      .attr('class', 'text-percent')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr(
        'x',
        (d: any) =>
          xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12,
      )
      .attr('y', h / 2 - halfBarHeight / 2.5)
      .text((d: any) => (f(d.percent) > 5 ? '' : ''));

    // add the labels below bar
    // d3.select('#svg' + selectedDataset.chartIndex)
    //   .selectAll('text-label')
    //   .remove();
    selection
      .selectAll('text-label')
      .data(_data)
      .enter()
      .append('text')
      .attr('class', 'text-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr(
        'x',
        (d: any) =>
          xScale(d.cumulative)! + xScale(d.metricpossiblevalues)! / 2 - 12,
      )
      .attr('y', h / 2 + 15)
      .style('fill', '#000')
      .attr('width', (d: any) => xScale(d.metricpossiblevalues)! / 3)
      .html((d: any) =>
        f(d.percent) < 5
          ? ''
          : d.metricpossible +
            ', <span style="font-weight: bold;">' +
            f(d.percent) +
            '%</span>',
      )
      .call(getMetricPossible);

    // draw polylines
    // d3.selectAll('polyline').remove();
    selection
      .selectAll('polylines')
      .data(_data)
      .enter()
      .append('text')
      .style('stroke', 'white')
      .style('fill', 'none')
      .attr('stroke-width', 0)
      .attr('points', (d: any, index: any) =>
        f(d.percent) < 5 ? generatePoints(d, index) : '',
      );
    selection
      .selectAll('polyline')
      .data(_data)
      .enter()
      .append('polyline')
      .style('stroke', 'black')
      .style('fill', 'none')
      .attr('stroke-width', 0.6)
      .attr('points', (d: any, index: any) =>
        f(d.percent) < 5 ? getPoints(d, index) : '',
      );
    // append text at the end of line
    // d3.selectAll('line-text').remove();
    selection
      .selectAll('line-text')
      .data(_data)
      .enter()
      .append('text')
      .attr('class', 'line-text')
      // .attr('text-anchor', 'middle')
      .attr('text-anchor', (d: any, index: any) => getTextAlignment(d, index))
      .attr('font-size', '9px')
      .attr('x', (d: any, index: any) =>
        isNaN(getPolylineEndX(selection, d, index))
          ? ''
          : getPolylineEndX(selection, d, index),
      )
      .attr('y', (d: any, index: any) => getPolylineEndY(d, index) + 2)
      .text((d: any) =>
        f(d.percent) < 5 ? d.metricpossible + ', ' + f(d.percent) + '%' : '',
      );

    /* // Legends drawing
    const size = 10;
    selection
      .selectAll('legend-circle')
      .data(uniqueCompanies)
      .enter()
      .append('rect')
      .attr('x', (d: any, i: any) => i * (w / uniqueCompanies.length))
      .attr('y', h / 2 + 30)
      .attr('width', size)
      .attr('height', size)
      .style('fill', (d: any, index: any) => d.color);

    // legend labels
    d3.selectAll('legend-label').remove();
    selection
      .selectAll('.legend-label')
      .data(uniqueCompanies)
      .enter()
      .append('text')
      .attr('class', 'legend-label')
      .attr('font-size', '11px')
      .attr('x', (d: any, i: any) => i * (w / uniqueCompanies.length) + 15)
      .attr('y', h / 2 + 38) 
      .style('fill', (d: any, index: any) => d.color)
      .text((d: any) => d.company)
      .attr('text-anchor', 'left'); */
  };

  return <div id="graphic" style={{ padding: '0px 50px' }}></div>;
}
