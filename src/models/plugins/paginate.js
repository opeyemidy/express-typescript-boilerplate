const paginate = (schema) => {
    /**
     * @typedef {Object} QueryResult
     * @property {Document[]} results - Results found
     * @property {number} page - Current page
     * @property {number} limit - Maximum number of results per page
     * @property {number} totalPages - Total number of pages
     * @property {number} totalResults - Total number of documents
     */
    /**
     * Query for documents with pagination
     * @param {Object} [filter] - Mongo filter
     * @param {Object} [options] - Query options
     * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
     * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
     * @param {string} [options.select] - Fields to include or exclude from the query result. Multiple fields should be separated by spaces ( )
     * @param {number} [options.limit] - Maximum number of results per page (default = 10)
     * @param {number} [options.page] - Current page (default = 1)
     * @returns {Promise<QueryResult>}
     */
    schema.statics.paginate = async function (filter, options) {
        const sortBy = options.sortBy || "createdAt"
        const sortingCriteria = sortBy.split(",").map((sortOption) => {
            const [key, order] = sortOption.split(":")
            return (order === "desc" ? "-" : "") + key
        })
        const limit = parseInt(options.limit, 10) || 10
        const page = parseInt(options.page, 10) || 1
        const skip = (page - 1) * limit

        let count, docs
        const countPromise = this.countDocuments(filter).exec()
        let docsPromise = this.find(filter)
            .sort(sortingCriteria.join(" "))
            .skip(skip)
            .limit(limit)

        if (options.populate) {
            docsPromise = docsPromise.populate(
                options.populate.split(",").map((populateOption) =>
                    populateOption
                        .split(".")
                        .reverse()
                        .reduce((a, b) => ({ path: b, populate: a }))
                )
            )
        }

        if (options.select) {
            docsPromise = docsPromise.select(
                options.select.split(" ").join(" ")
            )
        }

        docsPromise = docsPromise.exec()

        count = await countPromise
        docs = await docsPromise

        const totalPages = Math.ceil(count / limit)
        const result = {
            results: docs,
            page,
            limit,
            totalPages,
            totalResults: count,
        }
        return result
    }
}

export default paginate
