"use strict";

import * as powerbi from "powerbi-visuals-api";

// Use this type manually if DataViewObjects is missing
type DataViewObjects = { [objectName: string]: { [propertyName: string]: any } };

export class VisualSettings {
    public dataPoint: DataPointSettings = new DataPointSettings();
    public axis: AxisSettings = new AxisSettings();
    public legend: LegendSettings = new LegendSettings();
    public tooltip: TooltipSettings = new TooltipSettings();
    public plotArea: PlotAreaSettings = new PlotAreaSettings();
    public labelSettings: LabelSettings = new LabelSettings();

    public static parse(settings:DataViewObjects): VisualSettings {
        const parsed = new VisualSettings();

        parsed.dataPoint.defaultColor = getValue<string>(settings, "dataPoint", "defaultColor", "#000000");
        parsed.dataPoint.size = getValue<number>(settings, "dataPoint", "size", 6);
        parsed.dataPoint.opacity = getValue<number>(settings, "dataPoint", "opacity", 100);

        parsed.axis.xAxisScale = getValue<string>(settings, "axis", "xAxisScale", "linear");
        parsed.axis.yAxisScale = getValue<string>(settings, "axis", "yAxisScale", "linear");

        parsed.legend.show = getValue<boolean>(settings, "legend", "show", true);
        parsed.legend.position = getValue<string>(settings, "legend", "position", "Top");

        parsed.tooltip.enabled = getValue<boolean>(settings, "tooltip", "enabled", true);

        parsed.plotArea.showGrid = getValue<boolean>(settings, "plotArea", "showGrid", true);
        parsed.plotArea.backgroundColor = getValue<string>(settings, "plotArea", "backgroundColor", "#ffffff");

        parsed.labelSettings.fontSize = getValue<number>(settings, "labelSettings", "fontSize", 12);
        parsed.labelSettings.fontFamily = getValue<string>(settings, "labelSettings", "fontFamily", "Segoe UI");

        return parsed;
    }
}

class DataPointSettings {
    public defaultColor: string;
    public size: number;
    public opacity: number;
}

class AxisSettings {
    public xAxisScale: string;
    public yAxisScale: string;
}

class LegendSettings {
    public show: boolean;
    public position: string;
}

class TooltipSettings {
    public enabled: boolean;
}

class PlotAreaSettings {
    public showGrid: boolean;
    public backgroundColor: string;
}

class LabelSettings {
    public fontSize: number;
    public fontFamily: string;
}

function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
    if (objects) {
        const object = objects[objectName];
        if (object) {
            const property = object[propertyName];
            if (property !== undefined) {
                return property as T;
            }
        }
    }
    return defaultValue;
}
