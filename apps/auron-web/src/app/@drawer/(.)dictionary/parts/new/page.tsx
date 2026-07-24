import NewPartPage from "@/app/dictionary/parts/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function PartDrawerPage() {
  return (
    <RouteDrawer title="新增测量部位" description="补充尺寸要求使用的标准测量项">
      <NewPartPage />
    </RouteDrawer>
  );
}
