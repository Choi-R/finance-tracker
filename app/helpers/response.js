exports.success = (res, statusCode, data) => {
    return res.status(statusCode).json({
        status: "Success",
        data: data
    })
}

exports.error = (res, statusCode, data) => {
    return res.status(statusCode).json({
        status: "Error",
        data: data
    })
}

exports.errorBug = (res, err, str) => {
    console.log(err, str)
    return res.status(500).json({
        status: "Error",
        data: "Unexpected error. Please contact administrator"
    })
}