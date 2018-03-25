const r = Promise.resolve.bind(Promise)
const j = Promise.reject.bind(Promise)
const a = Promise.all.bind(Promise)
const c = Promise.race.bind(Promise)

module.exports = {
    names:[ 'resolve', 'reject', 'all', 'race' ],
    functions:[ r, j, a, c ]
};

