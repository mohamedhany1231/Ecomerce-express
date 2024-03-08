module.exports = class {
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }
  filter() {
    const excludedFields = ["sort", "fields", "limit", "page"];
    const filters = { ...this.queryString };
    excludedFields.forEach((field) => {
      delete filters[field];
    });

    let queryStr = JSON.stringify(filters);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // TODO: change default sort
    this.query = this.query.sort(
      this.queryString.sort?.split(",").join(" ") || "-price"
    );

    return this;
  }

  limitFields() {
    this.query = this.query.select(
      this.queryString.fields?.split(",").join(" ") || "-__v"
    );
    return this;
  }

  paginate() {
    const limit = this.queryString.limit || 5;
    const page = this.queryString.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.limit(limit).skip(skip);
    return this;
  }
};
