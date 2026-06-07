const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "pdf", "txt", "json", "csv", "docx", "xlsx", "pptx"];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/json",
  "text/csv",
  "application/octet-stream",
  "application/zip", // Windows sometimes reports Office files as this
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const isValidFile = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);
};