/* remotefile.js
 *
 * ++[black[Atomic OS Class: HxRemoteFile]++
 * 
 * Remote file class, provide remote file operations.
 * 
 * @author Shuwen Pan
 */

var HxRemoteFile = HxFile.extend({
	
	/* @constructor
     * @method init
     * Extends <a href="file.html">HxFile</a>
     *
     * @param {Object} opts Options dictionary
     */
	
    init: function(opts) {
        this._super(opts);
        this.dev = system.fs.tree.dev.tree.net;

        this.read();

        // if the buffer is empty after reading from the server then the file likely doesn't exist.  create it on the server
        if (this.buffer == '') {
            this.dev.send(
                {
                    cmd:    'file',
                    subcmd: 'create',
                    path:   this.name
                },

                function(response) {
                    //FIXME: parsing the response is causing an unexpected token 'u' ??
                    //       it doesn't prevent creation so ignoring for now

                    //console.warn('>>' + response + '<<');
                    try {
                        var r = JSON.parse(r);
                        console.log('HxRemoteFile.init: remote file creation response:');
                        console.dir(r);
 
                    } catch(e) {
                        // console.log('HxRemoteFile.init: remote file creation: ERROR PARSING RESPONSE:');
                        // console.dir(e);
                    }
                }
            );
        }
    },

	/* @method read
     * **Superclass Override**
     * Read the file through the net device and put it to the buffer.
     * @returns {String} Internal buffer
     *          {boolean} If read fails
     */

    read: function() {
        path = this.name;
        var self = this;

        fileAction = {
            cmd:    'file',
            subcmd: 'read',
            path:   path
        };

        this.dev.send(fileAction, function(response) {
            var r = JSON.parse(response);

            // fill buffer
            self.buffer = r.data;
        });

        return this.buffer || false;
    },
	
	 /* @method write
     * Write characters to net device, overwriting any previous contents
     * @param {String} buf Text contents to store in net divice
     * @returns {HxStream} Returns this stream object
     */

    write: function(buf) {
        this.buffer = buf;

        var path = this.name;

        fileAction = {
            cmd:    'file',
            subcmd: 'write',
            path:   path,
            buffer: buf
        };
       
        this.dev.send(fileAction, function(response) {
            var r = JSON.parse(response);
            console.dir(r);
        });

        return this;
    },
   
    /* @method append
     * Write characters to net device, appending to any previous contents
     * @param {String} buf Text contents to append to net divice
     * @returns {HxStream} Returns this stream object
     */
   
    append: function(buf) {
        this.buffer += buf;

        var path = this.name;
       
        fileAction = {
            cmd:    'file',
            subcmd: 'append',
            path:   path,
            buffer: buf
        };
       
        this.dev.send(fileAction, function(response) {
            var r = JSON.parse(response);
            console.dir(r);
        });

        return this;
    },
    
	/* @method deleteFile
     * Delete file on net device
     * 
     * @returns {HxStream} Returns this stream object
     */
	
    deleteFile: function() {
        this.buffer = "";

        var path = this.name;
       
        fileAction = {
            cmd:    'file',
            subcmd: 'delete',
            path:   path
        };
       
        this.dev.send(fileAction, function(response) {
            var r = JSON.parse(response);
            console.dir(r);
        });

        return this;
    }
});

