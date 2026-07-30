import { deleteDocument } from "@/lib/actions/documents";
import { SubmitButton } from "@/app/submit-button";

export type DocumentItem = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
  signedUrl: string | null;
};

function formatFileSize(bytes: number | null) {
  if (bytes === null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  items,
  target,
}: {
  items: DocumentItem[];
  target: { jobId?: string; clientId?: string };
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No documents yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {items.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-3 p-3 text-sm"
        >
          <div className="flex flex-col">
            {doc.signedUrl ? (
              <a
                href={doc.signedUrl}
                download={doc.file_name}
                className="font-medium text-zinc-900 hover:underline"
              >
                {doc.file_name}
              </a>
            ) : (
              <span className="font-medium text-zinc-900">{doc.file_name}</span>
            )}
            <span className="text-xs text-zinc-500">
              {[
                formatFileSize(doc.file_size),
                new Date(doc.uploaded_at).toLocaleDateString(),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <form action={deleteDocument.bind(null, doc.id, doc.file_path, target)}>
            <SubmitButton
              pendingText="Deleting…"
              className="text-xs text-zinc-500 hover:text-red-600"
            >
              Delete
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
