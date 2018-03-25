const delay = time => new Promise(resolve => setTimeout(() => resolve(time), time))
const delayBy = time => x => new Promise(resolve => setTimeout(() => resolve(x), time))

module.exports = {
    names:[ 'delay', 'delayBy' ],
    functions:[ delay, delayBy ]
};

