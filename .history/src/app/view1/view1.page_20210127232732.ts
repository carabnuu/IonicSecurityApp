import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-view1',
  templateUrl: './view1.page.html',
  styleUrls: ['./view1.page.scss'],
})
export class View1Page  {
     
  graphNodes:[];
  graphLinks:[]; 
  content:any;
  svgHulls:any;
  timeLine:[];
  tiemCircle:0;
  tooltip_value={
     'name':'name',
     'type':'domain'
   }; 
  margin = { top: 20, right: 20, bottom: 30, left: 40 };

   
      
 convexHulls(nodes) {
   const offset = 15;
   let hulls = {};
   for (let k=0; k<nodes.length; ++k) {
     let n = nodes[k];
     let gName = n.group;
     let l = hulls[gName] || (hulls[gName] = []);
     l.push([n.x-offset, n.y-offset]);
     l.push([n.x-offset, n.y+offset]);
     l.push([n.x+offset, n.y-offset]);
     l.push([n.x+offset, n.y+offset]);
   }
   // create convex hulls
   let hullset = [];
   for (let i in hulls) {
     hullset.push({group: i, path: d3.polygonHull(hulls[i])});
   }

   return hullset;
   
   }
    
constructor() {}
ionViewDidEnter() { 
  this.read_data();
}
read_data(){
 let datasetAll = [];
 
 const data1 = require('../../assets/demo_data/data_203.json');
 const data2 = require("../../assets/demo_data/data_196.json");
 const data3 = require('../../assets/demo_data/data_206.json');
 const data4 = require('../../assets/demo_data/data_208.json');
 const data5 = require('../../assets/demo_data/data_209.json');
 const data6 = require('../../assets/demo_data/data_210.json');
 const data7 = require('../../assets/demo_data/data_bob.json');

 datasetAll.push(data1);
 datasetAll.push(data2);
 datasetAll.push(data3);
 datasetAll.push(data4);
 datasetAll.push(data5);
 datasetAll.push(data6);
 datasetAll.push(data7);

  var nodes=[];
  var links=[]; 


  for(let i in datasetAll){
   for(let value of JSON.parse(JSON.stringify(Object.values(datasetAll[i].nodes)))){
       value['group'] = 'g'+i;
       nodes.push(value);
   }


   for(let value of JSON.parse(JSON.stringify(Object.values(datasetAll[i].links)))){
       value['group'] = 'g'+i;
       links.push(value);
    }

}
console.log(nodes)

let newobj = {}; 
nodes = nodes .reduce((preVal, curVal) => {
   newobj[curVal.name] ? '' : newobj[curVal.name] = preVal.push(curVal); 
   return preVal 
}, []) 

this.createGraph(nodes,links);

}
createGraph(nodes, edges){
 const that = this;
 const width = 500, height = 500; // SVG的大小
 const margin = {
   // 四周的边距
   top: 30,
   right: 80,
   bottom: 5,
   left: 5,
 };
 const node_types=[
   "Domain",
   "IP",
   "Cert_SHA256",
   "IP_CIDR",
   "ASN",
   "Whois_Name",
   "Whois_Email",
   "Whois_Phone",
 ];
 const link_types=[
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
 let nodeColorScale = d3
 .scaleOrdinal()
 .domain(node_types)
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
let linkColorScale = d3
 .scaleOrdinal()
 .domain(link_types)
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
 let scale = d3.scaleOrdinal(d3.schemeCategory10);
 let svg = d3.select("#View2") // 选中SVG
               .call(d3.zoom().scaleExtent([-5, 2]).on("zoom", zoom_action)); // 添加平移和缩放功能

 let content = d3.select('.graphContent2');


 this.content=content; 
   /*---------------------定义力导引模型----------------------*/
 const simulation = d3.forceSimulation();

 simulation.nodes(nodes).on("tick", ticked);

 simulation
     .force("link", d3.forceLink())
     .force("charge", d3.forceManyBody())
     .force("center", d3.forceCenter());

 var link_force =  d3.forceLink(edges)
     .id(function (d:any) { return d.name; }).distance(20);
       simulation.force("link",link_force);

 simulation .force("charge", d3.forceManyBody().strength(-20).distanceMax(100));
 simulation.force("center", d3.forceCenter(width / 2,height / 2))



 /* ---------------------------添加蒙版--------------------------------*/
 let hullg = content.append("g").attr("class",'all_hull');
 this.svgHulls = hullg
   .selectAll(".hull")
   .data(this.convexHulls(nodes))
   .enter().append("path")
   .attr("class", "hull")
   .attr('opacity',0.3)
   .style("fill", '#99CCFF');

 /* --------------------- 初始化连边 ---------------------------*/
 let all_links = this.content.append('g').attr('class','allLinks');
  function zoom_action() {
   // 控制图形的平移和缩放
   content.attr("transform", d3.event.transform);
 }
 let svgNodes;
 let svgEdgepaths;
 svgEdgepaths = all_links.selectAll(".edgepath") //连边上的标签位置,是的文字按照这个位置进行布局
 .data(edges)
 .enter()
 .append('path')
 .attr('class', 'edgepath')
  .attr('id', function (d:any, i) {return 'edgepath' + d.id})
  .attr("stroke",d => linkColorScale(d.relation))
  .style("pointer-events", "none")
             .attr('relation',function(d:any){return d.relation;})
             .attr('marker-end','url(#arrowhead)')
              ;
  /*----------------------初始化节点-----------------------------*/
   let all_nodes = this.content.append('g').attr('class','allNodes');

   svgNodes = all_nodes
     .selectAll(".nodes")
     .data(nodes, function(d:any){return d.id;})
     .enter()
     .append("circle")
     .attr("r", (d) => 5)
     .style("stroke", "grey")
     .style("stroke-opacity", 0.3)
     .style("fill", (d) => nodeColorScale(d.type))
      .attr("class", "nodes")
     .attr("id", function(d:any){return d.id;})
     .call(
       d3.drag()
         .on("start", dragstarted)
         .on("drag", dragged)
         .on("end", dragended)
     ); 
     function dragstarted(d) {
       if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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
     function ticked() {
       let curve =  d3.line().curve(d3.curveCardinalClosed.tension(0.85));
       svgEdgepaths.attr("d", (d) => "M " +d.source.x +" " +d.source.y +" L " +d.target.x +" " +d.target.y);   
       svgNodes.attr("cx", d=>d.x).attr("cy", d=>d.y);
       // that.svgNodeText.attr("x", d=>d.x).attr("y", d=>d.y);
       that.svgHulls.data(that.convexHulls(nodes)).attr("d", d=>curve(d.path));
     }
     
    
  
  
}


}
