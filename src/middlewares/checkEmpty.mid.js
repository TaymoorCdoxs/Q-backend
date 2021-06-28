function checkEmpty(val) {

    if (val == null || val == undefined) {
        return true
    } else {
        if (typeof (val) == 'string') {
            if (val == undefined || val == "" || val == null) {
                return true
            }
            else {
                return false
            }
        } else if (typeof (val) == 'object') {
            if (val == undefined || val == {} || val == null) {
                return true
            }
            else {
                return false
            }
        } else if (typeof (val) == "number") {
            if (val == undefined || val == null) {
                return true
            } else if (val == 0) {
                return false
            }
            else {
                return false
            }
        }
    }
}

module.exports = checkEmpty