const resolve = Promise.resolve
const reject = Promise.reject
const all = Promise.all
const race = Promise.race

module.exports = {
    names:[ 'resolve', 'reject', 'all', 'race' ],
    functions:[ resolve, reject, all, race ]
};

