import { Component ,OnInit} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
 import * as d3 from 'd3';
import *as $ from 'jquery';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page  {
content:any;
myRadio: any;
 constructor(private http: HttpClient){}
 ionViewDidEnter() {
     this.paint(2);
    this.mcqAnswer; 
  } 
   mcqAnswer(value)
{
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
 console.log(edges);
  nodes = Node;
 edges = Edge;
 nodes.forEach((d:any) => {
  //   //得到的数据默认每个属性的值都是字符串，因此需要进行转换
  d.x = undefined;
  d.y = undefined;
  // d.k = +d.k;
  d.id = +d.id - 1;
});
edges.forEach((d:any) => {
  d.source = +d.source - 1;
  d.target = +d.target - 1;
  d.length = +d.length;
}); 

const change = () => {
  let x = select.property('selectedIndex');
  console.log(x);
  this.deal(nodes, edges, x);
};
d3.select('select').remove();
var select = d3
  .select('#showGraph')
  .append('select')
  .on('change', change),
  options = select.selectAll('option').data(nodes); // Data join
 // Enter selection
 options
 .enter()
 .append('option')
 .text(function(d:any) {
     return d.name;
 });
 this.deal(nodes, edges, 0);

    });
}  
 deal (origin_nodes, origin_edges, x) {
  let nodes = JSON.parse(JSON.stringify(origin_nodes));
  let edges = JSON.parse(JSON.stringify(origin_edges));
  let n = nodes.length;
   //将边转换成邻接表的形式
  let graph = [];
  graph.length = n;
  for (let i = 0; i < n; ++i) {
      graph[i] = [];
  }
  console.log(origin_edges);
  edges.forEach((d) => {
      graph[d.source].push(d.target);
      graph[d.target].push(d.source);
  });
  
  this.dijkstra(nodes, graph, x);

  var linkImportScale;
  linkImportScale = d3
  .scaleOrdinal()
  .domain([
      'r_subdomain',
      'r_cert',
      'r_dns_a',
      'r_request_jump',
      'r_whois_name',
      'r_whois_email',
      'r_whois_phone',
      'r_cert_chain',
      'r_dns_cname',
      'r_cird',
      'r_asn',
  ])
  .range([8, 8, 8, 8, 4, 4, 4, 2, 2, 1, 1]);

  //处理出每条边的DOI值
  edges.forEach(function(d:any){
       d.doi =
          0.5 ** (nodes[d.source].dis + nodes[d.target].dis) *
          linkImportScale(d.relation);
  });
   edges.sort((a, b) => {
      return b.doi - a.doi;
  });

  //console.log(edges);
  let nodeSet = new Set([]);
  let nodesFinal = [];
  let edgesFinal = [];
  let maxSize =30;
   for (let i = 0; i < edges.length; ++i) {
      let d = edges[i];
      if (nodeSet.size >= maxSize) break;
      let flag = false;
      if (!nodeSet.has(d.source)) {
          nodeSet.add(d.source);
          nodesFinal.push(nodes[d.source]);
          flag = true;
      }
      if (!nodeSet.has(d.target)) {
          nodeSet.add(d.target);
          nodesFinal.push(nodes[d.target]);
          flag = true;
      }
      if (flag) {
          edgesFinal.push(d);
      }
  }
  this.createGraph(nodesFinal, edgesFinal, x);

};

 dijkstra(nodes, graph, x){
    let n = nodes.length;
    nodes.forEach((d) => {
        d.dis = 0x3f3f3f;
    });
    console.log(graph)
    nodes[x].dis = 0;
    for (let i = 0; i < graph[x].length; ++i) {
        nodes[graph[x][i]].dis = 1;
    }
    let vis = new Array(n).fill(0);
    vis[x] = 1;
    for (let i = 1; i < n; ++i) {
        //找到未标记的点中距离最近的
        let mind = 0x3f3f3f,
            minx = -1;
        nodes.forEach((d, i) => {
            if (!vis[i] && d.dis < mind) {
                mind = d.dis;
                minx = i;
            }
        });

        //将这个点标记
        vis[minx] = 1;

        //通过点minx对其他未标记的点进行松弛
        for (let i = 0; i < graph[minx].length; ++i) {
            let u = graph[minx][i];
            if (!vis[u] && nodes[minx].dis + 1 < nodes[u].dis) {
                nodes[u].dis = nodes[minx].dis + 1;
            }
        }
    }
};




 createGraph(nodes, edges, x) {
  function colorLegend(selection, props) {
    const {
        colorScale,
        circleRadius,
        spacing,
        textOffset,
        backgroundRectWidth,
        onClick,
        selected
    } = props;
    console.log(props)
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
const CollideRadius = 5;
 
const linkImportScale = d3
  .scaleOrdinal()
  .domain([
      'r_subdomain',
      'r_cert',
      'r_dns_a',
      'r_request_jump',
      'r_whois_name',
      'r_whois_email',
      'r_whois_phone',
      'r_cert_chain',
      'r_dns_cname',
      'r_cird',
      'r_asn',
  ])
  .range([8, 8, 8, 8, 4, 4, 4, 2, 2, 1, 1]);
  const PrimalStrength = -30;


  const margin = {
      // 四周的边距
      top: 30,
      right: 80,
      bottom: 5,
      left: 5,
  };
  const width = 1000,
  height = 800; // SVG的大小

  d3.selectAll('svg').remove();
  const svg = d3
      .select('#Chart2') // 添加SVG
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr("class","tab2")
      .attr('height', height + margin.top + margin.bottom)
      .call(
          d3
          .zoom()
          .scaleExtent([-5, 10])
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
  var content;
  content = svg
      .append('g') // 添加一个group包裹svg元素【节点、连边和文本】以进行缩放，目的是为了在缩放时不会影响整个容器的位置
      .attr('class', 'grapgContent')
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

  var nodeColorScale = d3
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

  function render () {
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

  var linkColorScale = d3
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
          '#cbf542',
      ]);

  /*----------初始化连边------------------------*/

  const link = content
      .selectAll('.links2')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'links2')
      .attr('stroke-width', '1px')
      .attr('stroke', (d) => linkColorScale(d.relation))
      .style('opacity', 1)
      .attr('id', (d) => 'line' + d.source + d.target)
      .attr('class', 'links2');
  //.attr('marker-end', 'url(#arrowhead)');

  const edgepaths = content
      .selectAll('.edgepath2') //连边上的标签位置,是的文字按照这个位置进行布局
      .data(edges)
      .enter()
      .append('path')
      .attr('class', 'edgepath2')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('id', function(d, i) {
          return 'edgepath2' + i;
      })
      .style('pointer-events', 'none');

  const edgelabels = content
      .selectAll('.edgelabel2')
      .data(edges)
      .enter()
      .append('text')
      .style('pointer-events', 'none')
      .attr('class', 'edgelabel2')
      .attr('id', function(d, i) {
          return 'edgelabel2' + i;
      })
      .attr('font-size', 15)
      .style('opacity', 1)
      .attr('fill', (d) => linkColorScale(d.relation));

      edgelabels
      .append('textPath') //要沿着<path>的形状呈现文本，请将文本包含在<textPath>元素中，该元素具有一个href属性，该属性具有对<path>元素的引用.
      .attr('xlink:href', function(d, i) {
          return '#edgepath2' + i;
      })
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .attr('startOffset', '50%')
      .text((d) => d.relation);

  /*----------------------初始化节点-----------------------------*/
  const node = content
      .selectAll('.nodes2')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'nodes2')
      .call(
          d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );
  const circle = node
      .append('circle')
      .style('stroke', 'red')
      .style('stroke-opacity', 1)
      .style('stroke-width', (d) => {
          if (d.id == x) {
              return 3;
          } else {
              return 0.1;
          }
      })
      .attr('fill', (d) => nodeColorScale(d.category));

  circle
      .append('title')
      .attr('dy', 4)
      .attr('dx', -15)
      .text((d) => d.k + ':' + d.name);

  /*---------------------定义力导引模型----------------------*/
  var simulation = d3
      .forceSimulation()
      
      .force(
          'charge',
          d3.forceManyBody().strength(PrimalStrength)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
          'collision',
          d3.forceCollide().radius(CollideRadius)
      );

  simulation.nodes(nodes).on('tick', ticked);
 
  var link_force =  d3.forceLink(edges)
  .id(function (d:any) { return d.id; }).distance(120).strength(0.1);
    simulation.force("link",link_force);

  // simulation.stop();

  /*---------------------自定义函数，用于图形缩放和力导引模型-------------*/
  function zoom_action() {
      // 控制图形的平移和缩放

      content.attr('transform', d3.event.transform);
      
  }
  this.content=content;
  function ticked() {
      //该函数在每次迭代force算法的时候，更新节点的位置(直接操作节点数据数组)。
      link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
          .attr('stroke', (d) => {
              if (
                  selected.size === 0 ||
                  (selected.has(nodeKindScale(d.source.category)) &&
                      selected.has(nodeKindScale(d.target.category)))
              ) {
                  //console.log('ok');
                  return linkColorScale(d.relation);
              } else {
                  return null;
              }
          });

      circle
          .attr('cy', (d) => d.y)
          .attr('cx', (d) => d.x)
          .attr('r', (d) => {
              //return 15;
              if (
                  selected.size === 0 ||
                  selected.has(nodeKindScale(d.category))
              ) {
                  return 15;
              } else {
                  return 0;
              }
          });

      edgepaths.attr('d', (d) => {
          if (
              selected.size === 0 ||
              (selected.has(nodeKindScale(d.source.category)) &&
                  selected.has(nodeKindScale(d.target.category)))
          ) {
              //console.log('ok');
              return (
                  'M ' +
                  d.source.x +
                  ' ' +
                  d.source.y +
                  ' L ' +
                  d.target.x +
                  ' ' +
                  d.target.y
              );
          } else {
              return null;
          }
      });
  }

  function dragstarted(d) {
      if (!d3.event.active)
          simulation.alphaTarget(0.3).restart();
      d.fy = d.y;
      d.fx = d.x;
  }

  function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
  }

  function dragended(d) {
      if (!d3.event.active) {
          simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
  }

  /*添加图例*/
  render();
}
}