import NewTrimPage from "@/app/dictionary/trims/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function TrimDrawerPage() {
  return (
    <RouteDrawer title="新增辅料" description="补充打样和报价使用的标准辅料">
      <NewTrimPage />
    </RouteDrawer>
  );
}
