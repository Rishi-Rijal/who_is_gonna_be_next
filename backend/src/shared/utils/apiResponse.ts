import { Response } from "express";

interface ApiResponseOptions {
  message?: string;
  statusCode?: number;
}

export const apiResponse = {
  success<T>(res: Response, data: T, options: ApiResponseOptions = {}) {
    const { message = "Success", statusCode = 200 } = options;
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  created<T>(
    res: Response,
    data: T,
    options: Omit<ApiResponseOptions, "statusCode"> = {},
  ) {
    return apiResponse.success(res, data, {
      ...options,
      statusCode: 201,
      message: options.message ?? "Created",
    });
  },

  noContent(res: Response) {
    return res.status(204).send();
  },
};
