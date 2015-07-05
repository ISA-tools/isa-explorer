ISATab Explorer
=========

Specifically, this site has been developed to provide a view on the Nature SciData ISATab files, however it can be used to host a lightweight ISATab repository with no complicated server-side technology. Just simple HTML, CSS, and JavaScript. 

Libraries used:

 * FontAwesome 4.3.0
 * lunr.js - fast full text search within the browser
 

## Installation

Simply clone the repository, or download it as a zip file. Then open the index.html file. You'll see a list of the files present in the data directory. By default, you'll see the SciData articles initially.

To use your own data, place your ISA-Tab files in the Data directory (can also be symlinks), then run the simple build_index.py script which will build an initial metadata repository JSON file that is used by lunr.js to search, and by the web application to present the initial file list.

``` python
python build_index.py
```



