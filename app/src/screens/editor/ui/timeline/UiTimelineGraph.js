/* eslint no-undef: 0 */

class UiTimelineGraph {
    constructor(timeline) {
        this.container = document.getElementById("mynetwork");

        this.timeline = timeline;
        this.nodes = [];
        this.edges = [];
        this.network = null;
        this.directionInput = "UD";
        this.open = null;
    }

    versionAdded(version, timeline) {
        let container, data, options;

        this.destroyNetwork();
        this.nodes.push({ id: version.appwriteId, label: version.label, fixed: true, widthConstraint: { minimum: 30 }, heightConstraint: { minimum: 30 }, font: { size: 18}});
        if(version.previousVersion) {
            this.edges.push({ from: version.appwriteId, to: version.previousVersion, value:5 });
            let index = this.nodes.map(object => object.id).indexOf(version.previousVersion);
            this.nodes[this.nodes.length-1]["level"] = this.nodes[index]["level"] + 1;
        }else{
            this.nodes[this.nodes.length-1]["level"] = 0;
        }
        container = document.getElementById("mynetwork");
        this.nodesData = new vis.DataSet(this.nodes);

        data = {
          nodes: this.nodesData,
          edges: this.edges,
        };
      
        options = {
          edges: {
            smooth: {
              type: "cubicBezier",
              forceDirection:
                this.directionInput === "UD" || this.directionInput === "DU"
                  ? "vertical"
                  : "horizontal",
              roundness: 0.4,
            },
          },
          layout: {
            hierarchical: {
              direction: this.directionInput,
            },
          },
          physics: false,
        };
        this.network = new vis.Network(container, data, options);

        this.network.on("click", function (params) {
            params.event = "[original event]";
            if (typeof this.getNodeAt(params.pointer.DOM) === 'undefined') {
                return;
            }
            timeline.nodeSelected(this.getNodeAt(params.pointer.DOM));
        });
        this.network.on("doubleClick", function (params) {
            params.event = "[original event]";
            if (typeof this.getNodeAt(params.pointer.DOM) === 'undefined') {
                return;
            }
            timeline.nodeDoubleClicked(this.getNodeAt(params.pointer.DOM));
        });
        if(this.open){
            this.changeSelectedNodeColor(this.open, false);
            this.open = version.appwriteId;
            this.changeSelectedNodeColor(this.open, true);
        }else{
            this.open = version.appwriteId;
            this.changeSelectedNodeColor(this.open, true);
        }
    }

    destroyNetwork() {
        if (this.network !== null) {
            this.network.destroy();
            this.network = null;
        }
    }

    startColorChange(nodeId) {
        if(this.open !== nodeId) {
            this.changeSelectedNodeColor(this.open, false);
            this.open = nodeId;
            this.changeSelectedNodeColor(this.open, true);
        }
    }

    changeSelectedNodeColor(nodeId, red) {
        let newColor;

        console.log(nodeId + red);
        if(red) {
            newColor = "box";
        }else{
            newColor = "ellipse";

        }
        this.nodesData.update([{ id: nodeId, shape: newColor }]);
    }

}

export { UiTimelineGraph };