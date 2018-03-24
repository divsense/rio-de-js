const res = x => Promise.resolve(x)
const rej = x => Promise.reject(x)
const a = Promise.all.bind(Promise)
const r = Promise.race.bind(Promise)

module.exports = {
    names:[ 'resolve', 'reject', 'all', 'race' ],
    functions:[ res, rej, a, r ]
};

