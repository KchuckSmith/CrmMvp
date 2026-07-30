import { uploadDocument } from "@/lib/actions/documents";
import { inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function DocumentForm({
  target,
}: {
  target: { jobId?: string; clientId?: string };
}) {
  const action = uploadDocument.bind(null, target);

  return (
    <form action={action} className="flex gap-2">
      <input name="file" type="file" required className={`flex-1 ${inputClass}`} />
      <SubmitButton
        pendingText="Uploading…"
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
      >
        Upload
      </SubmitButton>
    </form>
  );
}
