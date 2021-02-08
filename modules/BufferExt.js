function BufferExt(buffer){
    if(!(this instanceof BufferExt))
        return new BufferExt(buffer);

    this.buffer = buffer;
}

BufferExt.prototype.readByte =  function(char = false){
    let data = this.buffer[0];
    this.buffer = this.buffer.slice(1);

    return (char) ? String.fromCharCode(data) : data;
};

BufferExt.prototype.readString =  function(){
    let string_array = [];

    for(const value of this.buffer.values()){
        string_array.push(value);

        if(value == 0x00) // Text escape
            break;
    }

    this.buffer = this.buffer.slice(string_array.length);

    return Buffer.from(string_array).toString();
};


BufferExt.prototype.readShort =  function(raw = false){
    let data = this.buffer.slice(0, 2);

    this.buffer = this.buffer.slice(3);

    return (raw) ? data : data.readInt16LE();
};

BufferExt.prototype.readLong =  function(raw = false){
    let data = this.buffer.slice(0, 4);

    this.buffer = this.buffer.slice(5);

    return (raw) ? data : data.readInt32LE(); // fix this shit
};

BufferExt.prototype.readFloat =  function(raw = false){
    let data = this.buffer.slice(0, 4);

    this.buffer = this.buffer.slice(5);

    return (raw) ? data : data.readFloat; // fix this shit
};

BufferExt.prototype.removeOffset =  function(offset){
    this.buffer = this.buffer.slice(offset);
};

BufferExt.prototype.toString =  function(offset){
    return this.buffer.toString();
};

module.exports = BufferExt;