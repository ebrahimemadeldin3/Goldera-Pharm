import type { CreateRequestDto } from "../lib/types";
import { capitalizeFirstLetter } from "../lib/utils";

export function buildCreateRequestPayload(
  data: CreateRequestDto,
): CreateRequestDto {
  const payload: CreateRequestDto = {
    title: data.title,
    subject: data.subject,
    description: data.description,
    type: data.type.toUpperCase() as CreateRequestDto["type"],
    urgency: capitalizeFirstLetter(data.urgency) as CreateRequestDto["urgency"],
  };

  if (payload.type === "EXPENSE" || payload.type === "MARKETING") {
    payload.doctorIds = (data.doctorIds ?? []).filter(
      (doctorId): doctorId is string => Boolean(doctorId),
    );
    payload.budget =
      data.budget == null || Number.isNaN(Number(data.budget))
        ? undefined
        : Number(data.budget);
  }

  if (payload.type === "SAMPLE") {
    payload.sampleData = (data.sampleData ?? []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      amount: Number(item.amount),
    }));
    payload.productIds = payload.sampleData
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id));
  }

  if (payload.type === "LEAVE") {
    payload.leaveType = data.leaveType;
    payload.leaveStartDate = data.leaveStartDate;
    payload.leaveEndDate = data.leaveEndDate;
  }

  if (payload.type === "PERSONAL_EXPENSE") {
    payload.visitedCity = data.visitedCity;
    payload.visitDaysCount = data.visitDaysCount;
    payload.totalExpenseData = (data.totalExpenseData ?? [])
      .map((item) => ({
        name: item.name,
        amount: Number(item.amount),
      }))
      .filter((item) => Boolean(item.name) && Number(item.amount) >= 0);
    payload.totalExpenseAmount =
      data.totalExpenseAmount ??
      payload.totalExpenseData.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );
  }

  return payload;
}

export function appendCreateRequestFields(
  fd: FormData,
  payload: CreateRequestDto,
) {
  fd.append("title", payload.title);
  fd.append("subject", payload.subject);
  fd.append("description", payload.description);
  fd.append("type", payload.type);
  fd.append("urgency", payload.urgency);

  if (payload.type === "EXPENSE" || payload.type === "MARKETING") {
    const doctorIds = payload.doctorIds ?? [];

    doctorIds.forEach((doctorId) => {
      fd.append("doctorIds", doctorId);
      fd.append("doctorIds[]", doctorId);
    });
    fd.append("doctorIdsJson", JSON.stringify(doctorIds));

    if (payload.budget != null) {
      fd.append("budget", String(payload.budget));
    }
  }

  if (payload.type === "SAMPLE") {
    const sampleData = (payload.sampleData ?? []).filter(
      (item) => Boolean(item.productId) && Number(item.amount) > 0,
    );

    const productIds = Array.from(
      new Set(
        [
          ...(payload.productIds ?? []),
          ...sampleData.map((item) => item.productId),
        ].filter((id): id is string => Boolean(id)),
      ),
    );

    fd.append("sampleData", JSON.stringify(sampleData));
    fd.append("sampleDataJson", JSON.stringify(sampleData));

    // Keep "productIds" as a JSON array string to support parsers that
    // expect req.body.productIds to be JSON parseable.
    fd.append("productIds", JSON.stringify(productIds));
    fd.append("productIdsJson", JSON.stringify(productIds));

    // Also provide repeated-array style keys for backends that parse arrays from repeated fields.
    productIds.forEach((productId) => {
      fd.append("productIds[]", productId);
      fd.append("productId", productId);
    });

    sampleData.forEach((item, index) => {
      fd.append(`sampleData[${index}][productId]`, item.productId);
      fd.append(`sampleData[${index}][productName]`, item.productName);
      fd.append(`sampleData[${index}][amount]`, String(item.amount));
    });
  }

  if (payload.type === "LEAVE") {
    if (payload.leaveType) {
      fd.append("leaveType", payload.leaveType);
    }
    if (payload.leaveStartDate) {
      fd.append("leaveStartDate", payload.leaveStartDate);
    }
    if (payload.leaveEndDate) {
      fd.append("leaveEndDate", payload.leaveEndDate);
    }
  }

  if (payload.type === "PERSONAL_EXPENSE") {
    const totalExpenseData = payload.totalExpenseData ?? [];
    const personalExpenseItems = totalExpenseData.map((item) => ({
      amount: Number(item.amount),
    }));

    if (payload.visitedCity) {
      fd.append("visitedCity", payload.visitedCity);
      fd.append("visitCity", payload.visitedCity);
    }
    if (payload.visitDaysCount != null) {
      fd.append("visitDaysCount", String(payload.visitDaysCount));
    }
    if (payload.totalExpenseAmount != null) {
      fd.append("totalExpenseAmount", String(payload.totalExpenseAmount));
    }

    // Canonical keys first; extra fallback shapes are handled in API action retries.
    fd.append("totalExpenseData", JSON.stringify(totalExpenseData));
    fd.append("totalExpenseDataJson", JSON.stringify(totalExpenseData));
    fd.append("personalExpenseItems", JSON.stringify(personalExpenseItems));
    fd.append("personalExpenseItemsJson", JSON.stringify(personalExpenseItems));
  }
}

export function appendRequestFiles(
  fd: FormData,
  files?: {
    invoice?: File;
    medicalReport?: File;
    personalExpenseInvoices?: (File | null)[];
  },
) {
  if (files?.invoice) {
    fd.append("pdfs", files.invoice);
  }
  if (files?.medicalReport) {
    fd.append("pdfs", files.medicalReport);
  }
  files?.personalExpenseInvoices?.forEach((file) => {
    if (file) {
      fd.append("pdfs", file);
    }
  });
}
