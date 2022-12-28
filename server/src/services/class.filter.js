// duration : {$gte: 5} اكبر من
//?duration[gte]=5&price[gte]=1000&sort=-price
class filter {
  constructor(query) {
    this.query = query;
  }
  filter() {
    const filterObj = { ...this.query };
    const excludeFileds = ["page", "limit", "sort", "fields"];
    excludeFileds.forEach((el) => delete filterObj[el]);

    let filter = JSON.stringify(filterObj); // make it string to replace gte gt lte lt to add $ before them
    filter = JSON.parse(
      filter.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`)
    );

    return filter; // chenge  gt the to be $gt like  price[$gte]=500&duration[$gte]=6
  }

  sort(option = "") {
    //sort=-price,-ratingsAverage
    if (this.query.sort) {
      return this.query.sort.split(",").join(" ");
    } else {
      return option;
    }
  }
  fields() {
    if (this.query.fields) {
      return this.query.fields.split(",").join(" ");
    } else {
      return {
        __v: 0,
      };
    }
  }
  pagination() {
    const DEFAULT_PAGE_NUMBER = 1;
    const DEFAULT_LIMIT = 0;
    const page = Math.abs(this.query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(this.query.limit) || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    return {
      limit,
      skip,
    };
  }
}

module.exports = filter;
