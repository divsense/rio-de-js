const delay = time => new Promise(resolve => setTimeout(() => resolve(time), time))
const delayBy = time => x => new Promise(resolve => setTimeout(() => resolve(x), time))
const log = x => y => { console.log(x + ":" + JSON.stringify(y, null, 2)); return y }

module.exports = {
    names:[ 'delay', 'delayBy', 'log' ],
    functions:[ delay, delayBy, log ]
};

