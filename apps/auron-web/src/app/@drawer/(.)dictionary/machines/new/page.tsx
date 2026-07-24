import NewMachinePage from "@/app/dictionary/machines/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function MachineDrawerPage() {
  return (
    <RouteDrawer title="新增机型配置" description="补充车间机型、针数和参考转速">
      <NewMachinePage />
    </RouteDrawer>
  );
}
