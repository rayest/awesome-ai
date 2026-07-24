import NewComponentPage from "@/app/dictionary/components/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function ComponentDrawerPage() {
  return (
    <RouteDrawer title="新增部件" description="补充产品结构和工艺拆分使用的部件">
      <NewComponentPage />
    </RouteDrawer>
  );
}
