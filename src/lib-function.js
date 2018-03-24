module.exports = function(libs, url, name) {
    const lib = libs[url]
        
    if(lib) {
        const index = lib.names.indexOf(name)
        if(index > -1) {
            return lib.functions[index]
        }
    }
}

