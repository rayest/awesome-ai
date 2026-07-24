import NewOperationPage from "@/app/dictionary/operations/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function OperationDrawerPage() {
  return (
    <RouteDrawer title="新增工序" description="维护生产工序和标准工价">
      <NewOperationPage />
    </RouteDrawer>
  );
}
