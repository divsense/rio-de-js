const delay = time => x => new Promise(resolve => setTimeout(() => resolve(x), time))

module.exports = {
    names:[ 'delay' ],
    functions:[ delay ]
};

