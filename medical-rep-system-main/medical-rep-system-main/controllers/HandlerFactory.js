import { prisma } from "../config/db.js";

const getAll = (Model) => async (req, res) => {
  const data = await prisma[Model].findMany();
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    results: data.length,
    data: data,
  });
};

const getOne = (Model) => async (req, res) => {
  const { id } = req.params;
  const data = await prisma[Model].findUnique({ where: { id } });
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    data: data,
  });
};

const createOne = (Model) => async (req, res) => {
  const data = await prisma[Model].create({ data: req.body });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: data,
  });
};

const updateOne = (Model) => async (req, res) => {
  const { id } = req.params;
  const data = await prisma[Model].update({
    where: { id },
    data: req.body,
  });
  res.status(200).json({
    status: "success",
    message: "Data updated successfully",
    data: data,
  });
};

const deleteOne = (Model) => async (req, res) => {
  const { id } = req.params;
  const data = await prisma[Model].delete({ where: { id } });
  res.status(200).json({
    status: "success",
    message: "Data deleted successfully",
    data: data,
  });
};

export { getAll, getOne, createOne, updateOne, deleteOne };
