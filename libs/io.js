function delay(x) {
    return new Promise(function(res) {
        setTimeout(res, x)
    });
}

module.exports = {
    names:[ 'delay' ],
    functions:[ delay ]
};

