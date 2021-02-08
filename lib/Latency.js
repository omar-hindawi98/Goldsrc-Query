// TIMER FOR LATENCY
function Latency(){
    if(!(this instanceof Latency))
        return new Latency();

    this.timer_start = null;
    this.timer_stop = null;
}

Latency.prototype.start = function(){
    this.timer_start = new Date().getTime();
}

Latency.prototype.stop = function(){
    this.timer_stop = new Date().getTime();
}

Latency.prototype.difference = function(){
    return this.timer_stop - this.timer_start;
}

module.exports = Latency;