

/**
 *  returns a task that is ready when complete
 */
mjt.PagerSlice = mjt.define_task(null,
                [{name: 'pager'},
                 {name: 'start'},
                 {name: 'count'}]);

mjt.PagerSlice.prototype.init = function () {
    this.chunks = this.pager.slice_chunks(this.start, this.count);

    var chunks = this.chunks;
    for (var i = 0; i < chunks.length; i++)
        this.require(chunks[i]);

    return this.enqueue();
};


mjt.PagerSlice.prototype.request = function () {
    // all chunks ready
    var chunks = this.chunks;

    var results = [];
    var end = this.start + this.count;
    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        var starti = this.start - chunk.start
        if (starti < 0) continue;
            var count = starti + this.count;
        if (starti + count > chunk.count)
            count = chunk.count - starti;
        if (count <= 0) continue;

        if (starti == 0 && count == chunk.count)
            results = results.concat(chunk.result);
        else
            results = results.concat(chunk.result.slice(starti, count));
    }
    return this.ready(results);
};


/**
 *  returns a task with .results set to the slice
 */
mjt.Pager = function (first_chunk) {
    //this.task_class = task_class;
    //this.task_params = task_params;

    // chunks are tasks, sorted by .start
    this.chunks = [];
    this.chunks_waiting = 0;

    this.add_chunk(first_chunk);
};

/**
 *  create a new chunk task
 */
mjt.Pager.prototype._next_chunk = function(count) {
    var last_chunk = this.chunks[this.chunks.length - 1];

    var task = last_chunk.next(count);
    this.add_chunk(task);
    return task;
};

mjt.Pager.prototype.add_chunk = function(task) {
    task.enqueue();
    this.chunks_waiting++;
    task.onready('chunk_ready', this)
        .onerror('chunk_error', this);

    this.chunks.push(task);
    return this;
};

mjt.Pager.prototype.chunk_ready = function() {
    this.chunks_waiting--;
};

mjt.Pager.prototype.chunk_error = function() {
    this.chunks_waiting--;
};

/**
 *  returns an array of chunks that contain some
 *  necessary data for a slice.
 *  creates a new chunk for any remaining data that
 *  hasn't been fetched yet
 *
 *  XXX bug if there is already a pending read,
 *   we can't start the next one since we don't
 *   have a cursor.  need to queue up...
 */
mjt.Pager.prototype.slice_chunks = function(start, count) {
    var slice = [];
    var end = start + count;

    //mjt.log('SLICING', this, start, count);

    var chunks = this.chunks;
    var nexti = 0;
    for (var ci = 0; ci < chunks.length; ci++) {
        var chunk = this.chunks[ci];
        if (chunk.start >= end) continue;
        if (chunk.start + chunk.end <= start) continue;
        slice.push(chunk);
        nexti = chunk.start + chunk.count;
    }
    if (end > nexti) {
        slice.push(this._next_chunk(end - nexti));
    }
    return slice;
};

/**
 *  returns a task for an arbitrary results slice
 */
mjt.Pager.prototype.slicetask = function(start, count) {
    return mjt.PagerSlice(this, start, count);
};


/**
 *  calls the appropriate callback when a slice is ready/done
 */
mjt.Pager.prototype.slice = function(start, count, onready, onerror) {
    this.slicetask(start, count)
        .onready(onready).onerror(onerror);
};
