import { Component, OnInit,ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-case2',
  templateUrl: './case2.page.html',
  styleUrls: ['./case2.page.scss'],
})
export class Case2Page {
  

  width = 500;
  height = 500; // SVG的大小
x0 = this.width / 2;
y0 = this.height / 2;
content:any;
   constructor(private http: HttpClient){}
ionViewDidEnter() {
  this.paint(2);
     this.mcqAnswer;
   } 
   mcqAnswer(value)
{
  console.log(value.detail.value);
  this.paint(value.detail.value);
  
}
  paint(index){
    d3.selectAll('svg').remove();
    const requestData = (path) => {
      return new Promise((resolve, reject) => {
  
          const xmlhttprequest = new XMLHttpRequest();
          xmlhttprequest.open("GET", "http://www.wangjiangkui.ltd:8080/AjaxCrossDomain-1.0-SNAPSHOT/requestDataServlet?path=" + path, true);
          xmlhttprequest.onreadystatechange = () => {
              if (xmlhttprequest.readyState == 4 && xmlhttprequest.status == 200) {
                  console.log("开始请求数据");
                  // console.log(xmlhttprequest.responseText);
                  let data = xmlhttprequest.responseText.split('\n');
                  // console.log(data);
                  let header = data[0].split(',');
                  // console.log(header);
                  let ret = [];
                  for (let i = 1; i < data.length - 1; ++i) {
                      let item = data[i].split(',');
                      // console.log(item);
                      let obj = {};
                      for (let j = 0; j < item.length; ++j) {
                          obj[header[j].trim()] = item[j].trim();
                      }
                      ret.push(obj);
                  }
                  // console.log(ret);
                  resolve(ret);
              }
          }
          xmlhttprequest.send();
      }).then((ret) => ret);
  
  }
   


  Promise.all([
    requestData('data/output' + index + '.csv'),
    requestData('data/input' + index + '.csv'),
    //csv('data/ph.csv'),
]).then(([Node, Edge]) => {
  let nodes;
let edges
   nodes = Node;
 edges = Edge;
  nodes.forEach((d) => {
      //   //得到的数据默认每个属性的值都是字符串，因此需要进行转换
      d.x = +d.x + this.x0;
      d.y = +d.y + this.y0;
      d.k = +d.k;
      d.id = +d.id;
  });
  edges.forEach((d) => {
      d.source = +d.source;
      d.target = +d.target;
      d.length = +d.length;
  });
  console.log(nodes)
  this.createGraph(nodes, edges);

});
  }

  createGraph(nodes, edges) {
    const margin = {
        // 四周的边距
        top: 30,
        right: 80,
        bottom: 5,
        left: 5,
    };

    const svg = d3
        .select('#showGraphcase2') // 添加SVG
        .append('svg')
        .attr('width', this.width + margin.left + margin.right)
        .attr('height', this.height + margin.top + margin.bottom)
        .call(
            d3
            .zoom()
            .scaleExtent([-5, 5])
            .on('zoom', zoom_action)
        ); // 添加平移和缩放功能

    const colorLegendG = svg
        .append('g')
        .attr('transform', `translate(30, 30)`);

    var selected = new Set([]);
    var onClick = (d, i) => {
        if (selected.has(i)) {
            selected.delete(i);
        } else {
            selected.add(i);
        }
        console.log(selected);
        render();
    };

    const content = svg
        .append('g') // 添加一个group包裹svg元素【节点、连边和文本】以进行缩放，目的是为了在缩放时不会影响整个容器的位置
        .attr('class', 'grapgContentcase2')
        .attr(
            'transform',
            `translate(${margin.left},${margin.top})`
        );

    content
        .append('defs')
        .append('marker') //三角形【箭头】
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 5) // 标记点的x坐标。如果圆更大，这个也需要更大
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    var nodeColorScale;
    nodeColorScale = d3
        .scaleOrdinal() // 自定义节点的颜色     =d3.scaleOrdinal(d3.schemeSet2)
        .domain([
            'Domain',
            'IP',
            'Cert_SHA256',
            'IP_CIDR',
            'ASN',
            'Whois_Name',
            'Whois_Email',
            'Whois_Phone',
        ])
        .range([
            '#ff9e6d',
            '#86cbff',
            '#c2e5a0',
            '#fff686',
            '#9e79db',
            '#8dd3c7',
            'aquamarine',
            'aqua',
            'crimson',
        ]);

    var nodeKindScale = d3
        .scaleOrdinal()
        .domain([
            'Domain',
            'IP',
            'Cert_SHA256',
            'IP_CIDR',
            'ASN',
            'Whois_Name',
            'Whois_Email',
            'Whois_Phone',
        ])
        .range([0, 1, 2, 3, 4, 5, 6, 7]);

    console.log(nodeKindScale('Domain'));
    const colorLegend = (selection, props) => {
      const {
          colorScale,
          circleRadius,
          spacing,
          textOffset,
          backgroundRectWidth,
          onClick,
          selected
      } = props;

      const backgroundRect = selection.selectAll('rect')
          .data([null]);

      const n = colorScale.domain().length;
      backgroundRect.enter().append('rect')
          .merge(backgroundRect)
          .attr('x', -circleRadius * 2)
          .attr('y', -circleRadius * 2)
          .attr('rx', circleRadius * 2)
          .attr('width', backgroundRectWidth)
          .attr('height', spacing * n + circleRadius * 3)
          .attr('fill', '#C0C0BB')
          .attr('opacity', 0.8);

      const groups = selection.selectAll('.tick')
          .data(colorScale.domain());

      const groupEnter = groups.enter().append('g')
          .attr('class', 'tick')
          .attr('transform', (d, i) =>
              `translate(0, ${i*spacing+circleRadius})`);
      groupEnter
          .merge(groups)
          .attr('opacity', (d, i) => {
              if (selected.size === 0 || selected.has(i)) return 1;
              else return 0.2;
          })
          .on('click', onClick);

      groups.exit().remove();

      groupEnter
          .append('circle')
          .attr('r', 0)
          .merge(groups.select('circle')) //both enter section and update section
          .attr('fill', colorScale)
          .transition().duration(1000)
          .attr('r', circleRadius);

      const text = groups.select('text');

      groupEnter.append('text')
          .attr('x', textOffset)
          .attr('dy', '0.32em')
          //.merge(text)	//both enter section and update section
          .text(d => typeof(d) === 'undefined' ? 'undefined' : d);

  };
    var render = () => {
        colorLegendG.call(colorLegend, {
            colorScale: nodeColorScale,
            circleRadius: 8,
            spacing: 20,
            textOffset: 15,
            backgroundRectWidth: 130,
            onClick,
            selected,
        });
        ticked();
    };

    var linkColorScale;
    linkColorScale = d3
        .scaleOrdinal() // 自定义连边的颜色
        .domain([
            'r_dns_a',
            'r_dns_cname',
            'r_cidr',
            'r_subdomain',
            'r_asn',
            'r_whois_name',
            'r_whois_email',
            'r_whois_phone',
            'r_cert',
            'r_certchain',
            'r_request_jump',
        ])
        .range([
            '#ff9e6d',
            '#86cbff',
            '#c2e5a0',
            '#9e79db',
            '#8dd3c7',
            'aquamarine',
            'aqua',
            'crimson',
            '#fff686',
        ]);

    /*----------初始化连边------------------------*/

    const link = content
        .selectAll('.links')
        .data(edges)
        .enter()
        .append('line')
        .attr('class', 'links')
        .attr('stroke-width', '0.5px')
        .style('opacity', 0.8)
        .attr('id', (d:any) => 'line' + d.source + d.target)
        .attr('class', 'links');
    //.attr('marker-end', 'url(#arrowhead)');

    /*----------------------初始化节点-----------------------------*/
    const node = content
        .selectAll('.nodes')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'nodes')
        .call(
            d3
            .drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );
    const circle = node
        .append('circle')
        .style('stroke', 'grey')
        .style('stroke-opacity', 0.8)
        .style('stroke-width', (d:any) => d.runtime / 10)
        .attr('r', 5)
        .attr('fill', (d:any) => nodeColorScale(d.category));

    circle
        .append('title')
        .attr('dy', 4)
        .attr('dx', -15)
        .text((d:any) => d.k + ':' + d.name);

    /*---------------------定义力导引模型----------------------*/
   
    var simulation = d3
    .forceSimulation();
    simulation.nodes(nodes).on('tick', ticked);
    var link_force =  d3.forceLink(edges)
    .id(function (d:any) { return d.id; }).distance((d:any, i) => {
        const x = d.source.x - d.target.x;
        const y = d.source.y - d.target.y;
        const w = Math.sqrt(x * x + y * y);
        d.w = w;
        return w;
    }).strength(0.1);
      simulation.force("link",link_force);


    simulation.stop();

    /*---------------------自定义函数，用于图形缩放和力导引模型-------------*/
    function zoom_action() {
        // 控制图形的平移和缩放
        content.attr('transform', d3.event.transform);
    }
    this.content=content;
    function ticked() {
        //该函数在每次迭代force算法的时候，更新节点的位置(直接操作节点数据数组)。
        link
            .attr('x1', (d:any) => d.source.x)
            .attr('y1', (d:any) => d.source.y)
            .attr('x2', (d:any) => d.target.x)
            .attr('y2', (d:any) => d.target.y)
            .attr('stroke', (d:any) => {
                if (
                    selected.size === 0 ||
                    (selected.has(
                            nodeKindScale(d.source.category)
                        ) &&
                        selected.has(
                            nodeKindScale(d.target.category)
                        ))
                ) {
                    
                    return linkColorScale(d.relation);
                } else {
                    return null;
                }
            });

        circle
            .attr('cy', (d:any) => d.y)
            .attr('cx', (d:any) => d.x)
            .attr('r', (d:any) => {
                if (
                    selected.size === 0 ||
                    selected.has(nodeKindScale(d.category))
                ) {
                    return 5;
                } else {
                    return 0;
                }
            });
        /*
        edgepaths.attr(
          'd',
          (d) =>
            'M ' +
            d.source.x +
            ' ' +
            d.source.y +
            ' L ' +
            d.target.x +
            ' ' +
            d.target.y
        );
        */
    }

    function dragstarted(d) {
        if (!d3.event.active)
            simulation.alphaTarget(0.3).restart();
        d.fy = d.y + this.x0;
        d.fx = d.x + this.y0;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) {
            //simulation.alphaTarget(0);
            simulation.stop();
        }
        d.fx = null;
        d.fy = null;
    }

    /*添加图例*/
    render();
}
 

}
