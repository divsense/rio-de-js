const r = Promise.resolve.bind(Promise)
const j = Promise.reject.bind(Promise)
const a = Promise.all.bind(Promise)
const c = Promise.race.bind(Promise)

module.exports = {
    names:[ 'promiseResolve', 'promiseReject', 'promiseAll', 'promiseRace' ],
    functions:[ r, j, a, c ]
};

