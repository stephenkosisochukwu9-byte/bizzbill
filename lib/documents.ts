export type SavedDocument = {
  id: string;
  type: "Invoice" | "Receipt";
  customerName: string;
  documentNumber: string;
  date: string;
  total: number;
};

const STORAGE_KEY = "bizzbill_documents";

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const documents = JSON.parse(saved);

    return Array.isArray(documents)
      ? documents
      : [];
  } catch (error) {
    console.error(
      "Unable to load documents:",
      error
    );

    return [];
  }
}

export function saveDocument(
  document: SavedDocument
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const documents = getSavedDocuments();

    const updatedDocuments = [
      document,
      ...documents.filter(
        (item) => item.id !== document.id
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedDocuments)
    );
  } catch (error) {
    console.error(
      "Unable to save document:",
      error
    );
  }
}

export function deleteDocument(
  id: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const documents = getSavedDocuments();

    const updatedDocuments =
      documents.filter(
        (document) => document.id !== id
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedDocuments)
    );
  } catch (error) {
    console.error(
      "Unable to delete document:",
      error
    );
  }
}
