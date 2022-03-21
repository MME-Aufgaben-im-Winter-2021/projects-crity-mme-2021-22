class TimelineCanvas {
    constructor() {
        this.canvas = document.querySelector('.timeline-canvas');
        //this.canvas.addEventListener("click", e => this.click(e));
        this.context = this.canvas.getContext('2d');
    
        this.versions = [];
        this.drawNode();
    }  

    drawNode() {
        this.context.fillStyle = "rgb(200,0,0)";
        this.context.strokeStyle = "rgb(100,200,100)";
        this.context.lineWidth = 3;
        //this.context.fillRect(10, this.canvas.height / 2, 50, 50);

        this.context.beginPath();
        this.context.arc(20, this.canvas.height / 2, 20, 0, Math.PI * 2, true);
        this.context.fill();

        this.context.beginPath();
        this.context.arc(140, this.canvas.height / 2, 20, 0, Math.PI * 2, true);
        this.context.fill();

        this.context.beginPath();
        this.context.moveTo(45, this.canvas.height / 2);
        this.context.lineTo(115, this.canvas.height / 2);
        this.context.moveTo(115, this.canvas.height / 2);
        this.context.lineTo(100, this.canvas.height / 2 + 20);
        this.context.moveTo(115, this.canvas.height / 2);
        this.context.lineTo(100, this.canvas.height / 2 - 20);
        this.context.stroke();
    }

    click(e) {
        let node = {
            x: e.x,
            y: e.y,
            radius: 10,
            fillStyle: '#22cccc',
            strokeStyle: '#009999'
        };
        this.nodes.push(node);
        this.drawNode(node);
    }
}

export { TimelineCanvas }