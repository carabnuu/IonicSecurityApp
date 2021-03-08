import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3'
import * as $ from 'jquery'
@Component({
  selector: 'app-view2',
  templateUrl: './view2.page.html',
  styleUrls: ['./view2.page.scss'],
})
export class View2Page implements OnInit {
  
  constructor() {

    
   }

  ngOnInit() {
    this.read_data();
    this.mounted()
  }
     content:any;
     nodes:any;
     links:any;
     edgelabels:any;
     graphNodes:any;
     graphLinks:any;
     svgLinks:any;
     svgNodes:any;
     svgEdgepaths:any;
     svgEdgelabels:any;
     svgNodeText:any;
     simulation:any;
     timeLine : { date: any; index: number; }[];
     tiemCircle:59;
     dateColor:0;
     tooltip_value:{
        'name':'name',
        'type':'domain'
      };
    
      node_types(){
        let k=[
        "Domain",
        "IP",
        "Cert_SHA256",
        "IP_CIDR",
        "ASN",
        "Whois_Name",
        "Whois_Email",
        "Whois_Phone",
      ];
      return k;
    };
      link_types(){
        let k=[
        "r_dns_a",
        "r_dns_cname",
        "r_cert",
        "r_cidr",
        "r_asn",
        "r_whois_name",
        "r_whois_email",
        "r_whois_phone",
        "r_subdomain",
        "r_certchain",
        "r_request_jump",
      ];
      return k;
    };
      ip_timeline:any; 
       
        

  read_data(){
    this.ip_timeline = require('../../assets/demo_data/nnnn.json');
    //console.log(data1);
  }


     

    createGraph(nodes, edges) {
      const that = this;
      const nodeColorScale = d3
      .scaleOrdinal()
      .domain(this.node_types())
      .range([
        "#ff9e6d",
        "#86cbff",
        "#c2e5a0",
        "#fff686",
        "#9e79db",
        "#8dd3c7",
        "aquamarine",
        "aqua",
      ]);
    
    // 自定义连边的颜色
    const linkColorScale = d3
      .scaleOrdinal()
      .domain(this.link_types())
      .range([
        "#ff9e6d",
        "#86cbff",
        "#c2e5a0",
        "#fff686",
        "#9e79db",
        "#8dd3c7",
        "aquamarine",
        "aqua",
        "crimson",
        "#009966",
        '#006633'
      ]); 
        
      const width = 500, height = 330; // SVG的大小
      const margin = {
        // 四周的边距
        top: 30,
        right: 80,
        bottom: 5,
        left: 5,
      };
      let svg = d3.select("#topo") // 选中SVG
                  .call(d3.zoom().scaleExtent([-5, 2]).on("zoom", zoom_action)); // 添加平移和缩放功能

      let content = d3.select('.graphContent');
      this.content=content;

      /*----------初始化连边------------------------*/
      let all_links = this.content.append('g').attr('class','allLinks');
      this.content.append('defs').append('marker')   //三角形【箭头】
      .attr("id", 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 23) // 标记点的x坐标。如果圆更大，这个也需要更大
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 13)
      .attr('markerHeight', 13)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none')
      this.svgEdgepaths = all_links.selectAll(".edgepath") //连边上的标签位置,是的文字按照这个位置进行布局
						.data(edges,function(d:any){return d.id;})
						.enter()
						.append('path')
            .attr('class', 'edgepath')      
						.attr("stroke",(d)=>linkColorScale(d.relation))
						.attr('id', function (d:any, i) {return 'edgepath' + d.id})
            .style("pointer-events", "none")   
            .attr('relation',(d:any)=>d.relation)
            .attr('marker-end','url(#arrowhead)');

      this.edgelabels = all_links.selectAll(".edgelabel")
						.data(edges,d=>d.id)
						.enter()
						.append('text')
						.style("pointer-events", "none")
						.attr('class', 'edgelabel')
						.attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 12)
						.attr('fill', d => linkColorScale(d.relation));

      this.edgelabels
        .append("textPath") //要沿着<path>的形状呈现文本，请将文本包含在<textPath>元素中，该元素具有一个href属性，该属性具有对<path>元素的引用.
        .attr("xlink:href", function (d, i) {
          return "#edgepath" + d.id;
        })
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text((d) => d.relation);

      /*----------------------初始化节点-----------------------------*/
      let all_nodes = this.content.append('g').attr('class','allNodes');

      this.svgNodes = all_nodes
        .selectAll(".nodes")
        .data(nodes, (d:any)=>d.id)
        .enter()
        .append("circle")
        .attr("r", (d) => 17)
        .style("stroke", "grey")
        .style("stroke-opacity", 0.3)
        .style("fill", (d:any) => nodeColorScale(d.type))
        .attr("class", "nodes")
        .attr("id", (d:any) => d.id)
        .call(
          d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );
       
       this.svgNodeText = all_nodes
        .selectAll('.nodeText')
        .data(nodes,(d:any)=>d.id)
        .enter()
        .append("text")
        .attr("dy", 4)
        .attr("dx", -15)
        .text((d:any) => d.name);

      /*---------------------定义力导引模型----------------------*/
      this.simulation = d3.forceSimulation();

      this.simulation.nodes(nodes).on("tick", ticked);

      this.simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter())
        // .force('collide',d3.forceCollide().radius(30).iterations(2));

      this.simulation.force("link").id(function (d) {
          return d.name;
        })
        .distance(100)
        .links(edges);
      this.simulation.force("charge").strength(-50).distanceMax(200);
      this.simulation.force("center").x(width / 2).y(height / 2);

      console.log(this.content);
      /*---------------------自定义函数，用于图形缩放和力导引模型-------------*/

      function zoom_action() {
        // 控制图形的平移和缩放
        content.attr("transform", d3.event.transform);
      }

      function ticked() {
        that.svgEdgepaths.attr("d", (d) => "M " +d.source.x +" " +d.source.y +" L " +d.target.x +" " +d.target.y);   
        that.svgNodes.attr("cx", d=>d.x).attr("cy", d=>d.y);

        that.svgNodeText.attr("x", d=>d.x).attr("y", d=>d.y);
      }
     function dragstarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fy = d.y;
        d.fx = d.x;
    }
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
    function dragended(d) {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    
    }
}

changeGraph(key,value){
  // if(key > 11){
  //   d3.select('.showTimeLine')._groups[0][0].scrollTop += 47;
  // } 
  this.currentLoop=key;
  let that = this;
  this.tiemCircle = key;
  let timeEnd = value;
  
  let rawNodes = JSON.parse(JSON.stringify(Object.values(this.ip_timeline.nodes)));
  let rawLinks = JSON.parse(JSON.stringify(Object.values(this.ip_timeline.links)));
  let newNode = rawNodes.filter(d => (new Date(d.start) < new Date(timeEnd) || d.start === timeEnd) && (new Date(d.end) > new Date(timeEnd) || d.end === timeEnd));
  let nodes = []
  let edges = rawLinks.filter(d => (new Date(d.start) < new Date(timeEnd) || d.start === timeEnd) && (new Date(d.end) > new Date(timeEnd) || d.end === timeEnd));
  
  const nodeColorScale = d3
  .scaleOrdinal()
  .domain(this.node_types())
  .range([
    "#ff9e6d",
    "#86cbff",
    "#c2e5a0",
    "#fff686",
    "#9e79db",
    "#8dd3c7",
    "aquamarine",
    "aqua",
  ]);

// 自定义连边的颜色
const linkColorScale = d3
  .scaleOrdinal()
  .domain(this.link_types())
  .range([
    "#ff9e6d",
    "#86cbff",
    "#c2e5a0",
    "#fff686",
    "#9e79db",
    "#8dd3c7",
    "aquamarine",
    "aqua",
    "crimson",
    "#009966",
    '#006633'
  ]); 

for(let node_info of newNode){
  let nodeFlag = 1;
  for(let currentNode of this.graphNodes){
      if(node_info.name == currentNode.name){
        nodes.push(currentNode)
        nodeFlag = 0;
      }
    }
  if(nodeFlag){
    nodes.push(node_info)
  }
}
  
  let newobj = {}; 
  nodes = nodes .reduce((preVal, curVal) => {
      newobj[curVal.name] ? '' : newobj[curVal.name] = preVal.push(curVal); 
      return preVal 
  }, [])

  let newobjLink = {}; 
  edges = edges .reduce((preVal, curVal) => {
      newobjLink[curVal.id] ? '' : newobjLink[curVal.id] = preVal.push(curVal); 
      return preVal 
  }, [])

  this.svgEdgepaths = this.svgEdgepaths.data(edges,d=>d.id)
  this.svgEdgepaths.exit().remove();
  this.svgEdgepaths = this.svgEdgepaths
          .enter() 
          .append('path')
          .attr('class', 'edgepath')
          .attr("stroke",d => linkColorScale(d.relation))
          .attr('id', function (d, i) {return 'edgepath' + i})
          .style("pointer-events", "none")
          .attr('marker-end','url(#arrowhead)')
          .merge(this.svgEdgepaths);

  this.edgelabels = this.edgelabels.data(edges,d=>d.id);
  this.edgelabels.exit().remove();
  this.edgelabels = this.edgelabels
          .enter()
          .append('text')
          .style("pointer-events", "none")
          .attr('class', 'edgelabel')
          .attr('id', function (d, i) {return 'edgelabel' + i})
          .attr('font-size', 12)
          .attr('relation',d=>d.relation)
          .attr('fill', d => linkColorScale(d.relation))
          .merge(this.edgelabels);

  d3.selectAll('textPath').remove()
  this.edgelabels
      .append("textPath")
      .attr("xlink:href", function (d, i) {
        return "#edgepath" + d.id;
      })
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .attr("startOffset", "50%")
      .text((d) => d.relation);
// 连边data join end

// 节点data join start
  this.svgNodes = this.svgNodes.data(nodes,d=>d.id);
  this.svgNodes.exit().remove();
  this.svgNodes = this.svgNodes
    .enter()
    .append("circle")
    .attr("r", (d) => 17)
    .style("stroke", "grey")
    .style("stroke-opacity", 0.3)
    .style("fill", (d) => nodeColorScale(d.type))
    .attr("class", "nodes")
    .attr("id", (d) => d.id)
    .call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag",  dragged)
        .on("end", dragended)
    )
    .merge(this.svgNodes);

  this.svgNodeText = this.svgNodeText.data(nodes,d=>d.id)
  this.svgNodeText.exit().remove();
  this.svgNodeText = this.svgNodeText
    .enter()
    .append("text")
    .attr("dy", 4)
    .attr("dx", -15)
    .text((d) => d.name)
    .merge(this.svgNodeText);
  // 节点data join end
  this.simulation.nodes(nodes).force("link").links(edges);
  this.simulation.alpha(1).restart()
  // this.simulation.tick(10000)
  this.graphLinks = edges;
  this.graphNodes = nodes;
  function dragstarted(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d.fy = d.y;
    d.fx = d.x;
}
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
function dragended(d) {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;

}
}
currentLoop:any;
mounted(){
  let that = this;
  this.nodes = JSON.parse(JSON.stringify(Object.values(this.ip_timeline.nodes)));
  this.links = JSON.parse(JSON.stringify(Object.values(this.ip_timeline.links)));
  let dateArr = [];
  for(let value of this.nodes){
      dateArr.push(value.start);
      dateArr.push(value.end);
  }
  this.timeLine = Array.from(new Set(dateArr)).sort().map((d,i)=>{return {'date':d,'index':i}});
  let timeStart ='2020-08-15';
  let timeEnd = '2014-08-07';
  console.log(this.timeLine)
  this.graphNodes = this.nodes.filter(d => (new Date(d.start) < new Date(timeEnd) || d.start === timeEnd) && (new Date(d.end) > new Date(timeEnd) || d.end === timeEnd));
  this.graphLinks = this.links.filter(d => (new Date(d.start) < new Date(timeEnd) || d.start === timeEnd) && (new Date(d.end) > new Date(timeEnd) || d.end === timeEnd));
  console.log(this.graphNodes,this.graphLinks)

  this.createGraph(this.graphNodes,this.graphLinks);
  let currentLoop = 0;
  this.currentLoop=currentLoop;
  let time = setInterval(function(){
    if(this.currentLoop == that.timeLine.length){
      clearInterval(time)
    }
       // d3.select('.showTimeLine')._groups[0][0].scrollTop += d3.select('.showTimeLine')._groups[0][0].scrollHeight / that.timeLine.length;
      // d3.select('.showTimeLine')._groups[0][0].scrollTop = 47*currentLoop;
      // console.log(`${that.timeLine[currentLoop].date} : ${d3.select('.showTimeLine')._groups[0][0].scrollTop}`)
      
      that.changeGraph(this.currentLoop,that.timeLine[this.currentLoop])
      this.currentLoop++;
  },1000);
}

}
