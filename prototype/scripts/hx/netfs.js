/* netfs.js
 *
 * ++[black[Atomic OS Class: HxNETFS]++
 *
 * JavaScript tree structure to represent a remote filesystem
 *
 * @author Scott Elcomb <psema4@gmail.com (http://www.psema4.com)
 * @version 2.0.0
 */

var HxNETFS = HxJSFS.extend({
    /* @constructor
     * @method init
     * Extends <a href="jsfs.html">HxJSFS</a>
     *
     * @param {Object} opts Options dictionary
     */

    init: function(opts) {
        this.tree = opts.tree || {};
        this._super(opts);
		this.dev = system.fs.tree.dev.tree.net;
    },

    /* @method addFile
     * **Superclass Override**
     * Create an empty HxRemoteFile
     * @param {String} name Name of file to create
     * @returns {Bool} True on success
     */

    addFile: function(name) {
		//FIXME: cannot add file inside a folder.
        this.tree[name] = new HxRemoteFile({
            name: system.env.cwd + '/'+ name
        });
        return (this.tree[name] instanceof HxRemoteFile);
    },
   
    /* @method removeFile
     * **Superclass Override**
     * Delete a named file
     * @param {String} name Name of file to delete
     * @returns {Bool} true on success
     */

    removeFile: function(name) {
        if (this.tree[name] && this.tree[name] instanceof HxRemoteFile) {
        	this.tree[name].deleteFile();
        	delete(this.tree[name]);
            return (this.tree[name]) ? false : true;
        }
    },
	
    /* @method addChildFolder
     * **Superclass Override**
     * Creates a named subfolder
     * @param {String} name Name of subfolder
     * @returns {HxNETFS} on success
     *          null      when fail
     */

    addChildFolder: function(name) { 
		// url = current path + / name
		var path = system.env.cwd + '/'+ name;
		
		fileAction = {
            cmd:    'folder',
            subcmd: 'create',
            path:   path
        };

		var r;
        this.dev.send(fileAction, function(response) {
            r = JSON.parse(response);
        });
		
		if (r.data === "ok") {
			this.tree[name] = new HxNETFS({});
			return (this.tree[name] instanceof HxNETFS);
		}else {
			return null;
		}
    },
	
    /* @method removeChildFolder
     * **Superclass Override**
     * Remove a named folder
     * @param {String} name Name of subfolder to delete
     * @returns {Bool} true on success
     */

    removeChildFolder: function(name) {
        if (this.tree[name] && this.tree[name] instanceof HxNETFS) {
			// url = current path + / name
			var path = system.env.cwd + '/' +name;
			fileAction = {
	            cmd:    'folder',
	            subcmd: 'delete',
	            path:   path
        	};
			
			var r;
            this.dev.send(fileAction, function(response){
                r = JSON.parse(response);
            });
            
            if (r.data === "ok") {
                delete(this.tree[name]);	
                return (this.tree[name]) ? false : true;
            } else {
                return false;
            }           
        }
    }
    
});
