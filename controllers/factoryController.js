const catchAsync = require("../utils/catchAsync.js");
const ApiFeatures = require("../utils/ApiFeatures.js");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const dataLabel = `${Model.modelName}s`.toLowerCase();
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const data = await features.query;

    res.status(200).json({
      status: "success",
      result: data.length,
      data: { [dataLabel]: data },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const dataLabel = Model.modelName.toLowerCase();

    const id = req.params.id;
    const data = await Model.findById(id);

    res.status(200).json({ status: "success", data: { [dataLabel]: data } });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const dataLabel = Model.modelName.toLowerCase();
    const id = req.params.id;

    const data = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { [dataLabel]: data } });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    await Model.findByIdAndDelete(id);
    res.status(204).json({ status: "success" });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const dataLabel = Model.modelName.toLowerCase();
    const data = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        [dataLabel]: data,
      },
    });
  });
