const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/json",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
];

export const isValidFile = (file: File) => {
  return ALLOWED_TYPES.includes(file.type);
};