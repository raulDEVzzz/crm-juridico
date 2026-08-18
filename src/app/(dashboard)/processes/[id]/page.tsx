import { notFound } from "next/navigation";

import { getProcessById } from "@/actions/processes";
import { ProcessDetailTabs } from "@/components/processes/process-detail-tabs";

interface ProcessDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProcessDetailPage({
  params,
}: ProcessDetailPageProps) {
  const { id } = await params;
  const process = await getProcessById(id);

  if (!process) {
    notFound();
  }

  return <ProcessDetailTabs process={process} />;
}
