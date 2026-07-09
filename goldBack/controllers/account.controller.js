// import { prisma } from "../config/db.js";
// import { ApiError } from "../utils/apiError.js";

// const addAccount = async (req, res, next) => {
//   try {
//     const account = await prisma.account.createMany({ data: req.body });
//     res.status(201).json({
//       status: "success",
//       message: "Data created successfully",
//       data: account,
//     });
//   } catch (error) {
//     console.error(error);
//     next(new ApiError("Failed to create account", 500));
//   }
// };

// const getAllAccounts = async (req, res, next) => {
//   try {
//     const accounts = await prisma.account.findMany({
//       include: {
//         doctors: {
//           select: {
//             id: true,
//             name: true,
//             phone: true,
//           },
//         },
//       },
//     });
//     res.status(200).json({
//       status: "success",
//       message: "Data fetched successfully",
//       results: accounts.length,
//       data: accounts,
//     });
//   } catch (error) {
//     console.error(error);
//     next(new ApiError("Failed to fetch accounts", 500));
//   }
// };

// export { addAccount, getAllAccounts };
