// src/visual.ts
import "./../style/visual.less";
import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;
import DataView = powerbi.DataView;
import VisualObjectInstance = powerbi.VisualObjectInstance;

interface ScatterDataPoint {
    x: number;
    y: number;
    z: number;
    color: string;
    category: string;
    index: number;
}

export class Visual implements powerbi.extensibility.visual.IVisual {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private container: d3.Selection<SVGGElement, any, any, any>;
    private xScale!: d3.ScaleLinear<number, number>;
    private yScale!: d3.ScaleLinear<number, number>;

    constructor(options: powerbi.extensibility.visual.VisualConstructorOptions | undefined) {
        if (!options) {
            throw new Error("VisualConstructorOptions is undefined.");
        }
        this.svg = d3.select(options.element)
            .append("svg")
            .classed("scatterPlot", true);

        this.container = this.svg.append("g")
            .classed("container", true);
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions): void {
        const dataView: DataView = options.dataViews?.[0];
        const width: number = options.viewport.width;
        const height: number = options.viewport.height;

        this.svg.attr("width", width).attr("height", height);
        const categorical = dataView?.categorical;

        if (!categorical) return;

        const categories = categorical.categories?.[0]?.values ?? [];

        let xValues: number[] = [];
        let yValues: number[] = [];
        let zValues: number[] = [];
        let colorValues: string[] = [];
        let indexValues: number[] = [];

        for (const valueCol of categorical.values ?? []) {
            const role = valueCol.source.roles;
            const values = valueCol.values;
            if (role?.xAxis) {
                xValues = values.map(v => Number(v));
            } else if (role?.yAxis) {
                yValues = values.map(v => Number(v));
            } else if (role?.zAxis) {
                zValues = values.map(v => Number(v));
            } else if (role?.color) {
                colorValues = values.map(v => v?.toString?.() ?? "#888");
            } else if (role?.size) {
                indexValues = values.map(v => Number(v));
            }
        }

        const pointCount = Math.max(xValues.length, yValues.length, categories.length);
        const dataPoints: ScatterDataPoint[] = [];

        for (let i = 0; i < pointCount; i++) {
            dataPoints.push({
                x: xValues[i] ?? 0,
                y: yValues[i] ?? 0,
                z: zValues[i] ?? 0,
                color: colorValues[i] ?? "#888",
                category: categories[i]?.toString?.() ?? `#${i}`,
                index: indexValues[i] ?? i
            });
        }

        // Sorting to maintain rendering consistency like built-in visuals
        dataPoints.sort((a, b) => a.index - b.index);

        this.xScale = d3.scaleLinear()
            .domain(d3.extent(dataPoints, d => d.x) as [number, number])
            .range([40, width - 20]);

        this.yScale = d3.scaleLinear()
            .domain(d3.extent(dataPoints, d => d.y) as [number, number])
            .range([height - 30, 20]);

        this.container.selectAll("circle").remove();

        this.container.selectAll("circle")
            .data(dataPoints)
            .enter()
            .append("circle")
            .attr("cx", d => this.xScale(d.x))
            .attr("cy", d => this.yScale(d.y))
            .attr("r", 5)
            .attr("fill", d => d.color)
            .append("title")
            .text(d => `${d.category} [${d.index}]\nX: ${d.x}, Y: ${d.y}, Z: ${d.z}`);
    }

    public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        return [];
    }
}
