import NewContactPage from "@/app/crm/contacts/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function ContactDrawerPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  return (
    <RouteDrawer title="新增联系人" description="补充客户侧的对接人和联系方式">
      <NewContactPage searchParams={searchParams} />
    </RouteDrawer>
  );
}
