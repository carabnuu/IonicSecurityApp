import { Component } from '@angular/core';
import * as d3 from 'd3';
import * as d3Brush from 'd3-brush';
import { Platform } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import * as $ from 'jquery'
import { identifierModuleUrl } from '@angular/compiler';
@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})


export class Tab1Page {

    title = 'Game of Thrones';
    subtitle = 'Viewers per season for';
    width: number;
    height: number;
    margin = { top: 20, right: 20, bottom: 30, left: 40 };
    x: any;
    y: any;
    content: any;
    data: any;
    nodes: any;
    links: any;
    simulation: any;
    svgHulls: any;

    public segmentSelected: any;
    public selectedSlide: any;
    d3: any;
    constructor(private _platform: Platform, private menu: MenuController) {
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }


    read_data() {


        Promise.all([
            d3.csv('../assets/node.csv'),
            d3.csv('../assets/link.csv'),
            //csv('data/ph.csv'),
        ]).then(([Node, Edge]) => {
            console.log(Edge);
            this.nodes = Node;
            this.links = Edge;
            this.drawChart(this.nodes, this.links);


        });

    }
    //显示搜索内容
    ionChange(event) {

        console.log(event.detail.value)

    }

    ionViewDidEnter() {
        d3.selectAll('svg').remove();
        this.init();
        this.read_data();
    }
    showcard() {
        if ($("#searchcard").css("visibility") == "hidden")
            $("#searchcard").css("visibility", "visible");
        else {
            $("#searchcard").css("visibility", "hidden");

        }
    }
    searchitem: any;
    public filtername:any[];
    getSearch(event) {
        this.filtername=[];
        this.searchitem = event.target.value;
        console.log(this.searchitem)
        //模糊匹配
        var reg = new RegExp(this.searchitem);

        this.nodes.forEach(d=> {
            if (d.name.match(reg)) {
                 this.filtername.push(d.name);
            }
        });
        if(this.filtername.length===0){
            this.filtername.push("    对不起没有找到相关的节点")
        }
    } 
    filternode(value){
        console.log($("#"+value).css("background-color","red"))
    }
    init() {

        this.segmentSelected = 0;


        var svg = d3.select('#Chart1')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('class', 'Chart1svg')
            .attr('viewBox', '0 0 900 900')
        // 添加平移和缩放功能;
        var content = svg.append('g').attr('id', 'Chart1g').attr('class', 'graphContenttab1')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        svg.call(d3.zoom()
            .scaleExtent([1 / 10, 20]) //框定zoom的范围
            .on('zoom', function () {
                content.attr("transform", d3.event.transform);
                console.log(d3.event.transform);
            }));


        this.content = content;


    }


    drawChart(nodes, edges) {


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

        /*
                let nodeColorScale = d3.scaleOrdinal() // 自定义节点的颜色     =d3.scaleOrdinal(d3.schemeSet2)
                    .domain(["Domain", "IP",
                        "Cert_SHA256", 'IP_CIDR',
                        'ASN', 'Whois_Name',
                        'Whois_Email', 'Whois_Phone'])
                    .range(["#bc36dd", "#1070f7 ",
                        "#ff5d8d", "#c8e499",
                        "#c5f6fa", "#aabfc9",
                        "#aabfc9", "#aabfc9"]);
        */
        const nodeSizeScale = d3.scaleOrdinal() // 自定义节点的大小    =d3.scaleOrdinal(d3.schemeSet2)
            .domain(["Domain", "IP",
                "Cert_SHA256", 'IP_CIDR',
                'ASN', 'Whois_Name',
                'Whois_Email', 'Whois_Phone'])
            .range(["23px", "23px ",
                "23px", "10px",
                "10px", "17px",
                "17px", "17px"]);

        let linkColorScale = d3.scaleOrdinal() // 自定义连边的颜色
            .domain(["ip", "r_dns_cname",
                'r_cert', 'r_cidr',
                'r_asn', "r_whois_name",
                'r_whois_email', 'r_whois_phone',
                'r_subdomain', 'r_certchain',
                'r_request_jump'])
            .range(["#1070f7"/*蓝 -强*/, "#c2e0ce "/*灰绿-一般*/,
                "#ff5d8d"/*粉红-强*/, "#c8e499"/*淡绿-弱*/,
                "#c5f6fa"/*淡蓝-弱*/, "#aabfc9"/* 蓝=较强*/,
                "#aabfc9"/*蓝-较强*/, "#aabfc9"/* 蓝--较强*/,
                "#bc36dd"/*紫-强*/, "#eebefa"/*淡紫--一般*/,
                '#38d9a9'/*湖绿-强*/]);

        //简化边名称
        let labelForShort = {
            "r_dns_a": "IP", "r_dns_cname": "CNAME",
            'r_cert': "CERT", 'r_cidr': "IP_C",
            'r_asn': "ASN", "r_whois_name": "R-Name",
            'r_whois_email': "R-Email", 'r_whois_phone': "R-Phone",
            'r_subdomain': "SubDom", 'r_cert_chain': "CA-CERT",
            'r_request_jump': "JUMP"
        };

        let imageScale = d3.scaleOrdinal() // 自定义节点的图片     =d3.scaleOrdinal(d3.schemeSet2)
            .domain(["Domain", "IP",
                'IP_CIDR', "Cert_SHA256",
                'ASN', 'Whois_Name',
                'Whois_Email', 'Whois_Phone'])
            .range(["D", "IP",
                "IP/C", "../assets/icon/cert.jpg",
                'ASN', "../assets/icon/whois name.jpg",
                "../assets/icon/whois email.jpg", "../assets/icon/whois phone.jpg"]);

        let tooltip = d3.select(".tooltip"); // 选中提示框



        let brush = this.content.append("g")//放到content上
            .attr("class", "brush");


        /*----------初始化连边------------------------*/
        const link = this.content.selectAll(".links")
            .data(edges)
            .enter()
            .append("line")
            .attr("class", "links")
            .style("stroke-dasharray", function (d) {
                if (d.type == "r_cidr" || d.type == "r_asn")
                    return ("3, 3");
            })
            .attr("stroke", d => linkColorScale(d.relation))
            .attr("stroke-width", "1px")
            .style("opacity", 0.8)
            .attr("id", d => "line" + d.source + d.target)
            .attr("class", "links")
            .attr('marker-end', 'url(#arrowhead)');

        const edgepaths = this.content.selectAll(".edgepath") //连边上的标签位置,是的文字按照这个位置进行布局
            .data(edges)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) { return 'edgepath' + i })
            .style("pointer-events", "none");

        const edgelabels = this.content.selectAll(".edgelabel")
            .data(edges)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) { return 'edgelabel' + i })
            .attr('font-size', 12)
            .attr('fill', d => linkColorScale(d.relation));

        edgelabels.append('textPath') //要沿着<path>的形状呈现文本，请将文本包含在<textPath>元素中，该元素具有一个href属性，该属性具有对<path>元素的引用.
            .attr('xlink:href', function (d, i) { return '#edgepath' + i })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(d => labelForShort[d.relation]);

        /*----------------------初始化节点-----------------------------*/
        const node = this.content.selectAll(".nodes")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "nodes")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            );


        //定义节点图片
        var defs = node.append("defs");


        defs.append('pattern')//svg:pattern 添加图片
            .attr("id", function (d, i) { return "my_image" + i })
            .attr("width", 1)
            .attr("height", 1)
            .append("svg:image")
            .attr("xlink:href", function (d) {

                return imageScale(d.type)
            }
            )
            .attr("height", function (d) {
                if (d.type == "Cert_SHA256")
                    return "40";
                else
                    return "30";
            })
            .attr("width", function (d) {
                if (d.type == "Cert_SHA256")
                    return "40";
                else
                    return "30";
            })
            .attr("x", function (d) {
                if (d.type == "Cert_SHA256")
                    return 2;
                else
                    return 2;
            })
            .attr("y", function (d) {
                if (d.type == "Cert_SHA256")
                    return 2;
                else
                    return 2;
            });

        node.append("circle")
            .attr("r", d => nodeSizeScale(d.type))
            .attr("stroke", "grey")
            .attr("fill", function (d, i) {
                if (d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone")
                    return "url(#my_image" + i + ")";
                else
                    return "white";
            })
            // 如果是wjk导出的，就是d.category;自己导出的就是d.type
            .on("mouseover", function (d) {
                console.log("mouseover" + d3.event.pageX);
                tooltip.style("visibility", "visible").style("left", d3.event.pageX + "px").style("top", d3.event.pageY + "px");
                tooltip.select(".tipName").text(d.name);
                tooltip.select(".tipDomain").text(d.type);
                tooltip.select(".tipIndustry").text(d.industry);
                tooltip.select(".tipIsAlive").text(d.is_alive);

                return null;
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            })

        tooltip.style("visibility", "hidden");
        node.append("text")
            .text(function (d) {
                // 返回字母
                if (!(d.type == "Cert_SHA256" || d.type == "Whois_Name" || d.type == "Whois_Email" || d.type == "Whois_Phone"))
                    return imageScale(d.type);
            })
            .attr("dx", -7)
            .attr("dy", function (d) {
                if (d.type == "ASN" || d.type == "IP_CIDR")
                    return 2;
                else
                    return 8;
            })

        node.attr("font-size", function (d) {
            if (d.type == "IP_CIDR" || d.type == "ASN")
                return 8;
        })
            .attr("font-weight", function (d) {
                if (d.type == "IP_CIDR" || d.type == "ASN")
                    return 600;
            })


        /*---------------------定义力导引模型----------------------*/
        var simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-700).distanceMax(1200))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))

        simulation.nodes(nodes)
            .on("tick", ticked);

        var link_force = d3.forceLink(edges)
            .id(function (d: any) { return d.name; }).distance(120);
        simulation.force("link", link_force);

        /*---------------------自定义函数，用于图形缩放和力导引模型-------------*/


        function ticked() { //该函数在每次迭代force算法的时候，更新节点的位置(直接操作节点数据数组)。
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
            edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
        }

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



    }


}
